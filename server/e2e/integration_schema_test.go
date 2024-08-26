package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

// GET /projects/{projectIdOrKey}/schemata
func TestIntegrationScemaFilterAPI(t *testing.T) {
	endpoint := "/api/projects/{projectIdOrKey}/schemata"
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.GET(endpoint, id.NewProjectID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.GET(endpoint, id.NewProjectID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET(endpoint, id.NewProjectID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET(endpoint, id.NewProjectID()).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 0).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusNotFound)

	assertRes := func(t *testing.T, res *httpexpect.Response) {
		t.Helper()

		models := res.Status(http.StatusOK).
			JSON().
			Object().
			HasValue("page", 1).
			HasValue("perPage", 10).
			HasValue("totalCount", 5).
			Value("models").
			Array()
		models.Length().IsEqual(5)

		obj1 := models.Value(0).Object()
		obj1.
			HasValue("id", mId1.String()).
			HasValue("name", "m1").
			HasValue("description", "m1 desc").
			HasValue("public", true).
			HasValue("key", ikey1.String()).
			HasValue("projectId", pid).
			HasValue("schemaId", sid1)

		obj1.Value("createdAt").NotNull()
		obj1.Value("updatedAt").NotNull()
		obj1.Value("lastModified").NotNull()

		obj2 := models.Value(1).Object()
		obj2.
			HasValue("id", mId2.String()).
			HasValue("name", "m2").
			HasValue("description", "m2 desc").
			HasValue("public", true).
			HasValue("key", ikey2.String()).
			HasValue("projectId", pid).
			HasValue("schemaId", sid2)

		obj2.Value("createdAt").NotNull()
		obj2.Value("updatedAt").NotNull()
		obj2.Value("lastModified").NotNull()
	}

	assertRes(t, e.GET(endpoint, pid).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 10).
		Expect())

	assertRes(t, e.GET(endpoint, palias).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 10).
		Expect())

	res := e.GET(endpoint, palias).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 10).
		WithQuery("keyword", "m1").
		Expect()

	models := res.Status(http.StatusOK).
		JSON().
		Object().
		HasValue("page", 1).
		HasValue("perPage", 10).
		HasValue("totalCount", 1).
		Value("models").
		Array()
	models.Length().IsEqual(1)

	obj1 := models.Value(0).Object()
	obj1.
		HasValue("id", mId1.String()).
		HasValue("name", "m1").
		HasValue("description", "m1 desc").
		HasValue("public", true).
		HasValue("key", ikey1.String()).
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj1.Value("createdAt").NotNull()
	obj1.Value("updatedAt").NotNull()
	obj1.Value("lastModified").NotNull()
}

