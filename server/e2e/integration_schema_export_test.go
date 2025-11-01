package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

// iAPIModelSchemaExport and iAPIModelMetadataSchemaExport are defined in integration_model_test.go

func iAPISchemaExport(e *httpexpect.Expect, schemaId interface{}) *httpexpect.Request {
	endpoint := "/api/schemata/{schemaId}/schema.json"
	return e.GET(endpoint, schemaId)
}

func iAPIProjectSchemaExport(e *httpexpect.Expect, projectIdOrAlias interface{}, schemaId interface{}) *httpexpect.Request {
	endpoint := "/api/projects/{projectIdOrAlias}/schemata/{schemaId}/schema.json"
	return e.GET(endpoint, projectIdOrAlias, schemaId)
}

func iAPIProjectModelSchemaExport(e *httpexpect.Expect, projectIdOrAlias interface{}, modelIdOrKey interface{}) *httpexpect.Request {
	endpoint := "/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/schema.json"
	return e.GET(endpoint, projectIdOrAlias, modelIdOrKey)
}

func iAPIProjectModelMetadataSchemaExport(e *httpexpect.Expect, projectIdOrAlias interface{}, modelIdOrKey interface{}) *httpexpect.Request {
	endpoint := "/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/metadata_schema.json"
	return e.GET(endpoint, projectIdOrAlias, modelIdOrKey)
}

func TestIntegrationJSONSchemaExportAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// /api/schemata/{schemaId}/schema.json
	iAPISchemaExport(e, sid1).
		WithHeader("authorization", "Bearer abcd").
		Expect().
		Status(http.StatusUnauthorized)

	iAPISchemaExport(e, id.NewSchemaID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	iAPISchemaExport(e, sid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"$id":         sid1,
			"title":       "m1",
			"description": "m1 desc",
			"$schema":     "https://json-schema.org/draft/2020-12/schema",
			"properties": map[string]any{
				"asset": map[string]any{
					"type":   "string",
					"format": "binary",
				},
				sfKey1.String(): map[string]any{
					"type": "string",
				},
			},
			"type": "object",
		})

	// /api/projects/{projectIdOrAlias}/schemata/{schemaId}/schema.json
	iAPIProjectSchemaExport(e, pid, sid1).
		WithHeader("authorization", "Bearer abcd").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectSchemaExport(e, pid, id.NewSchemaID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	iAPIProjectSchemaExport(e, pid, sid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"$id":         sid1,
			"title":       "m1",
			"description": "m1 desc",
			"$schema":     "https://json-schema.org/draft/2020-12/schema",
			"properties": map[string]any{
				"asset": map[string]any{
					"type":   "string",
					"format": "binary",
				},
				sfKey1.String(): map[string]any{
					"type": "string",
				},
			},
			"type": "object",
		})

	// /api/projects/{projectIdOrAlias}/models/{modelId}/schema.json
	iAPIProjectModelSchemaExport(e, pid, mId1).
		WithHeader("authorization", "Bearer abcd").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectModelSchemaExport(e, pid, id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	iAPIProjectModelSchemaExport(e, pid, mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"$id":     sid1,
			"$schema": "https://json-schema.org/draft/2020-12/schema",
			"properties": map[string]any{
				"asset": map[string]any{
					"type":   "string",
					"format": "binary",
				},
				sfKey1.String(): map[string]any{
					"type": "string",
				},
			},
			"type":        "object",
			"description": "m1 desc",
			"title":       "m1",
		})

	// /api/projects/{projectIdOrAlias}/models/{modelId}/metadata_schema.json
	iAPIProjectModelMetadataSchemaExport(e, pid, mId1).
		WithHeader("authorization", "Bearer abcd").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectModelMetadataSchemaExport(e, pid, id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	iAPIProjectModelMetadataSchemaExport(e, pid, mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"$id":     msid1,
			"$schema": "https://json-schema.org/draft/2020-12/schema",
			"properties": map[string]any{
				sfKey4.String(): map[string]any{
					"type": "boolean",
				},
			},
			"type":        "object",
			"description": "m1 desc",
			"title":       "m1",
		})

	// /api/models/{modelId}/schema.json
	iAPIModelSchemaExport(e, wId0, pid, mId1).
		WithHeader("authorization", "Bearer abcd").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelSchemaExport(e, wId0, pid, id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	iAPIModelSchemaExport(e, wId0, pid, mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"$id":     sid1,
			"$schema": "https://json-schema.org/draft/2020-12/schema",
			"properties": map[string]any{
				"asset": map[string]any{
					"type":   "string",
					"format": "binary",
				},
				sfKey1.String(): map[string]any{
					"type": "string",
				},
			},
			"type":        "object",
			"description": "m1 desc",
			"title":       "m1",
		})

	// /api/models/{modelId}/metadata_schema.json
	iAPIModelMetadataSchemaExport(e, wId0, pid, mId1).
		WithHeader("authorization", "Bearer abcd").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelMetadataSchemaExport(e, wId0, pid, id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	iAPIModelMetadataSchemaExport(e, wId0, pid, mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"$id":     msid1,
			"$schema": "https://json-schema.org/draft/2020-12/schema",
			"properties": map[string]any{
				sfKey4.String(): map[string]any{
					"type": "boolean",
				},
			},
			"type":        "object",
			"description": "m1 desc",
			"title":       "m1",
		})
}
