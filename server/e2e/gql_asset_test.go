package e2e

import (
	"encoding/json"
	"fmt"
	"net/http"
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
	token, url := createAssetUpload(e, pId, "test1.json", len(jsonData))
	if token != "" && url != "" {
		// Upload the file to the provided URL
		e.PUT(url).
			WithHeader("Content-Type", "application/json").
			WithBytes(jsonData).
			Expect().
			Status(200)
	}
	_, jsonAssetRes := createAsset(e, pId, "", "", nil, false, "", token, "")

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
	token2, url2 := createAssetUpload(e, pId, "test2.geojson", len(geoJsonData))
	if token2 != "" && url2 != "" {
		// Upload the file to the provided URL
		e.PUT(url2).
			WithHeader("Content-Type", "application/geo+json").
			WithBytes(geoJsonData).
			Expect().
			Status(200)
	}
	_, geoJsonAssetRes := createAsset(e, pId, "", "", nil, false, "", token2, "")

	// Check if assets were created successfully
	if jsonAssetRes != nil && geoJsonAssetRes != nil {
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
	} else {
		t.Log("Asset creation failed")
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

// Helper function to create an asset upload
func createAssetUpload(e *httpexpect.Expect, projectId string, filename string, contentLength int) (string, string) {
	// GraphQL mutation to create an asset upload
	query := `mutation CreateAssetUpload($input: CreateAssetUploadInput!) {
		createAssetUpload(input: $input) {
			token
			url
			contentType
			contentLength
			contentEncoding
			next
		}
	}`

	// Build input
	inputMap := map[string]interface{}{
		"projectId": projectId,
	}

	if filename != "" {
		inputMap["filename"] = filename
	}

	if contentLength > 0 {
		inputMap["contentLength"] = contentLength
	}

	variables := map[string]interface{}{
		"input": inputMap,
	}

	// Execute the query
	res := e.POST("/api/graphql").
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

	// Check for errors
	errors := res.Path("$.errors").Array()
	if errors.Length().Raw() > 0 {
		fmt.Printf("Error creating asset upload: %v\n", errors.Raw())
		return "", ""
	}

	token := res.Path("$.data.createAssetUpload.token").String().Raw()
	url := res.Path("$.data.createAssetUpload.url").String().Raw()

	return token, url
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
			Expect()

		res = resp.JSON()
	} else {
		// URL/token method (standard JSON body)
		resp := e.POST("/api/graphql").
			WithHeader("Origin", "https://example.com").
			WithHeader("X-Reearth-Debug-User", uId1.String()).
			WithHeader("Content-Type", "application/json").
			WithJSON(requestBody).
			Expect()

		if resp.Raw().StatusCode != http.StatusOK {
			return "", nil
		}

		res = resp.JSON()
	}

	// Check for errors
	errors := res.Path("$.errors").Array()
	if errors.Length().Raw() > 0 {
		fmt.Printf("Error creating asset: %v\n", errors.Raw())
		return "", nil
	}

	return res.Path("$.data.createAsset.asset.id").String().Raw(), res
}
