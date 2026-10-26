package workspacesettings

import (
	"testing"

	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
)

func TestWorkspaceSettings_Validate(t *testing.T) {
	t.Parallel()
	tile := func(rid ResourceID, tt TileType) *TileResource {
		return NewTileResource(rid, tt, UrlResourceProps{})
	}
	terrain := func(rid ResourceID, tt TerrainType) *TerrainResource {
		return NewTerrainResource(rid, tt, CesiumResourceProps{})
	}
	validTile := NewResource(ResourceTypeTile, tile(NewResourceID(), TileTypeURL), nil)
	validTerrain := NewResource(ResourceTypeTerrain, nil, terrain(NewResourceID(), TerrainTypeCesiumIon))
	// settings bypasses the builder, which rejects invalid resources
	settings := func(tiles, terrains []*Resource) *WorkspaceSettings {
		return &WorkspaceSettings{
			id:       accountdomain.NewWorkspaceID(),
			tiles:    NewResourceList(tiles, nil, nil),
			terrains: NewResourceList(terrains, nil, nil),
		}
	}

	tests := []struct {
		name string
		args *WorkspaceSettings
		want error
	}{
		{name: "must accept valid resources", args: settings([]*Resource{validTile}, []*Resource{validTerrain})},
		{name: "must accept settings without lists", args: New().ID(accountdomain.NewWorkspaceID()).MustBuild()},
		{name: "must reject nil settings", want: rerror.ErrInvalidParams},
		{name: "must reject a nil resource", args: settings([]*Resource{validTile, nil}, nil), want: ErrInvalidResource},
		{
			name: "must reject an unknown tile type",
			args: settings([]*Resource{NewResource(ResourceTypeTile, tile(NewResourceID(), "unknown"), nil)}, nil),
			want: ErrInvalidResource,
		},
		{
			name: "must reject an empty terrain type",
			args: settings(nil, []*Resource{NewResource(ResourceTypeTerrain, nil, terrain(NewResourceID(), ""))}),
			want: ErrInvalidResource,
		},
		{
			name: "must reject a zero resource ID",
			args: settings([]*Resource{NewResource(ResourceTypeTile, tile(ResourceID{}, TileTypeURL), nil)}, nil),
			want: ErrInvalidResource,
		},
		{
			name: "must reject a resource without a tile or a terrain",
			args: settings([]*Resource{NewResource(ResourceTypeTile, nil, nil)}, nil),
			want: ErrInvalidResource,
		},
		{
			name: "must reject a resource with both a tile and a terrain",
			args: settings(nil, []*Resource{NewResource(ResourceTypeTerrain, tile(NewResourceID(), TileTypeURL), terrain(NewResourceID(), TerrainTypeCesiumIon))}),
			want: ErrInvalidResource,
		},
		{
			name: "must reject a terrain in the tiles",
			args: settings([]*Resource{validTile, validTerrain}, nil),
			want: ErrInvalidResource,
		},
		{
			name: "must reject a tile in the terrains",
			args: settings(nil, []*Resource{validTerrain, validTile}),
			want: ErrInvalidResource,
		},
		{
			name: "must reject a resource type that does not match",
			args: settings([]*Resource{NewResource(ResourceTypeTerrain, tile(NewResourceID(), TileTypeURL), nil)}, nil),
			want: ErrInvalidResource,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.want, tc.args.Validate())
		})
	}
}
