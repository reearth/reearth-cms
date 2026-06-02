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
	tiles := workspacesettings.NewResourceList([]*workspacesettings.Resource{r}, rid.Ref(), lo.ToPtr(true))
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
	tiles := workspacesettings.NewResourceList([]*workspacesettings.Resource{tileEntry}, rid.Ref(), lo.ToPtr(true))

	terrainPP := workspacesettings.NewCesiumResourceProps("foo", "bar", "baz", "test", "test")
	terrainResource := workspacesettings.NewTerrainResource(rid2, workspacesettings.TerrainTypeCesiumIon, terrainPP)
	terrainEntry := workspacesettings.NewResource(workspacesettings.ResourceTypeTerrain, nil, terrainResource)
	terrains := workspacesettings.NewResourceList([]*workspacesettings.Resource{terrainEntry}, rid2.Ref(), lo.ToPtr(true))

	ws := workspacesettings.New().NewID().Tiles(tiles).Terrains(terrains).MustBuild()

	tests := []struct {
		name       string
		doc        func() *WorkspaceSettingsDocument
		wantErr    error
		wantModel  func() *workspacesettings.WorkspaceSettings
		wantNilDoc bool
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
			wantModel: func() *workspacesettings.WorkspaceSettings { return ws },
		},
		{
			name: "empty ID returns error",
			doc: func() *WorkspaceSettingsDocument {
				return &WorkspaceSettingsDocument{ID: ""}
			},
			wantErr:    workspacesettings.ErrInvalidID,
			wantNilDoc: true,
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
			wantModel: func() *workspacesettings.WorkspaceSettings {
				return nil // checked separately via field assertions
			},
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
			wantModel: func() *workspacesettings.WorkspaceSettings { return nil },
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
			wantModel: func() *workspacesettings.WorkspaceSettings { return nil },
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
			wantModel: func() *workspacesettings.WorkspaceSettings { return nil },
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
			wantModel: func() *workspacesettings.WorkspaceSettings { return nil },
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
			wantModel: func() *workspacesettings.WorkspaceSettings { return nil },
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
			wantModel: func() *workspacesettings.WorkspaceSettings { return nil },
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			res, err := tt.doc().Model()

			if tt.wantErr != nil {
				assert.ErrorIs(t, err, tt.wantErr)
				assert.Nil(t, res)
				return
			}

			assert.NoError(t, err)

			if tt.wantModel != nil && tt.wantModel() != nil {
				assert.Equal(t, tt.wantModel(), res)
				return
			}

			// cases that only need field-level assertions on the returned model
			assert.NotNil(t, res)

			switch tt.name {
			case "valid ID with nil tiles and terrains":
				assert.Nil(t, res.Tiles())
				assert.Nil(t, res.Terrains())
			case "legacy tile type LABELLED is filtered out",
				"legacy tile type ESRI_TOPOGRAPHY is filtered out":
				assert.Empty(t, res.Tiles().Resources())
			case "legacy terrain type CESIUM_WORLD_TERRAIN is filtered out",
				"legacy terrain type ARC_GIS_TERRAIN is filtered out":
				assert.Empty(t, res.Terrains().Resources())
			case "REEARTH_TERRAIN is accepted":
				assert.Equal(t, workspacesettings.TerrainTypeReearthTerrain, res.Terrains().Resources()[0].Terrain().Type())
			case "CESIUM_ION is accepted":
				assert.Equal(t, workspacesettings.TerrainTypeCesiumIon, res.Terrains().Resources()[0].Terrain().Type())
			}
		})
	}
}
