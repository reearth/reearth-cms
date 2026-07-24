package mongodoc

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func Test_NewWorkspaceSettings(t *testing.T) {
	t.Parallel()

	rid := workspacesettings.NewResourceID()
	pp := workspacesettings.NewURLResourceProps("foo", "bar", "baz")
	tt := workspacesettings.NewTileResource(rid, workspacesettings.TileTypeDefault, pp)
	r := workspacesettings.NewResource(workspacesettings.ResourceTypeTile, tt, nil)
	tiles := workspacesettings.NewResourceList([]*workspacesettings.Resource{r}, rid.Ref(), new(true))
	ws := workspacesettings.New().NewID().Tiles(tiles).MustBuild()

	wsid := ws.ID().String()
	expected := &WorkspaceSettingsDocument{
		ID:       wsid,
		Tiles:    ToResourceListDocument(ws.Tiles()),
		Terrains: ToResourceListDocument(ws.Terrains()),
	}
	res, resid := NewWorkspaceSettings(ws)

	assert.Equal(t, expected, res)
	assert.Equal(t, expected.ID, resid)
}

func Test_WorkspaceSettingsDocument_Model(t *testing.T) {
	t.Parallel()

	rid := workspacesettings.NewResourceID()
	rid2 := workspacesettings.NewResourceID()

	tilePP := workspacesettings.NewURLResourceProps("foo", "bar", "baz")
	tileResource := workspacesettings.NewTileResource(rid, workspacesettings.TileTypeDefault, tilePP)
	tileEntry := workspacesettings.NewResource(workspacesettings.ResourceTypeTile, tileResource, nil)
	tiles := workspacesettings.NewResourceList([]*workspacesettings.Resource{tileEntry}, rid.Ref(), new(true))

	terrainPP := workspacesettings.NewCesiumResourceProps("foo", "bar", "baz", "test", "test")
	terrainResource := workspacesettings.NewTerrainResource(rid2, workspacesettings.TerrainTypeCesiumIon, terrainPP)
	terrainEntry := workspacesettings.NewResource(workspacesettings.ResourceTypeTerrain, nil, terrainResource)
	terrains := workspacesettings.NewResourceList([]*workspacesettings.Resource{terrainEntry}, rid2.Ref(), new(true))

	ws := workspacesettings.New().NewID().Tiles(tiles).Terrains(terrains).MustBuild()

	tests := []struct {
		name             string
		doc              func() *WorkspaceSettingsDocument
		wantErr          error
		wantModel        *workspacesettings.WorkspaceSettings
		wantTileCount    *int
		wantTerrainCount *int
		wantTerrainType  *workspacesettings.TerrainType
		wantNilTiles     bool
		wantNilTerrains  bool
	}{
		{
			name: "valid document with tiles and terrains",
			doc: func() *WorkspaceSettingsDocument {
				return &WorkspaceSettingsDocument{
					ID:       ws.ID().String(),
					Tiles:    ToResourceListDocument(ws.Tiles()),
					Terrains: ToResourceListDocument(ws.Terrains()),
				}
			},
			wantModel: ws,
		},
		{
			name: "empty ID returns error",
			doc: func() *WorkspaceSettingsDocument {
				return &WorkspaceSettingsDocument{ID: ""}
			},
			wantErr: workspacesettings.ErrInvalidID,
		},
		{
			name: "valid ID with nil tiles and terrains",
			doc: func() *WorkspaceSettingsDocument {
				return &WorkspaceSettingsDocument{
					ID:       workspacesettings.NewID().String(),
					Tiles:    ToResourceListDocument(nil),
					Terrains: ToResourceListDocument(nil),
				}
			},
			wantNilTiles:    true,
			wantNilTerrains: true,
		},
		{
			name: "legacy tile type LABELLED is filtered out",
			doc: func() *WorkspaceSettingsDocument {
				return &WorkspaceSettingsDocument{
					ID: workspacesettings.NewID().String(),
					Tiles: &ResourceListDocument{
						Resources: []*ResourceDocument{
							{Tile: &TileResourceDocument{ID: rid.String(), Type: "LABELLED"}},
						},
					},
				}
			},
			wantTileCount: new(0),
		},
		{
			name: "legacy tile type ESRI_TOPOGRAPHY is filtered out",
			doc: func() *WorkspaceSettingsDocument {
				return &WorkspaceSettingsDocument{
					ID: workspacesettings.NewID().String(),
					Tiles: &ResourceListDocument{
						Resources: []*ResourceDocument{
							{Tile: &TileResourceDocument{ID: rid.String(), Type: "ESRI_TOPOGRAPHY"}},
						},
					},
				}
			},
			wantTileCount: new(0),
		},
		{
			name: "legacy terrain type CESIUM_WORLD_TERRAIN is filtered out",
			doc: func() *WorkspaceSettingsDocument {
				return &WorkspaceSettingsDocument{
					ID: workspacesettings.NewID().String(),
					Terrains: &ResourceListDocument{
						Resources: []*ResourceDocument{
							{Terrain: &TerrainResourceDocument{ID: rid2.String(), Type: "CESIUM_WORLD_TERRAIN"}},
						},
					},
				}
			},
			wantTerrainCount: new(0),
		},
		{
			name: "legacy terrain type ARC_GIS_TERRAIN is filtered out",
			doc: func() *WorkspaceSettingsDocument {
				return &WorkspaceSettingsDocument{
					ID: workspacesettings.NewID().String(),
					Terrains: &ResourceListDocument{
						Resources: []*ResourceDocument{
							{Terrain: &TerrainResourceDocument{ID: rid2.String(), Type: "ARC_GIS_TERRAIN"}},
						},
					},
				}
			},
			wantTerrainCount: new(0),
		},
		{
			name: "REEARTH_TERRAIN is accepted",
			doc: func() *WorkspaceSettingsDocument {
				return &WorkspaceSettingsDocument{
					ID: workspacesettings.NewID().String(),
					Terrains: &ResourceListDocument{
						Resources: []*ResourceDocument{
							{Terrain: &TerrainResourceDocument{ID: workspacesettings.NewResourceID().String(), Type: "REEARTH_TERRAIN"}},
						},
					},
				}
			},
			wantTerrainCount: new(1),
			wantTerrainType:  lo.ToPtr(workspacesettings.TerrainTypeReearthTerrain),
		},
		{
			name: "CESIUM_ION is accepted",
			doc: func() *WorkspaceSettingsDocument {
				return &WorkspaceSettingsDocument{
					ID: workspacesettings.NewID().String(),
					Terrains: &ResourceListDocument{
						Resources: []*ResourceDocument{
							{Terrain: &TerrainResourceDocument{ID: workspacesettings.NewResourceID().String(), Type: "CESIUM_ION"}},
						},
					},
				}
			},
			wantTerrainCount: new(1),
			wantTerrainType:  lo.ToPtr(workspacesettings.TerrainTypeCesiumIon),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			res, err := tt.doc().Model()

			if tt.wantErr != nil {
				assert.ErrorIs(t, err, tt.wantErr)
				assert.Nil(t, res)
				return
			}

			assert.NoError(t, err)
			assert.NotNil(t, res)

			if tt.wantModel != nil {
				assert.Equal(t, tt.wantModel, res)
				return
			}

			if tt.wantNilTiles {
				assert.Nil(t, res.Tiles())
			}
			if tt.wantNilTerrains {
				assert.Nil(t, res.Terrains())
			}
			if tt.wantTileCount != nil {
				assert.Len(t, res.Tiles().Resources(), *tt.wantTileCount)
			}
			if tt.wantTerrainCount != nil {
				assert.Len(t, res.Terrains().Resources(), *tt.wantTerrainCount)
			}
			if tt.wantTerrainType != nil {
				assert.Equal(t, *tt.wantTerrainType, res.Terrains().Resources()[0].Terrain().Type())
			}
		})
	}
}
