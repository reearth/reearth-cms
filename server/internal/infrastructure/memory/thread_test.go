package memory

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestThread_Filtered(t *testing.T) {
	r := &Thread{}
	wid := id.NewWorkspaceID()

	assert.Equal(t, &Thread{
		f: repo.WorkspaceFilter{
			Readable: id.WorkspaceIDList{wid},
			Writable: nil,
		},
	}, r.Filtered(repo.WorkspaceFilter{
		Readable: id.WorkspaceIDList{wid},
		Writable: nil,
	}))
}

func TestThreadRepo_FindByID(t *testing.T) {
	tid1 := id.NewWorkspaceID()
	id1 := id.NewThreadID()
	p1 := thread.New().ID(id1).Workspace(tid1).MustBuild()
	tests := []struct {
		name    string
		seeds   thread.List
		arg     id.ThreadID
		filter  *repo.WorkspaceFilter
		want    *thread.Thread
		wantErr error
		mockErr bool
	}{
		{
			name:    "Not found in empty db",
			seeds:   thread.List{},
			arg:     id.NewThreadID(),
			filter:  nil,
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Not found",
			seeds: thread.List{
				thread.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     id.NewThreadID(),
			filter:  nil,
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Found 1",
			seeds: thread.List{
				p1,
			},
			arg:     id1,
			filter:  nil,
			want:    p1,
			wantErr: nil,
		},
		{
			name: "Found 2",
			seeds: thread.List{
				p1,
				thread.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				thread.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     id1,
			filter:  nil,
			want:    p1,
			wantErr: nil,
		},
		{
			name: "Filtered Found 0",
			seeds: thread.List{
				p1,
				thread.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				thread.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     id1,
			filter:  &repo.WorkspaceFilter{Readable: []id.WorkspaceID{id.NewWorkspaceID()}, Writable: []id.WorkspaceID{}},
			want:    nil,
			wantErr: nil,
		},
		{
			name: "Filtered Found 2",
			seeds: thread.List{
				p1,
				thread.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				thread.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     id1,
			filter:  &repo.WorkspaceFilter{Readable: []id.WorkspaceID{tid1}, Writable: []id.WorkspaceID{}},
			want:    p1,
			wantErr: nil,
		},
		{
			name:    "must mock error",
			wantErr: errors.New("test"),
			mockErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewThread()
			if tc.mockErr {
				SetThreadError(r, tc.wantErr)
			}

			ctx := context.Background()
			for _, th := range tc.seeds {
				err := r.Save(ctx, th.Clone())
				assert.Nil(t, err)
			}

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			got, err := r.FindByID(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}
			assert.Equal(t, tc.want, got)
		})
	}
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
		mockErr bool
	}{
		{
			name: "workspaces operation denied",
			seed: th1,
			filter: &repo.WorkspaceFilter{
				Readable: []id.WorkspaceID{},
				Writable: []id.WorkspaceID{},
			},
			arg:     c1,
			wantErr: repo.ErrOperationDenied,
		},
		{
			name: "workspaces operation success",
			seed: th1,
			filter: &repo.WorkspaceFilter{
				Readable: []id.WorkspaceID{wid},
				Writable: []id.WorkspaceID{wid},
			},
			arg:     c1,
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
		{
			name:    "must mock error",
			wantErr: errors.New("test"),
			arg:     c1,
			mockErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewThread()
			if tc.mockErr {
				SetThreadError(r, tc.wantErr)
			}

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
		mockErr      bool
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
		{
			name:    "must mock error",
			seed:    th1,
			wantErr: errors.New("test"),
			mockErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewThread()
			if tc.mockErr {
				SetThreadError(r, tc.wantErr)
			}

			ctx := context.Background()

			thread := tc.seed.Clone()
			_ = r.Save(ctx, thread)

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			comment := thread.Comments()[0]

			if err := r.UpdateComment(ctx, thread, comment.ID(), tc.arg); tc.wantErr != nil {
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
		mockErr bool
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
		{
			name:    "must mock error",
			wantErr: errors.New("test"),
			seed:    th1,
			mockErr: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewThread()
			if tc.mockErr {
				SetThreadError(r, tc.wantErr)
			}

			ctx := context.Background()

			seed := tc.seed.Clone()
			_ = r.Save(ctx, seed)

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

func TestThreadRepo_Save(t *testing.T) {
	wid1 := id.NewWorkspaceID()
	id1 := id.NewThreadID()
	th1 := thread.New().ID(id1).Workspace(wid1).MustBuild()

	tests := []struct {
		name    string
		seeds   thread.List
		arg     *thread.Thread
		filter  *repo.WorkspaceFilter
		want    *thread.Thread
		wantErr error
	}{
		{
			name: "Save succeed",
			seeds: thread.List{
				th1,
			},
			arg:     th1,
			want:    th1,
			wantErr: nil,
		},
		{
			name: "Filtered operation error",
			seeds: thread.List{
				th1,
				thread.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				thread.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     th1,
			filter:  &repo.WorkspaceFilter{Readable: []id.WorkspaceID{}, Writable: []id.WorkspaceID{}},
			want:    nil,
			wantErr: repo.ErrOperationDenied,
		},
		{
			name: "Filtered succeed",
			seeds: thread.List{
				th1,
				thread.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
				thread.New().NewID().Workspace(id.NewWorkspaceID()).MustBuild(),
			},
			arg:     th1,
			filter:  &repo.WorkspaceFilter{Readable: []id.WorkspaceID{wid1}, Writable: []id.WorkspaceID{wid1}},
			want:    th1,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			r := NewThread()
			ctx := context.Background()

			if tc.filter != nil {
				r = r.Filtered(*tc.filter)
			}

			for _, th := range tc.seeds {
				err := r.Save(ctx, th)
				if tc.wantErr != nil {
					assert.ErrorIs(t, err, tc.wantErr)
					return
				}
			}

			err := r.Save(ctx, tc.arg)
			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
				return
			}
		})
	}
}
