package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/idx"
	"github.com/stretchr/testify/assert"
)

func Test_ToWorkspaceSettings(t *testing.T) {
	rid := workspacesettings.NewResourceID()
	pp := workspacesettings.NewURLResourceProps("foo", "bar", "baz")
	tt := workspacesettings.NewTileResource(rid, workspacesettings.TileTypeDefault, pp)
	r := workspacesettings.NewResource(workspacesettings.ResourceTypeTile, tt, nil)
	tiles := workspacesettings.NewResourceList([]*workspacesettings.Resource{r}, rid.Ref(), new(true))
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
	r := workspacesettings.NewResource(workspacesettings.ResourceTypeTile, tt, nil)
	rl := workspacesettings.NewResourceList([]*workspacesettings.Resource{r}, rid.Ref(), new(true))
	assert.Equal(t, rl.Resources(), []*workspacesettings.Resource{r})
	assert.Equal(t, rl.SelectedResource(), rid.Ref())
	assert.Equal(t, rl.Enabled(), new(true))

	rl2 := ToResourceList(nil)
	assert.Nil(t, rl2)
}

func Test_ToTileType(t *testing.T) {
	assert.Equal(t, TileTypeRoadMap, ToTileType(workspacesettings.TileTypeRoadMap))
	assert.Equal(t, TileTypeOpenStreetMap, ToTileType(workspacesettings.TileTypeOpenStreetMap))
	assert.Equal(t, TileTypeEarthAtNight, ToTileType(workspacesettings.TileTypeEarthAtNight))
	assert.Equal(t, TileTypeJapanGsiStandardMap, ToTileType(workspacesettings.TileTypeJapanGSIStandardMap))
	assert.Equal(t, TileTypeURL, ToTileType(workspacesettings.TileTypeURL))
	assert.Equal(t, TileTypeDefault, ToTileType(workspacesettings.TileTypeDefault))
	assert.Equal(t, TileTypeDefault, ToTileType(workspacesettings.TileType("")))
}

func Test_ToTerrainType(t *testing.T) {
	assert.Equal(t, TerrainTypeCesiumIon, ToTerrainType(workspacesettings.TerrainTypeCesiumIon))
	assert.Equal(t, TerrainTypeReearthTerrain, ToTerrainType(workspacesettings.TerrainTypeReearthTerrain))
}

func Test_ToResource(t *testing.T) {
	rid := workspacesettings.NewResourceID()
	pp := workspacesettings.NewCesiumResourceProps("foo", "bar", "baz", "test", "test")
	tt := workspacesettings.NewTerrainResource(rid, workspacesettings.TerrainTypeReearthTerrain, pp)
	r := workspacesettings.NewResource(workspacesettings.ResourceTypeTile, nil, tt)

	expected := TerrainResource{
		ID:    IDFrom(r.Terrain().ID()),
		Type:  ToTerrainType(r.Terrain().Type()),
		Props: ToCesiumResourceProps(r.Terrain().Props()),
	}

	assert.Equal(t, expected, ToResource(r))
	assert.Nil(t, ToResource(nil))
}

func Test_FromResourceList(t *testing.T) {
	rid := workspacesettings.NewResourceID()
	pp := workspacesettings.NewCesiumResourceProps("foo", "bar", "baz", "test", "test")
	tt := workspacesettings.NewTerrainResource(rid, workspacesettings.TerrainTypeCesiumIon, pp)
	r := workspacesettings.NewResource(workspacesettings.ResourceTypeTerrain, nil, tt)
	rl := workspacesettings.NewResourceList([]*workspacesettings.Resource{r}, rid.Ref(), new(true))

	tid := IDFrom(r.Terrain().ID())
	ri := &ResourceInput{
		Terrain: &TerrainResourceInput{
			ID:   tid,
			Type: TerrainTypeCesiumIon,
			Props: &CesiumResourcePropsInput{
				Name:                 "foo",
				URL:                  "bar",
				Image:                "baz",
				CesiumIonAssetID:     "test",
				CesiumIonAccessToken: "test",
			},
		},
	}

	expected := &ResourcesListInput{
		Resources: []*ResourceInput{
			ri,
		},
		SelectedResource: IDFromRef(rl.SelectedResource()),
		Enabled:          new(true),
	}

	got, err := FromResourceList(expected)
	assert.NoError(t, err)
	assert.Equal(t, rl, got)
	got, err = FromResourceList(nil)
	assert.NoError(t, err)
	assert.Nil(t, got)

	// an invalid ID in any resource fails the list
	got, err = FromResourceList(&ResourcesListInput{Resources: []*ResourceInput{ri, {Tile: &TileResourceInput{ID: "invalid"}}}})
	assert.Equal(t, idx.ErrInvalidID, err)
	assert.Nil(t, got)
}

