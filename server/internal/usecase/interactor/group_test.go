package interactor

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestGroup_CheckKey(t *testing.T) {
	t.Parallel()
	pId := id.NewProjectID()
	g := group.New().NewID().Key(id.NewKey("test123")).Project(pId).Schema(id.NewSchemaID()).MustBuild()
	repoErr := errors.New("test")

	tests := []struct {
		name    string
		seeds   group.List
		repoErr error
		pId     id.ProjectID
		key     string
		want    bool
		wantErr error
	}{
		{
			name: "must accept a free key",
			pId:  pId,
			key:  "test123",
			want: true,
		},
		{
			name:  "must reject a key used in the project",
			seeds: group.List{g},
			pId:   pId,
			key:   "test123",
		},
		{
			name:  "must accept a key used in another project",
			seeds: group.List{g},
			pId:   id.NewProjectID(),
			key:   "test123",
			want:  true,
		},
		{
			name:    "must reject an empty key",
			pId:     pId,
			key:     "",
			wantErr: id.ErrInvalidKey,
		},
		{
			name:    "must return a repo error",
			repoErr: repoErr,
			pId:     pId,
			key:     "test123",
			wantErr: repoErr,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			for _, s := range tc.seeds {
				assert.NoError(t, db.Group.Save(ctx, s.Clone()))
			}
			if tc.repoErr != nil {
				memory.SetGroupError(db.Group, tc.repoErr)
			}

			got, err := NewGroup(db, nil).CheckKey(ctx, tc.pId, tc.key)
			assert.Equal(t, tc.wantErr, err)
			assert.Equal(t, tc.want, got)
		})
	}
}
