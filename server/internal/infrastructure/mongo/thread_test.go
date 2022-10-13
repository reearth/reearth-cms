package mongo

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestThread_Filtered(t *testing.T) {
	r := &threadRepo{}
	wid := id.NewWorkspaceID()

	assert.Equal(t, &threadRepo{
		f: repo.WorkspaceFilter{
			Readable: id.WorkspaceIDList{wid},
			Writable: nil,
		},
	}, r.Filtered(repo.WorkspaceFilter{
		Readable: id.WorkspaceIDList{wid},
		Writable: nil,
	}))
}

func TestThread_AddComment(t *testing.T) {
	c1 := thread.NewComment(thread.NewCommentID(), id.NewUserID(), "aaa")
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
		{
			name: "add comment success",
			seed: th1,
			filter: &repo.WorkspaceFilter{
				Readable: []id.WorkspaceID{wid},
				Writable: []id.WorkspaceID{wid},
			},
			arg:     c1,
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))
			r := NewThread(client)

			ctx := context.Background()
			_ = r.Save(ctx, tc.seed.Clone())

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			err := r.AddComment(ctx, tc.seed, tc.arg)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			} else {
				assert.NoError(t, err)
			}

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
	c1 := thread.NewComment(thread.NewCommentID(), id.NewUserID(), "aaa")
	c2 := thread.NewComment(thread.NewCommentID(), id.NewUserID(), "test")
	wid := id.NewWorkspaceID()
	th1 := thread.New().NewID().Workspace(wid).Comments([]*thread.Comment{c1, c2}).MustBuild()

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
			name:    "update comment success",
			seed:    th1,
			arg:     "updated",
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

			thread := tc.seed.Clone()
			err := r.Save(ctx, thread)
			assert.NoError(t, err)

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			comment := thread.Comments()[0]
			comment.SetContent(tc.arg)

			if err := r.UpdateComment(ctx, thread, comment); tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			} else {
				assert.NoError(t, err)
			}

			thread2, _ := r.FindByID(ctx, thread.ID())
			assert.Equal(t, tc.arg, thread2.Comments()[0].Content())
		})
	}
}

func TestThread_DeleteComment(t *testing.T) {
	c1 := thread.NewComment(thread.NewCommentID(), id.NewUserID(), "aaa")
	c2 := thread.NewComment(thread.NewCommentID(), id.NewUserID(), "bbb")
	wid := id.NewWorkspaceID()
	th1 := thread.New().NewID().Workspace(wid).Comments([]*thread.Comment{c1, c2}).MustBuild()

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

			seed := tc.seed.Clone()
			err := r.Save(ctx, seed)
			assert.NoError(t, err)

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			commentID := seed.Comments()[0].ID()
			if err := r.DeleteComment(ctx, seed, commentID); tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				return
			} else {
				assert.NoError(t, err)
			}

			thread2, _ := r.FindByID(ctx, seed.ID())
			assert.Equal(t, len(seed.Comments())-1, len(thread2.Comments()))
			assert.False(t, lo.ContainsBy(thread2.Comments(), func(c *thread.Comment) bool { return c.ID() == commentID }))
		})
	}
}
