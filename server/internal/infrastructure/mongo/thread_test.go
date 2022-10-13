package mongo

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
)

func TestThread_Filtered(t *testing.T) {
	wid := id.NewWorkspaceID()
	th1 := thread.New().NewID().Workspace(wid).MustBuild()
	th2 := thread.New().NewID().Workspace(wid).MustBuild()

	tests := []struct {
		name    string
		seeds   []*thread.Thread
		filter  repo.WorkspaceFilter
		wantErr error
	}{
		{
			name:  "workspaces operation denied",
			seeds: []*thread.Thread{th1, th2},
			filter: repo.WorkspaceFilter{
				Readable: []id.WorkspaceID{},
				Writable: []id.WorkspaceID{},
			},
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:  "workspaces operation success",
			seeds: []*thread.Thread{th1, th2},
			filter: repo.WorkspaceFilter{
				Readable: []id.WorkspaceID{wid},
				Writable: []id.WorkspaceID{wid},
			},
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewThread(client).Filtered(tc.filter)
			ctx := context.Background()
			for _, th := range tc.seeds {
				err := r.Save(ctx, th)
				assert.ErrorIs(t, err, tc.wantErr)
			}
		})
	}
}

func TestThread_AddComment(t *testing.T) {
	c1 := thread.Comment{}
	cid1 := id.NewCommentID()
	c1.SetID(cid1)

	wid := id.NewWorkspaceID()
	th1 := thread.New().NewID().Workspace(wid).Comments([]*thread.Comment{}).MustBuild()

	tests := []struct {
		name    string
		seed    *thread.Thread
		arg     *thread.Comment
		filter  *repo.WorkspaceFilter
		wantErr error
	}{
		{
			name: "workspaces operation denied",
			seed: th1,
			filter: &repo.WorkspaceFilter{
				Readable: []id.WorkspaceID{},
				Writable: []id.WorkspaceID{},
			},
			wantErr: repo.ErrOperationDenied,
		},
		{
			name: "workspaces operation success",
			seed: th1,
			filter: &repo.WorkspaceFilter{
				Readable: []id.WorkspaceID{wid},
				Writable: []id.WorkspaceID{wid},
			},
			wantErr: nil,
		},
		// {
		// 	name: "add comment success",
		// 	seed: th1,
		// 	filter: &repo.WorkspaceFilter{
		// 		Readable: []id.WorkspaceID{wid},
		// 		Writable: []id.WorkspaceID{wid},
		// 	},
		// 	arg:     &c1,
		// 	wantErr: nil,
		// },
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))

			r := NewThread(client).Filtered(*tc.filter)
			ctx := context.Background()

			err := r.Save(ctx, tc.seed.Clone())
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			}

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			err1 := r.AddComment(ctx, tc.seed, tc.arg)
			assert.NoError(t, err1)

			if tc.arg != nil {
				th, err := r.FindByID(ctx, tc.seed.ID())
				assert.NoError(t, err)
				assert.Equal(t, 1, len(th.Comments()))
				assert.True(t, th.HasComment(tc.arg.ID()))
			}
		})
	}
}

func TestThread_UpdateComment(t *testing.T) {
	c1 := thread.Comment{}
	cid1 := id.NewCommentID()
	c1.SetID(cid1)

	c2 := thread.Comment{}
	cid2 := id.NewCommentID()
	c2.SetID(cid2)
	c2.SetContent("test")

	wid := id.NewWorkspaceID()
	th1 := thread.New().NewID().Workspace(wid).Comments([]*thread.Comment{&c1, &c2}).MustBuild()

	tests := []struct {
		name         string
		seed         *thread.Thread
		arg          string
		filter       *repo.WorkspaceFilter
		want         *thread.Comment
		wantErr      error
		mockNotFound bool
	}{
		{
			name: "workspaces operation denied",
			seed: th1,
			filter: &repo.WorkspaceFilter{
				Readable: []id.WorkspaceID{},
				Writable: []id.WorkspaceID{},
			},
			wantErr: repo.ErrOperationDenied,
		},
		// {
		// 	name: "workspaces operation success",
		// 	seed: th1,
		// 	filter: &repo.WorkspaceFilter{
		// 		Readable: []id.WorkspaceID{wid},
		// 		Writable: []id.WorkspaceID{wid},
		// 	},
		// 	wantErr: nil,
		// },
		// {
		// 	name:    "update comment success",
		// 	seed:    th1,
		// 	arg:     "updated",
		// 	wantErr: nil,
		// },
		{
			name:         "update comment not found",
			seed:         th1,
			wantErr:      repo.ErrCommentNotFound,
			mockNotFound: true,
		},
	}

	init := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(init(t))

			r := NewThread(client)
			ctx := context.Background()

			err := r.Save(ctx, tc.seed.Clone())
			assert.NoError(t, err)

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			for _, c := range tc.seed.Comments() {
				c.SetContent(tc.arg)
				if tc.mockNotFound {
					c = &thread.Comment{}
				}
				got, err := r.UpdateComment(ctx, tc.seed, c)
				if tc.wantErr != nil {
					assert.Equal(t, tc.wantErr, err)
					return
				}
				assert.Equal(t, tc.arg, got.Content())
			}
		})
	}
}

func TestThread_DeleteComment(t *testing.T) {
	c1 := thread.Comment{}
	cid1 := id.NewCommentID()
	c1.SetID(cid1)

	wid := id.NewWorkspaceID()
	th1 := thread.New().NewID().Workspace(wid).Comments([]*thread.Comment{&c1}).MustBuild()

	tests := []struct {
		name    string
		seed    *thread.Thread
		arg     id.CommentID
		filter  *repo.WorkspaceFilter
		wantErr error
	}{
		{
			name: "workspaces operation denied",
			seed: th1,
			filter: &repo.WorkspaceFilter{
				Readable: []id.WorkspaceID{},
				Writable: []id.WorkspaceID{},
			},
			wantErr: repo.ErrOperationDenied,
		},
		{
			name: "workspaces operation success",
			seed: th1,
			filter: &repo.WorkspaceFilter{
				Readable: []id.WorkspaceID{wid},
				Writable: []id.WorkspaceID{wid},
			},
			wantErr: nil,
		},
		{
			name:    "delete comment success",
			seed:    th1,
			arg:     c1.ID(),
			wantErr: nil,
		},
	}

	init := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(init(t))

			r := NewThread(client)
			ctx := context.Background()

			err := r.Save(ctx, tc.seed.Clone())
			assert.NoError(t, err)

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			err1 := r.DeleteComment(ctx, tc.seed, tc.arg)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err1)
				return
			}
		})
	}
}
