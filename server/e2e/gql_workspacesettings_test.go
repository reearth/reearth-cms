package e2e

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
)

func updateWorkspaceSettings(e *httpexpect.Expect, wID string, tiles map[string]any, terrains map[string]any) *httpexpect.Value {
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
		Status(http.StatusOK).
		JSON()

	return res
}

func TestUpdateWorkspaceSettings(t *testing.T) {
	e, _ := StartGQLServer(t, &app.Config{}, true, baseSeederWorkspace)

	tiles:= map[string]any{
        "resources": []map[string]any{
            {
                "tile": map[string]any{
                    "id": rid.String(),
                    "type": "DEFAULT",
                    "props" : map[string]any{
                        "name": "name1",
                        "url": "url1",
                        "image": "image1",
                    },
                },
            },
		},
        "selectedResource": rid.String(),
        "enabled": false,
    }
	terrains:= map[string]any{
        "resources": []map[string]any{
            {
                "terrain": map[string]any{
                    "id": rid2.String(),
                    "type": "CESIUM_ION",
                    "props" : map[string]any{
                        "name": "name1",
                        "url": "url1",
                        "image": "image1",
						"cesiumIonAssetId": "test2",
                        "cesiumIonAccessToken": "test2",
                    },
                },
            },
		},
        "selectedResource": rid2.String(),
        "enabled": false,
    }

	res := updateWorkspaceSettings(e, wId.String(), tiles, terrains)
	res.Object().
		Value("data").Object().
		Value("updateWorkspaceSettings").Object().
		Value("workspaceSettings").Object().
		HasValue("id", wId.String())
}
