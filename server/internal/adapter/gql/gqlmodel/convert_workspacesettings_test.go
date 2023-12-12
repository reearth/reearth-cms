package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func Test_ToWorkspaceSettings(t *testing.T) {
	rid := workspacesettings.NewResourceID()
	pp := workspacesettings.NewURLResourceProps("foo", "bar", "baz")
	tt := workspacesettings.NewTileResource(rid, workspacesettings.TileTypeDefault, pp)
	r :=workspacesettings.NewResource(workspacesettings.ResourceTypeTile, tt, nil)
	tiles := workspacesettings.NewResourceList([]*workspacesettings.Resource{r}, rid.Ref(), lo.ToPtr(true))
	ws := workspacesettings.New().NewID().Tiles(tiles).MustBuild()

	ws2 := ToWorkspaceSettings(ws)
	assert.Equal(t, IDFrom(ws.ID()), ws2.ID)
	assert.Equal(t, ToResourceList(ws.Tiles()), ws2.Tiles)
	assert.Equal(t, ToResourceList(ws.Terrains()), ws2.Terrains)

	ws3 := ToWorkspaceSettings(nil)
	assert.Nil(t, ws3)
}

func Test_ToResourceList(t *testing.T) {
	rid := workspacesettings.NewResourceID()
	pp := workspacesettings.NewURLResourceProps("foo", "bar", "baz")
	tt := workspacesettings.NewTileResource(rid, workspacesettings.TileTypeDefault, pp)
	r :=workspacesettings.NewResource(workspacesettings.ResourceTypeTile, tt, nil)
	rl := workspacesettings.NewResourceList([]*workspacesettings.Resource{r}, rid.Ref(), lo.ToPtr(true))
	assert.Equal(t, rl.Resources(), []*workspacesettings.Resource{r})
	assert.Equal(t, rl.SelectedResource(), rid.Ref())
	assert.Equal(t, rl.Enabled(), lo.ToPtr(true))

	rl2 := ToResourceList(nil)
	assert.Nil(t, rl2)
}

func Test_ToTileType(t *testing.T) {
	assert.Equal(t, TileTypeDefault, ToTileType(workspacesettings.TileTypeDefault))
	assert.Equal(t, TileTypeLabelled, ToTileType(workspacesettings.TileTypeLabelled))
	assert.Equal(t, TileTypeRoadMap, ToTileType(workspacesettings.TileTypeRoadMap))
	assert.Equal(t, TileTypeStamenWatercolor, ToTileType(workspacesettings.TileTypeStamenWaterColor))
	assert.Equal(t, TileTypeStamenToner, ToTileType(workspacesettings.TileTypeStamenToner))
	assert.Equal(t, TileTypeOpenStreetMap, ToTileType(workspacesettings.TileTypeOpenStreetMap))
	assert.Equal(t, TileTypeEsriTopography, ToTileType(workspacesettings.TileTypeESRITopography))
	assert.Equal(t, TileTypeEarthAtNight, ToTileType(workspacesettings.TileTypeEarthAtNight))
	assert.Equal(t, TileTypeJapanGsiStandardMap, ToTileType(workspacesettings.TileTypeJapanGSIStandardMap))
	assert.Equal(t, TileTypeURL, ToTileType(workspacesettings.TileTypeURL))
	assert.Equal(t, TileTypeDefault, ToTileType(workspacesettings.TileType("")))
}

func Test_ToTerrainType(t *testing.T) {
	assert.Equal(t, TerrainTypeCesiumWorldTerrain, ToTerrainType(workspacesettings.TerrainTypeCesiumWorldTerrain))
	assert.Equal(t, TerrainTypeArcGisTerrain, ToTerrainType(workspacesettings.TerrainTypeArcGISTerrain))
	assert.Equal(t, TerrainTypeCesiumIon, ToTerrainType(workspacesettings.TerrainTypeCesiumIon))
}

func Test_ToResource(t *testing.T) {
	rid := workspacesettings.NewResourceID()
	pp := workspacesettings.NewCesiumResourceProps("foo", "bar", "baz", "test", "test")
	tt := workspacesettings.NewTerrainResource(rid, workspacesettings.TerrainTypeArcGISTerrain, pp)
	r :=workspacesettings.NewResource(workspacesettings.ResourceTypeTile, nil, tt)
	
	expected := TerrainResource{
		ID:    IDFrom(r.Terrain().ID()),
		Type:  ToTerrainType(r.Terrain().Type()),
		Props: ToCesiumResourceProps(r.Terrain().Props()),
	}
	
	assert.Equal(t, expected, ToResource(r))
	assert.Nil(t, ToResource(nil))
}