package workspacesettings

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestWorkspaceSettings_SetTiles(t *testing.T) {
	rid := NewResourceID()
	pp := NewURLResourceProps("foo", "bar", "baz")
	tt := NewTileResource(rid, TileTypeDefault, pp)
	r := NewResource(ResourceTypeTile, tt, nil)
	tiles := NewResourceList([]*Resource{r}, rid.Ref(), new(true))
	ws := &WorkspaceSettings{}
	assert.NoError(t, ws.SetTiles(tiles))
	assert.Equal(t, tiles, ws.Tiles())
	assert.NoError(t, ws.SetTiles(nil))
	assert.Nil(t, ws.Tiles())
}

func TestWorkspaceSettings_SetTerrains(t *testing.T) {
	rid := NewResourceID()
	pp := NewURLResourceProps("foo", "bar", "baz")
	tt := NewTileResource(rid, TileTypeDefault, pp)
	r := NewResource(ResourceTypeTile, tt, nil)
	terrains := NewResourceList([]*Resource{r}, rid.Ref(), new(true))
	ws := &WorkspaceSettings{}
	assert.NoError(t, ws.SetTerrains(terrains))
	assert.Equal(t, terrains, ws.Terrains())
	assert.NoError(t, ws.SetTerrains(nil))
	assert.Nil(t, ws.Terrains())
}

func TestWorkspaceSettings_SetResources(t *testing.T) {
	rid := NewResourceID()
	pp := NewURLResourceProps("foo", "bar", "baz")
	tt := NewTileResource(rid, TileTypeDefault, pp)
	r := NewResource(ResourceTypeTile, tt, nil)
	rs := []*Resource{r}
	ws := &ResourceList{}
	ws.SetResources(rs)
	assert.Equal(t, rs, ws.Resources())
}

func TestWorkspaceSettings_SetSelectedResource(t *testing.T) {
	rid := NewResourceID()
	ws := &ResourceList{}
	ws.SetSelectedResource(rid.Ref())
	assert.Equal(t, rid.Ref(), ws.SelectedResource())
}

func TestWorkspaceSettings_SetEnabled(t *testing.T) {
	ws := &ResourceList{}
	e := new(true)
	ws.SetEnabled(e)
	assert.Equal(t, e, ws.Enabled())
}

func TestWorkspaceSettings_Clone(t *testing.T) {
	rid := NewResourceID()
	pp := NewURLResourceProps("foo", "bar", "baz")
	tt := NewTileResource(rid, TileTypeDefault, pp)
	r := NewResource(ResourceTypeTile, tt, nil)
	rid2 := NewResourceID()
	pp2 := NewCesiumResourceProps("foo", "bar", "baz", "test", "test")
	tt2 := NewTerrainResource(rid, TerrainTypeCesiumIon, pp2)
	r2 := NewResource(ResourceTypeTerrain, nil, tt2)
	tiles := NewResourceList([]*Resource{r}, rid.Ref(), new(true))
	terrains := NewResourceList([]*Resource{r2}, rid2.Ref(), new(true))
	ws := New().NewID().Tiles(tiles).Terrains(terrains).MustBuild()
	got := ws.Clone()
	assert.Equal(t, ws, got)
	assert.NotSame(t, ws, got)
	assert.NotSame(t, ws.tiles, got.tiles)
	assert.NotSame(t, ws.terrains, got.terrains)
	assert.NotSame(t, ws.tiles.resources[0], got.tiles.resources[0])
	assert.NotSame(t, ws.terrains.resources[0], got.terrains.resources[0])
	assert.Nil(t, (*WorkspaceSettings)(nil).Clone())

	// changing a resource of the clone must not change the original
	got.tiles.resources[0].SetTile(nil)
	assert.Same(t, tt, ws.tiles.resources[0].Tile())
}

func TestWorkspaceSettings_SetResourceLists_Invalid(t *testing.T) {
	t.Parallel()
	valid := NewResourceList([]*Resource{NewResource(ResourceTypeTile, NewTileResource(NewResourceID(), TileTypeDefault, UrlResourceProps{}), nil)}, nil, nil)
	invalid := NewResourceList([]*Resource{NewResource(ResourceTypeTile, nil, nil)}, nil, nil)
	ws := &WorkspaceSettings{tiles: valid, terrains: valid}

	// an invalid list is rejected and the current one is kept
	assert.Equal(t, ErrInvalidResource, ws.SetTiles(invalid))
	assert.Equal(t, valid, ws.Tiles())
	assert.Equal(t, ErrInvalidResource, ws.SetTerrains(invalid))
	assert.Equal(t, valid, ws.Terrains())
}
