package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

func TestIntegrationSchemaJSONExportAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// /api/schemata/{schemaId}/schema.json
	e.GET("/api/schemata/{schemaId}/schema.json", sid1).
		WithHeader("authorization", "Bearer abcd").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/schemata/{schemaId}/schema.json", id.NewSchemaID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	e.GET("/api/schemata/{schemaId}/schema.json", sid1).
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
			"type": "object",
		})

	// /api/projects/{projectIdOrAlias}/schemata/{schemaId}/schema.json
	e.GET("/api/projects/{projectIdOrAlias}/schemata/{schemaId}/schema.json", pid, sid1).
		WithHeader("authorization", "Bearer abcd").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/projects/{projectIdOrAlias}/schemata/{schemaId}/schema.json", pid, id.NewSchemaID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	e.GET("/api/projects/{projectIdOrAlias}/schemata/{schemaId}/schema.json", pid, sid1).
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
			"type": "object",
		})

	// /api/projects/{projectIdOrAlias}/models/{modelId}/schema.json
	e.GET("/api/projects/{projectIdOrAlias}/models/{modelId}/schema.json", pid, mId1).
		WithHeader("authorization", "Bearer abcd").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/projects/{projectIdOrAlias}/models/{modelId}/schema.json", pid, id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	e.GET("/api/projects/{projectIdOrAlias}/models/{modelId}/schema.json", pid, mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"$id":     mId1,
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
	e.GET("/api/projects/{projectIdOrAlias}/models/{modelId}/metadata_schema.json", pid, mId1).
		WithHeader("authorization", "Bearer abcd").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/projects/{projectIdOrAlias}/models/{modelId}/metadata_schema.json", pid, id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	e.GET("/api/projects/{projectIdOrAlias}/models/{modelId}/metadata_schema.json", pid, mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"$id":     mId1,
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
	e.GET("/api/models/{modelId}/schema.json", mId1).
		WithHeader("authorization", "Bearer abcd").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/models/{modelId}/schema.json", id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	e.GET("/api/models/{modelId}/schema.json", mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"$id":     mId1,
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
	e.GET("/api/models/{modelId}/metadata_schema.json", mId1).
		WithHeader("authorization", "Bearer abcd").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/models/{modelId}/metadata_schema.json", id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	e.GET("/api/models/{modelId}/metadata_schema.json", mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"$id":     mId1,
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
