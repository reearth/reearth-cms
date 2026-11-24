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

func TestResource_Validate(t *testing.T) {
	t.Parallel()
	tile := NewTileResource(NewResourceID(), TileTypeDefault, NewURLResourceProps("n", "u", "i"))
	terrain := NewTerrainResource(NewResourceID(), TerrainTypeCesiumIon, NewCesiumResourceProps("n", "u", "i", "a", "t"))

	tests := []struct {
		name    string
		args    *Resource
		wantErr error
	}{
		{name: "must accept a tile", args: NewResource(ResourceTypeTile, tile, nil)},
		{name: "must accept a terrain", args: NewResource(ResourceTypeTerrain, nil, terrain)},
		{name: "must reject a nil resource", args: nil, wantErr: ErrInvalidResource},
		{name: "must reject a resource without a tile or a terrain", args: NewResource(ResourceTypeTile, nil, nil), wantErr: ErrInvalidResource},
		{name: "must reject a resource with both a tile and a terrain", args: NewResource(ResourceTypeTile, tile, terrain), wantErr: ErrInvalidResource},
		{name: "must reject a resource whose type does not match its content", args: NewResource(ResourceTypeTerrain, tile, nil), wantErr: ErrInvalidResource},
		{name: "must reject a resource without a type", args: NewResource("", tile, nil), wantErr: ErrInvalidResource},
		{
			name:    "must reject a tile of an unknown type",
			args:    NewResource(ResourceTypeTile, NewTileResource(NewResourceID(), "LABELLED", UrlResourceProps{}), nil),
			wantErr: ErrInvalidResource,
		},
		{
			name:    "must reject a tile of an empty type",
			args:    NewResource(ResourceTypeTile, NewTileResource(NewResourceID(), "", UrlResourceProps{}), nil),
			wantErr: ErrInvalidResource,
		},
		{
			name:    "must reject a terrain of an unknown type",
			args:    NewResource(ResourceTypeTerrain, nil, NewTerrainResource(NewResourceID(), "ARC_GIS_TERRAIN", CesiumResourceProps{})),
			wantErr: ErrInvalidResource,
		},
		{
			name:    "must reject a tile without an ID",
			args:    NewResource(ResourceTypeTile, NewTileResource(ResourceID{}, TileTypeDefault, UrlResourceProps{}), nil),
			wantErr: ErrInvalidResource,
		},
		{
			name:    "must reject a terrain without an ID",
			args:    NewResource(ResourceTypeTerrain, nil, NewTerrainResource(ResourceID{}, TerrainTypeCesiumIon, CesiumResourceProps{})),
			wantErr: ErrInvalidResource,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.wantErr, tc.args.Validate())

			// the builder rejects settings that hold the resource in either list
			valid := NewResource(ResourceTypeTile, tile, nil)
			_, err := New().NewID().Tiles(NewResourceList([]*Resource{valid, tc.args}, nil, nil)).Build()
			assert.Equal(t, tc.wantErr, err)
			_, err = New().NewID().Terrains(NewResourceList([]*Resource{tc.args}, nil, nil)).Build()
			assert.Equal(t, tc.wantErr, err)
		})
	}
}
