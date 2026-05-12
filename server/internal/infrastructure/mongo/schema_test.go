package mongo

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
)

func TestSchemaRepo_SaveAll(t *testing.T) {
	wid1 := accountdomain.NewWorkspaceID()
	wid2 := accountdomain.NewWorkspaceID()

	s1 := schema.New().NewID().Workspace(wid1).Project(id.NewProjectID()).MustBuild()
	s2 := schema.New().NewID().Workspace(wid1).Project(id.NewProjectID()).MustBuild()
	sBad := schema.New().NewID().Workspace(wid2).Project(id.NewProjectID()).MustBuild()

	tests := []struct {
		name    string
		seeds   schema.List
		filter  repo.WorkspaceFilter
		wantErr error
	}{
		{
			name:  "saves all schemas",
			seeds: schema.List{s1, s2},
			filter: repo.WorkspaceFilter{
				Readable: id.WorkspaceIDList{wid1},
				Writable: id.WorkspaceIDList{wid1},
			},
			wantErr: nil,
		},
		{
			name:  "operation denied when workspace not writable",
			seeds: schema.List{sBad},
			filter: repo.WorkspaceFilter{
				Readable: id.WorkspaceIDList{wid1},
				Writable: id.WorkspaceIDList{wid1},
			},
			wantErr: repo.ErrOperationDenied,
		},
		{
			name:    "empty list is a no-op",
			seeds:   schema.List{},
			filter:  repo.WorkspaceFilter{},
			wantErr: nil,
		},
	}

	initDB := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := mongox.NewClientWithDatabase(initDB(t))
			r := NewSchema(client).Filtered(tc.filter)
			ctx := context.Background()

			err := r.SaveAll(ctx, tc.seeds)
			assert.ErrorIs(t, err, tc.wantErr)

			if tc.wantErr == nil {
				for _, s := range tc.seeds {
					if s == nil {
						continue
					}
					got, err := r.FindByID(ctx, s.ID())
					assert.NoError(t, err)
					assert.Equal(t, s.ID(), got.ID())
				}
			}
		})
	}
}
