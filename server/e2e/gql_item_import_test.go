package e2e

import (
	"encoding/json"
	"net/http"
	"strings"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/samber/lo"
)

// importItems executes the importItems GraphQL mutation with file upload
func importItems(e *httpexpect.Expect, modelID string, fileName string, fileContent string, geoField *string) *httpexpect.Value {
	query := `mutation ImportItems($input: ImportItemsInput!) {
		importItems(input: $input) {
			modelId
			totalCount
			insertedCount
			updatedCount
			ignoredCount
		}
	}`

	inputMap := map[string]any{
		"modelId": modelID,
		"file":    nil, // placeholder for multipart file upload
	}
	if geoField != nil {
		inputMap["geoField"] = *geoField
	}

	variables := map[string]any{
		"input": inputMap,
	}

	requestBody := GraphQLRequest{
		Query:     query,
		Variables: variables,
	}

	operations, _ := json.Marshal(requestBody)
	mapJSON := `{ "0": ["variables.input.file"] }`

	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithMultipart().
		WithFormField("operations", string(operations)).
		WithFormField("map", mapJSON).
		WithFile("0", fileName, strings.NewReader(fileContent)).
		Expect().
		Status(http.StatusOK).
		JSON()

	return res
}

// TestGQLImportItems tests importing items via GraphQL mutation using table-driven tests
func TestGQLImportItems(t *testing.T) {
	type createFieldParams struct {
		title    string
		key      string
		fType    string
		typeProp map[string]any
	}

	tests := []struct {
		name           string
		fields         []createFieldParams
		fileName       string
		fileContent    func() string
		geoField       *string
		expectError    bool
		errorContains  string
		expectedTotal  int
		expectedInsert int
		expectedUpdate int
		expectedIgnore int
	}{
		{
			name: "JSON array with multiple items",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
				{title: "count", key: "count", fType: "Integer", typeProp: map[string]any{"integer": map[string]any{}}},
			},
			fileName: "test.json",
			fileContent: func() string {
				return `[
					{"name": "Item 1", "count": 10},
					{"name": "Item 2", "count": 20},
					{"name": "Item 3", "count": 30}
				]`
			},
			expectError:    false,
			expectedTotal:  3,
			expectedInsert: 3,
			expectedUpdate: 0,
			expectedIgnore: 0,
		},
		{
			name: "JSON with different field types",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
				{title: "population", key: "population", fType: "Integer", typeProp: map[string]any{"integer": map[string]any{}}},
			},
			fileName: "locations.json",
			fileContent: func() string {
				return `[
					{"name": "Tokyo", "population": 13960000},
					{"name": "San Francisco", "population": 874961}
				]`
			},
			expectError:    false,
			expectedTotal:  2,
			expectedInsert: 2,
			expectedUpdate: 0,
			expectedIgnore: 0,
		},
		{
			name: "file too large (exceeds 10MB)",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
			},
			fileName: "large.json",
			fileContent: func() string {
				// Create content larger than 10MB limit (~12MB)
				largeContent := strings.Repeat(`{"name": "test"},`, 800000)
				return "[" + largeContent[:len(largeContent)-1] + "]"
			},
			expectError:   true,
			errorContains: "too large",
		},
		{
			name: "too many records (exceeds 2000)",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
			},
			fileName: "many.json",
			fileContent: func() string {
				var items []string
				for i := 0; i < 2001; i++ {
					items = append(items, `{"name": "test"}`)
				}
				return "[" + strings.Join(items, ",") + "]"
			},
			expectError:   true,
			errorContains: "too many records",
		},
		{
			name: "empty array",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
			},
			fileName: "empty.json",
			fileContent: func() string {
				return "[]"
			},
			expectError:    false,
			expectedTotal:  0,
			expectedInsert: 0,
			expectedUpdate: 0,
			expectedIgnore: 0,
		},
		{
			name: "items with partial/missing fields",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
				{title: "description", key: "description", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
				{title: "count", key: "count", fType: "Integer", typeProp: map[string]any{"integer": map[string]any{}}},
			},
			fileName: "partial.json",
			fileContent: func() string {
				return `[
					{"name": "Item 1", "description": "Full item", "count": 100},
					{"name": "Item 2"},
					{"name": "Item 3", "count": 300}
				]`
			},
			expectError:    false,
			expectedTotal:  3,
			expectedInsert: 3,
			expectedUpdate: 0,
			expectedIgnore: 0,
		},
		{
			name: "invalid JSON",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
			},
			fileName: "invalid.json",
			fileContent: func() string {
				return "{invalid json"
			},
			expectError: true,
		},
		{
			name: "multiple batches (1050 items > 1000 chunk size)",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
			},
			fileName: "batches.json",
			fileContent: func() string {
				var items []string
				for i := 0; i < 1050; i++ {
					items = append(items, `{"name": "test"}`)
				}
				return "[" + strings.Join(items, ",") + "]"
			},
			expectError:    false,
			expectedTotal:  1050,
			expectedInsert: 1050,
			expectedUpdate: 0,
			expectedIgnore: 0,
		},
		{
			name: "unknown fields are ignored",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
			},
			fileName: "unknown.json",
			fileContent: func() string {
				return `[{"name": "Item 1", "unknownField": "should be ignored", "anotherUnknown": 123}]`
			},
			expectError:    false,
			expectedTotal:  1,
			expectedInsert: 1,
			expectedUpdate: 0,
			expectedIgnore: 0,
		},
		{
			name: "GeoJSON FeatureCollection import",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
				{title: "location", key: "location", fType: "GeometryObject", typeProp: map[string]any{
					"geometryObject": map[string]any{
						"supportedTypes": []string{"POINT", "LINESTRING", "POLYGON"},
					},
				}},
			},
			fileName: "locations.geojson",
			fileContent: func() string {
				return `{
					"type": "FeatureCollection",
					"features": [
						{
							"type": "Feature",
							"geometry": {"type": "Point", "coordinates": [139.6917, 35.6895]},
							"properties": {"name": "Tokyo"}
						},
						{
							"type": "Feature",
							"geometry": {"type": "Point", "coordinates": [-122.4194, 37.7749]},
							"properties": {"name": "San Francisco"}
						}
					]
				}`
			},
			geoField:       lo.ToPtr("location"),
			expectError:    false,
			expectedTotal:  2,
			expectedInsert: 2,
			expectedUpdate: 0,
			expectedIgnore: 0,
		},
		{
			name: "GeoJSON FeatureCollection import with auto-detected geoField",
			fields: []createFieldParams{
				{title: "name", key: "name", fType: "Text", typeProp: map[string]any{"text": map[string]any{}}},
				{title: "location", key: "location", fType: "GeometryObject", typeProp: map[string]any{
					"geometryObject": map[string]any{
						"supportedTypes": []string{"POINT", "LINESTRING", "POLYGON"},
					},
				}},
			},
			fileName: "locations.geojson",
			fileContent: func() string {
				return `{
					"type": "FeatureCollection",
					"features": [
						{
							"type": "Feature",
							"geometry": {"type": "Point", "coordinates": [139.6917, 35.6895]},
							"properties": {"name": "Tokyo"}
						},
						{
							"type": "Feature",
							"geometry": {"type": "Point", "coordinates": [-122.4194, 37.7749]},
							"properties": {"name": "San Francisco"}
						}
					]
				}`
			},
			// geoField is not specified - should auto-detect "location" field
			expectError:    false,
			expectedTotal:  2,
			expectedInsert: 2,
			expectedUpdate: 0,
			expectedIgnore: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := StartServer(t, &app.Config{}, true, baseSeederUser)

			pId, _ := createProject(e, wId.String(), "test", "test", "e2e-alias")
			mId, _ := createModel(e, pId, "test", "test", "e2e-alias")

			// Create fields for the model
			for _, f := range tt.fields {
				createField(e, mId, f.title, f.title, f.key,
					false, false, false, false, f.fType, f.typeProp)
			}

			// Execute import
			res := importItems(e, mId, tt.fileName, tt.fileContent(), tt.geoField)

			if tt.expectError {
				errors := res.Path("$.errors").Array()
				errors.Length().Gt(0)
				if tt.errorContains != "" {
					errors.Value(0).Object().Value("message").String().Contains(tt.errorContains)
				}
				return
			}

			// Verify success response
			res.Path("$.data.importItems.modelId").String().IsEqual(mId)
			res.Path("$.data.importItems.totalCount").Number().IsEqual(tt.expectedTotal)
			res.Path("$.data.importItems.insertedCount").Number().IsEqual(tt.expectedInsert)
			res.Path("$.data.importItems.updatedCount").Number().IsEqual(tt.expectedUpdate)
			res.Path("$.data.importItems.ignoredCount").Number().IsEqual(tt.expectedIgnore)

			// Verify items were created by searching
			if tt.expectedTotal > 0 {
				searchRes := SearchItem(e,
					map[string]any{"project": pId, "model": mId},
					nil,
					nil,
					map[string]any{"first": 1},
				)
				searchRes.Path("$.data.searchItem.totalCount").Number().IsEqual(tt.expectedTotal)
			}
		})
	}
}
