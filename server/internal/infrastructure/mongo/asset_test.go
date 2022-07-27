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
					CreatedAt(time.Now()).
					CreatedBy(id.NewUserID()).
					Project(id.NewProjectID()).
					FileName("name").
					Size(10).
					Hash("hxxps://https://reearth.io/").
					Type(asset.PreviewTypeFromRef(lo.ToPtr(""))).
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
			assert.Equal(t, tc.Expected.Asset.CreatedAt(), got.CreatedAt())
			assert.Equal(t, tc.Expected.Asset.CreatedBy(), got.CreatedBy())
			assert.Equal(t, tc.Expected.Asset.Project(), got.Project())
			assert.Equal(t, tc.Expected.Asset.Hash(), got.Hash())
			assert.Equal(t, tc.Expected.Asset.Size(), got.Size())
			assert.Equal(t, tc.Expected.Asset.FileName(), got.FileName())
			assert.Equal(t, tc.Expected.Asset.PreviewType(), got.PreviewType())
		})
	}
}
