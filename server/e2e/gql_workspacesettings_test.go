package e2e

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/samber/lo"
)

func updateWorkspaceSettings(e *httpexpect.Expect, wID string, tiles *workspacesettings.ResourceList, terrains *workspacesettings.ResourceList) *httpexpect.Value {
	requestBody := GraphQLRequest{
		Query: `mutation UpdateWorkspaceSettings($id: ID!, $tiles: ResourcesListInput!, $terrains: ResourcesListInput!) {
			updateWorkspaceSettings(input: {id: $id,tiles: $tiles,terrains: $terrains}) {
			  workspaceSettings{
				id
				tiles {
					resources {
						... on TileResource {
						  id
						  type
						  props {
							  name
							  url
							  image
						  }
						}
					}
					enabled
					selectedResource
				},
				terrains {
					resources {
						... on TerrainResource {
						  id
						  type
						  props {
							  name
							  url
							  image
							  cesiumIonAssetId
							  cesiumIonAccessToken
						  }
						}
					}
					enabled
					selectedResource
				},		  
			  }
			} 
		  }`,
		Variables: map[string]any{
			"id":       wID,
			"tiles":    tiles,
			"terrains": terrains,
		},
	}

	jsonData, _ := json.Marshal(requestBody)

	res := e.POST("/api/graphql").
	WithHeader("authorization", "Bearer test").
	WithHeader("Content-Type", "application/json").
	WithHeader("X-Reearth-Debug-User", uId1.String()).
	WithBytes(jsonData).
		Expect().
		Status(http.StatusUnprocessableEntity).
		JSON()

	return res
}

func TestUpdateWorkspaceSettings(t *testing.T) {
	e, _ := StartGQLServer(t, &app.Config{}, true, baseSeederWorkspace)

	rid := workspacesettings.NewResourceID()
	pp := workspacesettings.NewURLResourceProps("foo", "bar", "baz")
	tt := workspacesettings.NewTileResource(rid, workspacesettings.TileTypeDefault, pp)
	r := workspacesettings.NewResource(workspacesettings.ResourceTypeTile, tt, nil)
	tiles := workspacesettings.NewResourceList([]*workspacesettings.Resource{r}, rid.Ref(), lo.ToPtr(false))

	rid2 := workspacesettings.NewResourceID()
	pp2 := workspacesettings.NewCesiumResourceProps("foo", "bar", "baz", "test", "test")
	tt2 := workspacesettings.NewTerrainResource(rid, workspacesettings.TerrainType(workspacesettings.TerrainTypeCesiumIon), pp2)
	r2 := workspacesettings.NewResource(workspacesettings.ResourceTypeTerrain, nil, tt2)
	terrains := workspacesettings.NewResourceList([]*workspacesettings.Resource{r2}, rid2.Ref(), lo.ToPtr(true))

	res := updateWorkspaceSettings(e, wId.String(), tiles, terrains)
	res.Object().
		Value("data").Object().
		Value("updateWorkspaceSettings").Object().
		Value("workspaceSettings").Object().
		HasValue("id", wId.String())
}
