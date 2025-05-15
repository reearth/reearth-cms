package e2e

import (
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
	if testing.Short() {
		t.Skip("skipping test in short mode.")
	}

	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	// Create a project
	pId, _ := createProject(e, wId.String(), "test", "test", "test-1")

	// Upload assets with different properties
	// Asset 1: JSON file
	asset1Id, _ := createAsset(e, pId, "test1.json", "application/json", []byte(`{"test": "data"}`), false, "", "", "")

	res := searchAsset(e, pId, asset1Id, nil, nil, nil)
	assert.Equal(t, 1, res.Path("$.data.searchAsset.totalCount").Raw())
	assert.Equal(t, asset1Id, res.Path("$.data.searchAsset.edges[0].node.id").Raw())

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
		variables["query"].(map[string]interface{})["q"] = *keywordStr
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
		query SearchAsset($query: AssetQueryInput!, $sort: AssetSort, $pagination: Pagination) {
			searchAsset(input: {query: $query, sort: $sort, pagination: $pagination}) {
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
func createAsset(e *httpexpect.Expect, projectId string, fileName string, contentType string, data []byte, skipDecompression bool, contentEncoding string, token string, url string) (string, *httpexpect.Value) {
	// GraphQL mutation to create an asset
	query := `
		mutation CreateAsset($input: CreateAssetInput!) {
			createAsset(input: $input) {
				asset {
					id
					fileName
					contentType
					size
					createdAt
				}
			}
		}
	`

	// Execute the mutation with a file upload
	var operationsJSON string

	// Build the input object parts
	inputParts := []string{fmt.Sprintf(`"projectId": "%s"`, projectId)}

	// Add optional parameters if provided
	if skipDecompression {
		inputParts = append(inputParts, `"skipDecompression": true`)
	}

	if contentEncoding != "" {
		inputParts = append(inputParts, fmt.Sprintf(`"contentEncoding": "%s"`, contentEncoding))
	}

	if token != "" {
		inputParts = append(inputParts, fmt.Sprintf(`"token": "%s"`, token))
	}

	if url != "" {
		inputParts = append(inputParts, fmt.Sprintf(`"url": "%s"`, url))
	}

	// If we're uploading a file
	if data != nil {
		inputParts = append(inputParts, `"file": null`)

		// Construct the final JSON
		operationsJSON = fmt.Sprintf(`{
			"query": "%s",
			"variables": {
				"input": {
					%s
				}
			}
		}`, escapeForJSON(query), strings.Join(inputParts, ", "))
	} else if url != "" || token != "" {
		// Construct the final JSON without file
		operationsJSON = fmt.Sprintf(`{
			"query": "%s",
			"variables": {
				"input": {
					%s
				}
			}
		}`, escapeForJSON(query), strings.Join(inputParts, ", "))
	} else {
		// Default case with file
		inputParts = append(inputParts, `"file": null`)
		operationsJSON = fmt.Sprintf(`{
			"query": "%s",
			"variables": {
				"input": {
					%s
				}
			}
		}`, escapeForJSON(query), strings.Join(inputParts, ", "))
	}

	var res *httpexpect.Value

	// Handle different cases based on what's provided
	if data != nil {
		// File upload case
		mapJSON := `{ "0": ["variables.input.file"] }`

		res = e.POST("/api/graphql").
			WithHeader("Origin", "https://example.com").
			WithHeader("X-Reearth-Debug-User", uId1.String()).
			WithMultipart().
			WithFile("operations", "operations.json", strings.NewReader(operationsJSON)).
			WithFile("map", "map.json", strings.NewReader(mapJSON)).
			WithFile("0", fileName, strings.NewReader(string(data))).
			WithFormField("Content-Type", contentType).
			Expect().
			Status(200).
			JSON()
	} else {
		// URL or token case - no file upload needed
		res = e.POST("/api/graphql").
			WithHeader("Origin", "https://example.com").
			WithHeader("X-Reearth-Debug-User", uId1.String()).
			WithHeader("Content-Type", "application/json").
			WithJSON(GraphQLRequest{
				Query: query,
				Variables: map[string]interface{}{
					"input": map[string]interface{}{
						"projectId":         projectId,
						"skipDecompression": skipDecompression,
					},
				},
			}).
			Expect().
			Status(200).
			JSON()
	}

	// Extract the asset ID from the response
	assetId := res.Path("$.data.createAsset.asset.id").String().Raw()
	return assetId, res
}

// Helper function to escape a string for JSON
func escapeForJSON(s string) string {
	s = strings.ReplaceAll(s, "\\", "\\\\")
	s = strings.ReplaceAll(s, "\"", "\\\"")
	s = strings.ReplaceAll(s, "\n", "\\n")
	s = strings.ReplaceAll(s, "\r", "\\r")
	s = strings.ReplaceAll(s, "\t", "\\t")
	return s
}
