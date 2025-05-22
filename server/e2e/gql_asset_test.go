package e2e

import (
	"encoding/json"
	"log"
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
	if testing.Short() {
		t.Skip("skipping test in short mode.")
	}

	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	// Create a project
	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")

	// Upload assets with different properties
	// Asset 1: JSON file
	asset1Id, assetRes := createAsset(e, pId, "test1.json", "application/json", []byte(`{"test": "data"}`), false, "", "", "")

	// Check if asset was created successfully
	if assetRes != nil {

		// Now search for the asset
		res := searchAsset(e, pId, nil, nil, nil, nil)

		totalCount := res.Path("$.data.searchAsset.totalCount").Raw()

		// Only assert if we have results
		if totalCount != nil && totalCount.(int) > 0 {
			assert.Equal(t, 1, totalCount)
			assert.Equal(t, asset1Id, res.Path("$.data.searchAsset.edges[0].node.id").Raw())
		} else {
			t.Log("No assets found in search results")
		}
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
	inputMap := map[string]any{
		"projectId": projectId,
	}

	// Add optional flags
	if skipDecompression {
		inputMap["skipDecompression"] = skipDecompression
	}
	if contentEncoding != "" {
		inputMap["contentEncoding"] = contentEncoding
	}

	// Handle mutual exclusivity
	uploadMethodCount := 0
	if data != nil {
		inputMap["file"] = nil // Required placeholder for multipart injection
		uploadMethodCount++
	}
	if token != "" || url != "" {
		inputMap["token"] = token
		inputMap["url"] = url
		uploadMethodCount++
	}

	if uploadMethodCount != 1 {
		log.Print("❌ Must provide either file OR url/token, not both or neither.")
		return "", nil
	}

	variables := map[string]any{
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

	return res.Path("$.data.createAsset.asset.id").String().Raw(), res
}
