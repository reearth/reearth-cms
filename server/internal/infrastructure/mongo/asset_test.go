package mongo

import (
	"context"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFindByID(t *testing.T) {
	f := &asset.File{}
	tests := []struct {
		Name     string
		Expected struct {
			Name  string
			Asset *asset.Asset
		}
	}{
		{
			Expected: struct {
				Name  string
				Asset *asset.Asset
			}{
				Asset: asset.New().
					NewID().
					Project(id.NewProjectID()).
					CreatedBy(id.NewUserID()).
					CreatedAt(time.Now()).
					FileName("name").
					Size(10).
					Type(lo.ToPtr(asset.PreviewTypeGEO)).
					File(f).
					Hash("https://reearth.io/").
					MustBuild(),
			},
		},
	}

	init := connect(t)

	for _, tc := range tests {
		tc := tc

		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			client := init(t)

			repo := NewAsset(client)
			ctx := context.Background()
			err := repo.Save(ctx, tc.Expected.Asset)
			assert.NoError(t, err)

			got, err := repo.FindByID(ctx, tc.Expected.Asset.ID())
			assert.NoError(t, err)
			assert.Equal(t, tc.Expected.Asset.ID(), got.ID())
			assert.Equal(t, tc.Expected.Asset.Project(), got.Project())
			assert.Equal(t, tc.Expected.Asset.CreatedBy(), got.CreatedBy())
			assert.Equal(t, tc.Expected.Asset.CreatedAt(), got.CreatedAt())
			assert.Equal(t, tc.Expected.Asset.FileName(), got.FileName())
			assert.Equal(t, tc.Expected.Asset.Size(), got.Size())
			assert.Equal(t, tc.Expected.Asset.File(), got.File())
			assert.Equal(t, tc.Expected.Asset.PreviewType(), got.PreviewType())
			assert.Equal(t, tc.Expected.Asset.Hash(), got.Hash())
		})
	}
}
