package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
)

// createGeometryItem creates an item with a single Geometry field value and returns the whole response, including errors.
func createGeometryItem(e *httpexpect.Expect, mID, sID, fID string, v any) *httpexpect.Value {
	return e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uId1.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(GraphQLRequest{
			Query: `mutation CreateItem($modelId: ID!, $schemaId: ID!, $fields: [ItemFieldInput!]!) {
				createItem(input: {modelId: $modelId, schemaId: $schemaId, fields: $fields}) {
					item { id }
				}
			}`,
			Variables: map[string]any{
				"modelId":  mID,
				"schemaId": sID,
				"fields":   []map[string]any{{"schemaFieldId": fID, "type": "Geometry", "value": v}},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON()
}

func TestGQLItemGeometryField_ValidationAndUnique(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeederUser)

	pId, _ := createProject(e, wId.String(), "geometry", "", "geometry")
	mId, _ := createModel(e, pId, "geometry", "", "geometry")
	fId, _ := createField(e, mId, "geo", "", "geo", false, true, false, false, "Geometry", map[string]any{"geometry": map[string]any{}})
	sId, _, _ := getModel(e, mId)

	line := `{"type":"LineString","coordinates":[[139.7,35.6],[139.8,35.7]]}`
	createGeometryItem(e, mId, sId, fId, line).Path("$.data.createItem.item.id").String().NotEmpty()

	tests := []struct {
		name    string
		value   any
		wantErr string
	}{
		{
			name:    "the same line in the reverse direction is a duplicate",
			value:   `{"type":"LineString","coordinates":[[139.8,35.7],[139.7,35.6]]}`,
			wantErr: "UNIQUE_VIOLATION",
		},
		{
			name:    "reversed coordinates are rejected with their cause",
			value:   `{"type":"Point","coordinates":[35.6,139.7]}`,
			wantErr: "INVALID_GEO_STRUCTURE (coordinates seem to be in latitude, longitude order",
		},
		{
			name:  "a different shape is not a duplicate",
			value: `{"type":"LineString","coordinates":[[139.7,35.6],[139.9,35.7]]}`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			res := createGeometryItem(e, mId, sId, fId, tt.value)
			if tt.wantErr == "" {
				res.Path("$.data.createItem.item.id").String().NotEmpty()
				return
			}
			res.Path("$.data.createItem").IsNull()
			res.Path("$.errors").Array().Value(0).Object().Value("message").String().Contains(tt.wantErr)
		})
	}
}
