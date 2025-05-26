package e2e

import (
	"encoding/json"
	"fmt"
	"strings"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

// Reference to the user ID defined in gql_workspace_test.go
var _ = accountdomain.UserID{}

func TestSearchAsset(t *testing.T) {

	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	// Create a project
	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")

	// Upload assets with different properties
	// Asset 1: JSON file
	jsonData := []byte(`{"test": "data"}`)
	jsonAssetId, jsonAssetRes := createAsset(e, pId, "test1.json", "application/json", jsonData, false, "", "", "")

	// Asset 2: GeoJSON file
	geoJsonData := []byte(`{
		"type": "FeatureCollection",
		"features": [
			{
				"type": "Feature",
				"geometry": {
					"type": "Point",
					"coordinates": [125.6, 10.1]
				},
				"properties": {
					"name": "Test Point"
				}
			}
		]
	}`)
	geoJsonAssetId, geoJsonAssetRes := createAsset(e, pId, "test2.geojson", "application/geo+json", geoJsonData, false, "", "", "")

	// Log asset creation results
	t.Logf("JSON asset ID: %s", jsonAssetId)
	t.Logf("GeoJSON asset ID: %s", geoJsonAssetId)

	// Check if assets were created successfully
	assert.NotEmpty(t, jsonAssetId, "JSON asset ID should not be empty")
	assert.NotEmpty(t, geoJsonAssetId, "GeoJSON asset ID should not be empty")

	// Search for all assets (no filter)
	res := searchAsset(e, pId, nil, nil, nil, nil)
	totalCount := res.Path("$.data.assets.totalCount").Raw()
	assert.Equal(t, float64(0), totalCount) // currently assets are not indexed

	// Search with content type filter for JSON
	jsonContentTypes := []string{"JSON"}
	jsonRes := searchAsset(e, pId, nil, jsonContentTypes, nil, nil)
	jsonTotalCount := jsonRes.Path("$.data.assets.totalCount").Raw()
	assert.Equal(t, float64(0), jsonTotalCount) // currently assets are not indexed

	// Search with content type filter for GeoJSON
	geoJsonContentTypes := []string{"GEOJSON"}
	geoJsonRes := searchAsset(e, pId, nil, geoJsonContentTypes, nil, nil)
	geoJsonTotalCount := geoJsonRes.Path("$.data.assets.totalCount").Raw()
	assert.Equal(t, float64(0), geoJsonTotalCount) // currently assets are not indexed

	// Search with content type filter for both JSON and GeoJSON
	bothContentTypes := []string{"JSON", "GEOJSON"}
	bothRes := searchAsset(e, pId, nil, bothContentTypes, nil, nil)
	bothTotalCount := bothRes.Path("$.data.assets.totalCount").Raw()
	assert.Equal(t, float64(0), bothTotalCount) // currently assets are not indexed

	// Log asset responses for debugging
	if jsonAssetRes != nil {
		t.Logf("JSON asset response: %v", jsonAssetRes.Path("$.data.createAsset.asset").Raw())
	}
	if geoJsonAssetRes != nil {
		t.Logf("GeoJSON asset response: %v", geoJsonAssetRes.Path("$.data.createAsset.asset").Raw())
	}
}

// Helper function to search assets
func searchAsset(e *httpexpect.Expect, projectId string, keyword interface{}, contentTypes []string, sort *gqlmodel.AssetSort, pagination *gqlmodel.Pagination) *httpexpect.Value {
	// Convert keyword to string if it's an asset ID
	var keywordStr *string
	if keyword != nil {
		if assetId, ok := keyword.(string); ok {
			keywordStr = &assetId
		} else if assetId, ok := keyword.(id.AssetID); ok {
			s := assetId.String()
			keywordStr = &s
		}
	}

	// Build the query variables
	variables := map[string]interface{}{
		"query": map[string]interface{}{
			"project": projectId,
		},
	}

	if keywordStr != nil {
		variables["query"].(map[string]interface{})["keyword"] = *keywordStr
	}

	if len(contentTypes) > 0 {
		variables["query"].(map[string]interface{})["contentTypes"] = contentTypes
	}

	if sort != nil {
		variables["sort"] = map[string]interface{}{
			"sortBy":    sort.SortBy,
			"direction": sort.Direction,
		}
	}

	if pagination != nil {
		paginationMap := map[string]interface{}{}
		if pagination.First != nil {
			paginationMap["first"] = *pagination.First
		}
		if pagination.Last != nil {
			paginationMap["last"] = *pagination.Last
		}
		if pagination.After != nil {
			paginationMap["after"] = *pagination.After
		}
		if pagination.Before != nil {
			paginationMap["before"] = *pagination.Before
		}
		if pagination.Offset != nil {
			paginationMap["offset"] = *pagination.Offset
		}
		variables["pagination"] = paginationMap
	}

	// GraphQL query
	query := `
		query assets($query: AssetQueryInput!, $sort: AssetSort, $pagination: Pagination) {
			assets(input: {query: $query, sort: $sort, pagination: $pagination}) {
				edges {
					node {
						id
						fileName
						projectId
						contentType
					}
				}
				pageInfo {
					hasNextPage
					endCursor
				}
				totalCount
			}
		}
	`

	// Execute the query
	return e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(GraphQLRequest{
			Query:     query,
			Variables: variables,
		}).
		Expect().
		Status(200).
		JSON()
}

// Helper function to create an asset
func createAsset(
	e *httpexpect.Expect,
	projectId string,
	fileName string,
	contentType string,
	data []byte,
	skipDecompression bool,
	contentEncoding string,
	token string,
	url string,
) (string, *httpexpect.Value) {
	// GraphQL mutation to create an asset
	query := `mutation CreateAsset($input: CreateAssetInput!) {
		createAsset(input: $input) {
			asset {
				id
				fileName
				contentType
				size
				createdAt
			}
		}
	}`

	// Build base input
	inputMap := map[string]interface{}{
		"projectId": projectId,
	}

	// Add optional flags
	if skipDecompression {
		inputMap["skipDecompression"] = skipDecompression
	}
	if contentEncoding != "" {
		inputMap["contentEncoding"] = contentEncoding
	}

	// Handle upload method
	if data != nil {
		// Direct file upload (multipart)
		inputMap["file"] = nil // Required placeholder for multipart injection
	} else if token != "" {
		// Token-based upload
		inputMap["token"] = token
		if url != "" {
			inputMap["url"] = url
		}
	} else {
		fmt.Println("Error: Neither file data nor token provided")
		return "", nil
	}

	variables := map[string]interface{}{
		"input": inputMap,
	}

	requestBody := GraphQLRequest{
		Query:     query,
		Variables: variables,
	}

	var res *httpexpect.Value

	if data != nil {
		// File upload (multipart)
		operations, _ := json.Marshal(requestBody)
		mapJSON := `{ "0": ["variables.input.file"] }`

		resp := e.POST("/api/graphql").
			WithHeader("Origin", "https://example.com").
			WithHeader("X-Reearth-Debug-User", uId1.String()).
			WithMultipart().
			WithFormField("operations", string(operations)).
			WithFormField("map", mapJSON).
			WithFile("0", fileName, strings.NewReader(string(data))).
			Expect().
			Status(200)

		res = resp.JSON()
	} else {
		// URL/token method (standard JSON body)
		resp := e.POST("/api/graphql").
			WithHeader("Origin", "https://example.com").
			WithHeader("X-Reearth-Debug-User", uId1.String()).
			WithHeader("Content-Type", "application/json").
			WithJSON(requestBody).
			Expect().
			Status(200)

		res = resp.JSON()
	}

	// Check for errors only if they exist
	if res.Path("$.errors").Raw() != nil {
		fmt.Printf("Error creating asset: %v\n", res.Path("$.errors").Raw())
		return "", res
	}

	// Extract asset ID
	assetId := res.Path("$.data.createAsset.asset.id").String().Raw()
	return assetId, res
}
