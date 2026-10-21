package workspacesettings

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestWorkspaceSettings_NewResource(t *testing.T) {
	rid := NewResourceID()
	pp := NewURLResourceProps("foo", "bar", "baz")
	tt := NewTileResource(rid, TileTypeDefault, pp)
	r := NewResource(ResourceTypeTile, tt, nil)
	assert.Equal(t, r.ResourceType(), ResourceTypeTile)
	assert.Equal(t, r.Tile(), tt)
	assert.Nil(t, r.Terrain())
	r.SetResourceType(ResourceTypeTerrain)
	assert.Equal(t, r.ResourceType(), ResourceTypeTerrain)
	r.SetTile(nil)
	assert.Nil(t, r.Tile())
	rid2 := NewResourceID()
	pp2 := NewCesiumResourceProps("foo", "bar", "baz", "test", "test")
	tt2 := NewTerrainResource(rid2, TerrainTypeCesiumIon, pp2)
	r.SetTerrain(tt2)
	assert.Equal(t, r.Terrain(), tt2)
}

func TestResource_Clone(t *testing.T) {
	tile := NewTileResource(NewResourceID(), TileTypeDefault, NewURLResourceProps("foo", "bar", "baz"))
	terrain := NewTerrainResource(NewResourceID(), TerrainTypeCesiumIon, NewCesiumResourceProps("foo", "bar", "baz", "test", "test"))

	tests := []struct {
		name string
		r    *Resource
	}{
		{name: "must clone a tile resource", r: NewResource(ResourceTypeTile, tile, nil)},
		{name: "must clone a terrain resource", r: NewResource(ResourceTypeTerrain, nil, terrain)},
		{name: "must clone an empty resource", r: NewResource("", nil, nil)},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			got := tc.r.Clone()
			assert.Equal(t, tc.r, got)
			assert.NotSame(t, tc.r, got)
		})
	}

	assert.Nil(t, (*Resource)(nil).Clone())
}
