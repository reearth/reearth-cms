package mongo

import (
	"context"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
)

func Test_ModelRepo_Filtered(t *testing.T) {
	mocknow := time.Now().Truncate(time.Millisecond).UTC()
	pid1 := id.NewProjectID()
	id1 := id.NewModelID()
	id2 := id.NewModelID()
	sid1 := id.NewSchemaID()
	sid2 := id.NewSchemaID()
	k := key.New("T123456")
	m1 := model.New().ID(id1).Project(pid1).Schema(sid1).Key(k).UpdatedAt(mocknow).MustBuild()
	m2 := model.New().ID(id2).Project(pid1).Schema(sid2).Key(k).UpdatedAt(mocknow).MustBuild()

	tests := []struct {
		name    string
		seeds   model.List
		arg     repo.ProjectFilter
		wantErr error
	}{
		{
			name: "no r/w workspaces operation denied",
			seeds: model.List{
				m1,
				m2,
			},
			arg: repo.ProjectFilter{
				Readable: []id.ProjectID{},
				Writable: []id.ProjectID{},
			},
			wantErr: repo.ErrOperationDenied,
		},
		{
			name: "r/w workspaces operation success",
			seeds: model.List{
				m1,
				m2,
			},
			arg: repo.ProjectFilter{
				Readable: []id.ProjectID{pid1},
				Writable: []id.ProjectID{pid1},
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

			r := NewModel(client).Filtered(tc.arg)
			ctx := context.Background()
			for _, p := range tc.seeds {
				err := r.Save(ctx, p)
				assert.ErrorIs(t, err, tc.wantErr)
			}
		})
	}
}
