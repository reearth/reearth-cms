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
	"github.com/reearth/reearthx/usecasex"
	"github.com/stretchr/testify/assert"
)

// Reference to the user ID defined in gql_workspace_test.go
var _ = accountdomain.UserID{}

func TestSearchAsset(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	// Create a project
	pId, _ := createAssetProject(e, "workspace-1", "asset-test", "asset test project", "asset-test")

	// Upload assets with different properties
	// Asset 1: JSON file
	asset1Id, _ := createAsset(e, pId, "test1.json", "application/json", []byte(`{"test": "data"}`))

	// Asset 2: GeoJSON file
	asset2Id, _ := createAsset(e, pId, "test2.geojson", "application/geo+json", []byte(`{"type": "Feature", "geometry": {"type": "Point", "coordinates": [125.6, 10.1]}}`))

	// Asset 3: Image file
	_, _ = createAsset(e, pId, "image.png", "image/png", []byte("fake image data"))

	// Asset 4: Another JSON file with different name
	asset4Id, _ := createAsset(e, pId, "data.json", "application/json", []byte(`{"more": "data"}`))

	// Test cases
	// 1. Search by ID
	res := searchAsset(e, pId, asset1Id, nil, nil, nil)
	assert.Equal(t, 1, res.Path("$.data.searchAsset.totalCount").Raw())
	assert.Equal(t, []interface{}{asset1Id}, res.Path("$.data.searchAsset.nodes[*].id").Raw())

	// 2. Search by keyword (filename)
	res = searchAsset(e, pId, "test", nil, nil, nil)
	assert.Equal(t, 2, res.Path("$.data.searchAsset.totalCount").Raw())
	ids := res.Path("$.data.searchAsset.nodes[*].id").Raw()
	assert.Contains(t, ids, asset1Id)
	assert.Contains(t, ids, asset2Id)

	// 3. Search by content type - JSON
	res = searchAsset(e, pId, "", []string{"JSON"}, nil, nil)
	assert.Equal(t, 2, res.Path("$.data.searchAsset.totalCount").Raw())
	ids = res.Path("$.data.searchAsset.nodes[*].id").Raw()
	assert.Contains(t, ids, asset1Id)
	assert.Contains(t, ids, asset4Id)

	// 4. Search by content type - GEOJSON
	res = searchAsset(e, pId, "", []string{"GEOJSON"}, nil, nil)
	assert.Equal(t, 1, res.Path("$.data.searchAsset.totalCount").Raw())
	assert.Equal(t, []interface{}{asset2Id}, res.Path("$.data.searchAsset.nodes[*].id").Raw())

	// 5. Sort by date (default is DESC)
	res = searchAsset(e, pId, "", nil, &gqlmodel.AssetSort{
		SortBy:    gqlmodel.AssetSortTypeDate,
		Direction: sortDirectionPtr(gqlmodel.SortDirectionDesc),
	}, nil)
	assert.Equal(t, 4, res.Path("$.data.searchAsset.totalCount").Raw())
	// The assets should be sorted by creation date in descending order
	// Since we created them in sequence, the last one should be first
	ids = res.Path("$.data.searchAsset.nodes[*].id").Raw()
	idList := ids.([]interface{})
	assert.Equal(t, asset4Id, idList[0])
	assert.Equal(t, asset1Id, idList[len(idList)-1])

	// 6. Sort by date ASC
	res = searchAsset(e, pId, "", nil, &gqlmodel.AssetSort{
		SortBy:    gqlmodel.AssetSortTypeDate,
		Direction: sortDirectionPtr(gqlmodel.SortDirectionAsc),
	}, nil)
	assert.Equal(t, 4, res.Path("$.data.searchAsset.totalCount").Raw())
	// The assets should be sorted by creation date in ascending order
	ids = res.Path("$.data.searchAsset.nodes[*].id").Raw()
	idList = ids.([]interface{})
	assert.Equal(t, asset1Id, idList[0])
	assert.Equal(t, asset4Id, idList[len(idList)-1])

	// 7. Sort by name
	res = searchAsset(e, pId, "", nil, &gqlmodel.AssetSort{
		SortBy:    gqlmodel.AssetSortTypeName,
		Direction: sortDirectionPtr(gqlmodel.SortDirectionAsc),
	}, nil)
	assert.Equal(t, 4, res.Path("$.data.searchAsset.totalCount").Raw())
	// The assets should be sorted by name in ascending order
	fileNames := res.Path("$.data.searchAsset.nodes[*].fileName").Raw()
	fileNameList := fileNames.([]interface{})
	assert.Equal(t, "data.json", fileNameList[0])
	assert.Equal(t, "test2.geojson", fileNameList[len(fileNameList)-1])

	// 8. Pagination - first page
	res = searchAsset(e, pId, "", nil, nil, &gqlmodel.Pagination{
		First: intPtr(2),
	})
	assert.Equal(t, 4, res.Path("$.data.searchAsset.totalCount").Raw())
	assert.Equal(t, 2, len(res.Path("$.data.searchAsset.nodes").Raw().([]interface{})))
	assert.Equal(t, true, res.Path("$.data.searchAsset.pageInfo.hasNextPage").Raw())

	// Get the end cursor for the next page
	endCursor := res.Path("$.data.searchAsset.pageInfo.endCursor").Raw()

	// 9. Pagination - second page
	res = searchAsset(e, pId, "", nil, nil, &gqlmodel.Pagination{
		First: intPtr(2),
		After: cursorPtr(endCursor.(string)),
	})
	assert.Equal(t, 4, res.Path("$.data.searchAsset.totalCount").Raw())
	assert.Equal(t, 2, len(res.Path("$.data.searchAsset.nodes").Raw().([]interface{})))
	assert.Equal(t, false, res.Path("$.data.searchAsset.pageInfo.hasNextPage").Raw())

	// 10. Combined search - keyword + content type
	res = searchAsset(e, pId, "test", []string{"JSON"}, nil, nil)
	assert.Equal(t, 1, res.Path("$.data.searchAsset.totalCount").Raw())
	assert.Equal(t, []interface{}{asset1Id}, res.Path("$.data.searchAsset.nodes[*].id").Raw())
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
				nodes {
					id
					fileName
					contentType
					size
					createdAt
				}
				totalCount
				pageInfo {
					hasNextPage
					hasPreviousPage
					startCursor
					endCursor
				}
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
func createAsset(e *httpexpect.Expect, projectId string, fileName string, contentType string, data []byte) (string, *httpexpect.Value) {
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
	operationsJSON := fmt.Sprintf(`{
		"query": "%s",
		"variables": {
			"input": {
				"projectId": "%s",
				"file": null
			}
		}
	}`, escapeForJSON(query), projectId)

	mapJSON := `{ "0": ["variables.input.file"] }`

	res := e.POST("/api/graphql").
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

	// Extract the asset ID from the response
	assetId := res.Path("$.data.createAsset.asset.id").String().Raw()
	return assetId, res
}

// Helper function to create a project for asset tests
func createAssetProject(e *httpexpect.Expect, workspaceId, name, description, alias string) (string, *httpexpect.Value) {
	query := `
		mutation CreateProject($input: CreateProjectInput!) {
			createProject(input: $input) {
				project {
					id
					name
					description
					alias
				}
			}
		}
	`

	variables := map[string]interface{}{
		"input": map[string]interface{}{
			"workspaceId": workspaceId,
			"name":        name,
			"description": description,
			"alias":       alias,
		},
	}

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

	projectId := res.Path("$.data.createProject.project.id").String().Raw()
	return projectId, res
}

// Helper function to escape a string for JSON
func escapeForJSON(s string) string {
	s = strings.Replace(s, "\\", "\\\\", -1)
	s = strings.Replace(s, "\"", "\\\"", -1)
	s = strings.Replace(s, "\n", "\\n", -1)
	s = strings.Replace(s, "\r", "\\r", -1)
	s = strings.Replace(s, "\t", "\\t", -1)
	return s
}

// Helper functions for pointers
func intPtr(i int) *int {
	return &i
}

func cursorPtr(s string) *usecasex.Cursor {
	c := usecasex.Cursor(s)
	return &c
}

func sortDirectionPtr(d gqlmodel.SortDirection) *gqlmodel.SortDirection {
	return &d
}