// POST /api/models/{modelId}/fields
func TestIntegrationFieldCreateAPI(t *testing.T) {
	endpoint := "/api/schemata/{schemaId}/fields"
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.POST(endpoint, id.NewSchemaID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.POST(endpoint, id.NewSchemaID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.POST(endpoint, id.NewSchemaID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.POST(endpoint, id.NewSchemaID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	// key cannot be used
	e.POST(endpoint, ikey1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusBadRequest)

	obj1 := e.POST(endpoint, sid1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"key":      "fKey1",
			"type":     "bool",
			"multiple": false,
			"required": false,
		}).
		Expect().
		Status(http.StatusOK)

	obj1.JSON().Object().ContainsKey("id")

	obj := e.GET("/api/models/{modelId}", mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", mId1.String()).
		HasValue("name", "m1").
		HasValue("description", "m1 desc").
		HasValue("public", true).
		HasValue("key", ikey1.String()).
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj.Value("createdAt").NotNull()
	obj.Value("updatedAt").NotNull()
	obj.Value("lastModified").NotNull()
}

// PATCH /api/models/{modelId}/fields/{FieldIdOrKey}
func TestIntegrationFieldUpdateAPI(t *testing.T) {
	endpoint := "/api/schemata/{schemaId}/fields/{fieldIdOrKey}"
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	obj := e.POST("/api/schemata/{schemaId}/fields", sid1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"key":      "fKey1",
			"type":     "bool",
			"multiple": false,
			"required": false,
		}).
		Expect().
		Status(http.StatusOK)
	fId := obj.JSON().Object().Value("id").String().Raw()

	e.PATCH(endpoint, id.NewModelID(), id.NewFieldID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.PATCH(endpoint, id.NewSchemaID(), id.NewFieldID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.PATCH(endpoint, id.NewSchemaID(), id.NewFieldID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.PATCH(endpoint, id.NewSchemaID(), id.NewFieldID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	e.PATCH(endpoint, id.NewSchemaID(), fId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	// model key cannot be used
	e.PATCH(endpoint, ikey1, fId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusBadRequest)

	e.PATCH(endpoint, sid1, fId).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"key":      "fKey1Updated",
			"type":     "bool",
			"multiple": true,
			"required": true,
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", fId).
		HasValue("key", "fKey1Updated").
		HasValue("type", "bool").
		HasValue("multiple", true).
		HasValue("required", true)

	e.PATCH(endpoint, sid1, "fKey1Updated").
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"key":      "fKey1Updated1",
			"type":     "bool",
			"multiple": true,
			"required": true,
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", fId).
		HasValue("key", "fKey1Updated1").
		HasValue("type", "bool").
		HasValue("multiple", true).
		HasValue("required", true)

	obj1 := e.GET("/api/models/{modelId}", mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", mId1.String()).
		HasValue("name", "m1").
		HasValue("description", "m1 desc").
		HasValue("public", true).
		HasValue("key", ikey1.String()).
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj1.Value("createdAt").NotNull()
	obj1.Value("updatedAt").NotNull()
	obj1.Value("lastModified").NotNull()
}

// DELETE /api/models/{modelId}/fields/{FieldIdOrKey}
func TestIntegrationFieldDeleteAPI(t *testing.T) {
	endpoint := "/api/schemata/{schemaId}/fields/{fieldIdOrKey}"
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	obj := e.POST("/api/schemata/{schemaId}/fields", sid1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"key":      "fKey1",
			"type":     "bool",
			"multiple": false,
			"required": false,
		}).
		Expect().
		Status(http.StatusOK)
	fId := obj.JSON().Object().Value("id").String().Raw()

	e.DELETE(endpoint, id.NewSchemaID(), id.NewFieldID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.DELETE(endpoint, id.NewSchemaID(), id.NewFieldID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.DELETE(endpoint, id.NewSchemaID(), id.NewFieldID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.DELETE(endpoint, id.NewSchemaID(), id.NewFieldID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	e.DELETE(endpoint, id.NewSchemaID(), fId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	// model key cannot be used
	e.DELETE(endpoint, ikey1, fId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusBadRequest)

	e.DELETE(endpoint, sid1, fId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", fId)

	obj = e.POST("/api/schemata/{schemaId}/fields", sid1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"key":      "fKey1",
			"type":     "bool",
			"multiple": false,
			"required": false,
		}).
		Expect().
		Status(http.StatusOK)
	fId = obj.JSON().Object().Value("id").String().Raw()

	e.DELETE(endpoint, sid1, "fKey1").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", fId)

	obj1 := e.GET("/api/models/{modelId}", mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", mId1.String()).
		HasValue("name", "m1").
		HasValue("description", "m1 desc").
		HasValue("public", true).
		HasValue("key", ikey1.String()).
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj1.Value("createdAt").NotNull()
	obj1.Value("updatedAt").NotNull()
	obj1.Value("lastModified").NotNull()
}

// POST /api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/fields
func TestIntegrationFieldCreateWithProjectAPI(t *testing.T) {
	endpoint := "/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/fields"
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.POST(endpoint, pid, id.NewModelID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.POST(endpoint, pid, id.NewModelID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.POST(endpoint, pid, id.NewModelID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.POST(endpoint, pid, id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	obj1 := e.POST(endpoint, pid, mId1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"key":      "fKey1",
			"type":     "bool",
			"multiple": false,
			"required": false,
		}).
		Expect().
		Status(http.StatusOK)

	obj1.JSON().Object().ContainsKey("id")

	obj1 = e.POST(endpoint, pid, ikey1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"key":      "fKey2",
			"type":     "bool",
			"multiple": false,
			"required": false,
		}).
		Expect().
		Status(http.StatusOK)

	obj1.JSON().Object().ContainsKey("id")

	obj := e.GET("/api/models/{modelId}", mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", mId1.String()).
		HasValue("name", "m1").
		HasValue("description", "m1 desc").
		HasValue("public", true).
		HasValue("key", ikey1.String()).
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj.Value("createdAt").NotNull()
	obj.Value("updatedAt").NotNull()
	obj.Value("lastModified").NotNull()
}

// PATCH /api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/fields/{FieldIdOrKey}
func TestIntegrationFieldUpdateWithProjectAPI(t *testing.T) {
	endpoint := "/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/fields/{fieldIdOrKey}"
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	obj := e.POST("/api/schemata/{schemaId}/fields", sid1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"key":      "fKey1",
			"type":     "bool",
			"multiple": false,
			"required": false,
		}).
		Expect().
		Status(http.StatusOK)
	fId := obj.JSON().Object().Value("id").String().Raw()

	e.PATCH(endpoint, pid, id.NewModelID(), id.NewFieldID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.PATCH(endpoint, pid, id.NewModelID(), id.NewFieldID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.PATCH(endpoint, pid, id.NewModelID(), id.NewFieldID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.PATCH(endpoint, pid, id.NewModelID(), id.NewFieldID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	e.PATCH(endpoint, pid, id.NewModelID(), fId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	e.PATCH(endpoint, pid, mId1, fId).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"key":      "fKey1Updated",
			"type":     "bool",
			"multiple": true,
			"required": true,
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", fId).
		HasValue("key", "fKey1Updated").
		HasValue("type", "bool").
		HasValue("multiple", true).
		HasValue("required", true)

	e.PATCH(endpoint, pid, mId1, "fKey1Updated").
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"key":      "fKey1Updated1",
			"type":     "bool",
			"multiple": true,
			"required": true,
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", fId).
		HasValue("key", "fKey1Updated1").
		HasValue("type", "bool").
		HasValue("multiple", true).
		HasValue("required", true)

	obj1 := e.GET("/api/models/{modelId}", mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", mId1.String()).
		HasValue("name", "m1").
		HasValue("description", "m1 desc").
		HasValue("public", true).
		HasValue("key", ikey1.String()).
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj1.Value("createdAt").NotNull()
	obj1.Value("updatedAt").NotNull()
	obj1.Value("lastModified").NotNull()
}

// DELETE /api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/fields/{FieldIdOrKey}
func TestIntegrationFieldDeleteWithProjectAPI(t *testing.T) {
	endpoint := "/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/fields/{fieldIdOrKey}"
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	obj := e.POST("/api/schemata/{schemaId}/fields", sid1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"key":      "fKey1",
			"type":     "bool",
			"multiple": false,
			"required": false,
		}).
		Expect().
		Status(http.StatusOK)
	fId := obj.JSON().Object().Value("id").String().Raw()

	e.DELETE(endpoint, pid, id.NewModelID(), id.NewFieldID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.DELETE(endpoint, pid, id.NewModelID(), id.NewFieldID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.DELETE(endpoint, pid, id.NewModelID(), id.NewFieldID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.DELETE(endpoint, pid, id.NewModelID(), id.NewFieldID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	e.DELETE(endpoint, pid, id.NewModelID(), fId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	e.DELETE(endpoint, pid, ikey1, fId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", fId)

	obj = e.POST("/api/schemata/{schemaId}/fields", sid1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"key":      "fKey1",
			"type":     "bool",
			"multiple": false,
			"required": false,
		}).
		Expect().
		Status(http.StatusOK)
	fId = obj.JSON().Object().Value("id").String().Raw()

	e.DELETE(endpoint, pid, mId1, fId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", fId)

	obj = e.POST("/api/schemata/{schemaId}/fields", sid1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"key":      "fKey1",
			"type":     "bool",
			"multiple": false,
			"required": false,
		}).
		Expect().
		Status(http.StatusOK)
	fId = obj.JSON().Object().Value("id").String().Raw()

	e.DELETE(endpoint, pid, mId1, "fKey1").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", fId)

	obj1 := e.GET("/api/models/{modelId}", mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", mId1.String()).
		HasValue("name", "m1").
		HasValue("description", "m1 desc").
		HasValue("public", true).
		HasValue("key", ikey1.String()).
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj1.Value("createdAt").NotNull()
	obj1.Value("updatedAt").NotNull()
	obj1.Value("lastModified").NotNull()
}
