package memory

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/stretchr/testify/assert"
)

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
			name:         "update comment not found",
			seed:         th1,
			wantErr:      repo.ErrCommentNotFound,
			mockNotFound: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewThread()
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