func Test_FromResource(t *testing.T) {
	rid := workspacesettings.NewResourceID()
	pp := workspacesettings.NewCesiumResourceProps("foo", "bar", "baz", "test", "test")
	tt := workspacesettings.NewTerrainResource(rid, workspacesettings.TerrainTypeCesiumIon, pp)
	r := workspacesettings.NewResource(workspacesettings.ResourceTypeTerrain, nil, tt)

	tid := IDFrom(r.Terrain().ID())
	expected := &ResourceInput{
		Terrain: &TerrainResourceInput{
			ID:   tid,
			Type: TerrainTypeCesiumIon,
			Props: &CesiumResourcePropsInput{
				Name:                 "foo",
				URL:                  "bar",
				Image:                "baz",
				CesiumIonAssetID:     "test",
				CesiumIonAccessToken: "test",
			},
		},
	}

	got, err := FromResource(expected)
	assert.NoError(t, err)
	assert.Equal(t, r, got)
	got, err = FromResource(nil)
	assert.NoError(t, err)
	assert.Nil(t, got)

	rid2 := workspacesettings.NewResourceID()
	pp2 := workspacesettings.NewURLResourceProps("foo", "bar", "baz")
	tt2 := workspacesettings.NewTileResource(rid2, workspacesettings.TileTypeDefault, pp2)
	r2 := workspacesettings.NewResource(workspacesettings.ResourceTypeTile, tt2, nil)

	tid2 := IDFrom(r2.Tile().ID())
	expected2 := &ResourceInput{
		Tile: &TileResourceInput{
			ID:   tid2,
			Type: TileTypeDefault,
			Props: &URLResourcePropsInput{
				Name:  "foo",
				URL:   "bar",
				Image: "baz",
			},
		},
	}

	got, err = FromResource(expected2)
	assert.NoError(t, err)
	assert.Equal(t, r2, got)

	// an invalid ID is returned as an error rather than a nil resource
	got, err = FromResource(&ResourceInput{Tile: &TileResourceInput{ID: "invalid"}})
	assert.Equal(t, idx.ErrInvalidID, err)
	assert.Nil(t, got)
	got, err = FromResource(&ResourceInput{Terrain: &TerrainResourceInput{ID: "invalid"}})
	assert.Equal(t, idx.ErrInvalidID, err)
	assert.Nil(t, got)

	// both a tile and a terrain are kept, so validation rejects the resource
	got, err = FromResource(&ResourceInput{Tile: expected2.Tile, Terrain: expected.Terrain})
	assert.NoError(t, err)
	assert.Equal(t, workspacesettings.NewResource(workspacesettings.ResourceTypeTile, tt2, tt), got)
	assert.Equal(t, workspacesettings.ErrInvalidResource, got.Validate())

	// an input with neither is a nil entry, which validation also rejects
	got, err = FromResource(&ResourceInput{})
	assert.NoError(t, err)
	assert.Nil(t, got)
}

func Test_FromTerrainType(t *testing.T) {
	assert.Equal(t, workspacesettings.TerrainTypeCesiumIon, FromTerrainType(TerrainTypeCesiumIon))
	assert.Equal(t, workspacesettings.TerrainTypeReearthTerrain, FromTerrainType(TerrainTypeReearthTerrain))
}

func Test_FromTileType(t *testing.T) {
	assert.Equal(t, workspacesettings.TileTypeDefault, FromTileType(TileTypeDefault))
	assert.Equal(t, workspacesettings.TileTypeRoadMap, FromTileType(TileTypeRoadMap))
	assert.Equal(t, workspacesettings.TileTypeOpenStreetMap, FromTileType(TileTypeOpenStreetMap))
	assert.Equal(t, workspacesettings.TileTypeEarthAtNight, FromTileType(TileTypeEarthAtNight))
	assert.Equal(t, workspacesettings.TileTypeJapanGSIStandardMap, FromTileType(TileTypeJapanGsiStandardMap))
	assert.Equal(t, workspacesettings.TileTypeURL, FromTileType(TileTypeURL))
}
