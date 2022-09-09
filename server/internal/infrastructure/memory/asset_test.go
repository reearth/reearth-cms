package memory

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
)

func TestAssetRepo_FindByID(t *testing.T) {
	pid1 := id.NewProjectID()
	uid1 := id.NewUserID()
	id1 := id.NewAssetID()
	a1 := asset.New().ID(id1).Project(pid1).CreatedBy(uid1).Size(1000).MustBuild()
	tests := []struct {
		name    string
		seeds   []*asset.Asset
		arg     id.AssetID
		want    *asset.Asset
		wantErr error
		mockErr bool
	}{
		{
			name:    "Not found in empty db",
			seeds:   []*asset.Asset{},
			arg:     id.NewAssetID(),
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Not found",
			seeds: []*asset.Asset{
				asset.New().NewID().Project(pid1).CreatedBy(uid1).Size(1000).MustBuild(),
			},
			arg:     id.NewAssetID(),
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "Found 1",
			seeds: []*asset.Asset{
				a1,
			},
			arg:     id1,
			want:    a1,
			wantErr: nil,
		},
		{
			name: "Found 2",
			seeds: []*asset.Asset{
				a1,
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).MustBuild(),
				asset.New().NewID().Project(id.NewProjectID()).CreatedBy(id.NewUserID()).Size(1000).MustBuild(),
			},
			arg:     id1,
			want:    a1,
			wantErr: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			r := NewAsset()
			ctx := context.Background()

			for _, a := range tc.seeds {
				err := r.Save(ctx, a.Clone())
				assert.Nil(t, err)
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
