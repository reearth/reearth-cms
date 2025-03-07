package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

// GET /models/{modelId}
func TestIntegrationModelGetAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.GET("/api/models/{modelId}", id.NewModelID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/models/{modelId}", id.NewModelID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/models/{modelId}", id.NewModelID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/models/{modelId}", id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	// key cannot be used
	e.GET("/api/models/{modelId}", ikey1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusBadRequest)

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

// POST /models/{modelId}/copy
func TestIntegrationModelCopy(t *testing.T) {
	endpoint := "/api/models/{modelId}/copy"
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.POST(endpoint, id.NewModelID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.POST(endpoint, id.NewModelID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.POST(endpoint, id.NewModelID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	oldModelId := mId1.String()
	oldModel := e.GET("/api/models/{modelId}", oldModelId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	newName := "new name"
	newKey := id.RandomKey().Ref().StringRef()
	newModel := e.POST(endpoint, oldModelId).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"name": newName,
			"key":  newKey,
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	newModel.
		ContainsKey("id").
		ContainsKey("projectId").
		ContainsKey("schemaId").
		ContainsKey("public").
		ContainsKey("createdAt").
		ContainsKey("updatedAt").
		ContainsKey("key")

	newModelID := newModel.Value("id").String()
	newModelID.NotEqual(oldModelId)
	copiedModel := e.GET("/api/models/{modelId}", newModelID.Raw()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	copiedModel.
		HasValue("id", newModelID.Raw()).
		HasValue("projectId", oldModel.Value("projectId").String().Raw()).
		HasValue("public", oldModel.Value("public").Boolean().Raw()).
		HasValue("name", newName).
		HasValue("key", newKey).
		HasValue("description", oldModel.Value("description").String().Raw())

	copiedModel.Value("schemaId").NotNull()
	oldSchemaId := oldModel.Value("schemaId").String()
	copiedSchemaId := copiedModel.Value("schemaId").String()
	copiedSchemaId.NotEqual(oldSchemaId.Raw())

	oldSchema := oldModel.Value("schema").Object()
	copiedSchema := copiedModel.Value("schema").Object()
	copiedSchema.Value("fields").Array().Length().IsEqual(oldSchema.Value("fields").Array().Length().Raw())
	copiedSchema.Value("titleField").String().IsEqual(oldSchema.Value("titleField").String().Raw())

	copiedModel.Value("metadataSchemaId").NotNull()
	oldMetadataSchemaId := oldModel.Value("metadataSchemaId").String()
	copiedMetadataSchemaId := copiedModel.Value("metadataSchemaId").String()
	copiedMetadataSchemaId.NotEqual(oldMetadataSchemaId.Raw())

	oldMetadataSchema := oldModel.Value("metadataSchema").Object()
	copiedMetadataSchema := copiedModel.Value("metadataSchema").Object()
	copiedMetadataSchema.Value("fields").Array().Length().IsEqual(oldMetadataSchema.Value("fields").Array().Length().Raw())
}

// PATCH /models/{modelId}
func TestIntegrationModelUpdateAPI(t *testing.T) {
	endpoint := "/api/models/{modelId}"
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.PATCH(endpoint, id.NewProjectID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.PATCH(endpoint, id.NewProjectID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.PATCH(endpoint, id.NewProjectID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	// update empty model
	obj := e.PATCH(endpoint, mId0).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"name":        "M0 updated",
			"description": "M0 desc updated",
			"key":         "M0KeyUpdated",
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.
		ContainsKey("id").
		ContainsKey("schemaId").
		HasValue("projectId", pid).
		HasValue("name", "M0 updated").
		HasValue("description", "M0 desc updated").
		HasValue("key", "M0KeyUpdated")

	obj = e.PATCH(endpoint, mId1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"name":        "newM1 updated",
			"description": "newM1 desc updated",
			"key":         "newM1KeyUpdated",
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.
		ContainsKey("id").
		ContainsKey("schemaId").
		HasValue("projectId", pid).
		HasValue("name", "newM1 updated").
		HasValue("description", "newM1 desc updated").
		HasValue("key", "newM1KeyUpdated")

	obj = e.GET("/api/models/{modelId}", mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", mId1).
		HasValue("name", "newM1 updated").
		HasValue("description", "newM1 desc updated").
		HasValue("public", true).
		HasValue("key", "newM1KeyUpdated").
		HasValue("projectId", pid)

	obj.Value("createdAt").NotNull()
	obj.Value("updatedAt").NotNull()
	//obj.Value("lastModified").NotNull()
	obj.Value("schemaId").NotNull()
}

// DELETE /models/{modelId}
func TestIntegrationModelDeleteAPI(t *testing.T) {
	endpoint := "/api/models/{modelId}"
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.DELETE(endpoint, id.NewProjectID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.DELETE(endpoint, id.NewProjectID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.DELETE(endpoint, id.NewProjectID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.DELETE(endpoint, mId1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"name":        "newM1 updated",
			"description": "newM1 desc updated",
			"key":         "newM1KeyUpdated",
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", mId1)

	e.GET("/api/models/{modelId}", mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

}

// GET /projects/{projectIdOrAlias}/models
func TestIntegrationModelFilterAPI(t *testing.T) {
	endpoint := "/api/projects/{projectIdOrAlias}/models"
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
			HasValue("totalCount", 7).
			Value("models").
			Array()
		models.Length().IsEqual(7)

		obj0 := models.Value(0).Object()
		obj0.
			HasValue("id", mId0.String()).
			HasValue("name", "m0").
			HasValue("description", "m0 desc").
			HasValue("public", true).
			HasValue("key", ikey0.String()).
			HasValue("projectId", pid).
			HasValue("schemaId", sid0)

		obj1 := models.Value(1).Object()
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

		obj2 := models.Value(2).Object()
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
}

// POST /projects/{projectIdOrAlias}/models
func TestIntegrationModelCreateAPI(t *testing.T) {
	endpoint := "/api/projects/{projectIdOrAlias}/models"
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.POST(endpoint, id.NewProjectID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.POST(endpoint, id.NewProjectID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.POST(endpoint, id.NewProjectID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	obj := e.POST(endpoint, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"name":        "newM1",
			"description": "newM1 desc",
			"key":         "newM1Key",
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.
		ContainsKey("id").
		ContainsKey("schemaId").
		HasValue("projectId", pid).
		HasValue("name", "newM1").
		HasValue("description", "newM1 desc").
		HasValue("key", "newM1Key")

	mId := obj.Value("id").String().Raw()
	obj = e.GET("/api/models/{modelId}", mId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", mId).
		HasValue("name", "newM1").
		HasValue("description", "newM1 desc").
		HasValue("public", true).
		HasValue("key", "newM1Key").
		HasValue("projectId", pid)

	obj.Value("createdAt").NotNull()
	obj.Value("updatedAt").NotNull()
	//obj.Value("lastModified").NotNull()
	obj.Value("schemaId").NotNull()
}

// GET /projects/{projectIdOrAlias}/models/{modelIdOrKey}
func TestIntegrationModelGetWithProjectAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.GET("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}", palias, id.NewModelID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}", palias, id.NewModelID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}", palias, id.NewModelID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}", palias, id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusNotFound)

	obj := e.GET("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}", palias, mId1).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
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

	obj = e.GET("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}", palias, ikey1).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
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

// PATCH /projects/{projectIdOrAlias}/models/{modelIdOrKey}
func TestIntegrationModelUpdateWithProjectAPI(t *testing.T) {
	endpoint := "/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}"
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.PATCH(endpoint, palias, id.NewModelID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.PATCH(endpoint, palias, id.NewModelID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.PATCH(endpoint, palias, id.NewModelID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.PATCH(endpoint, palias, id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	obj := e.PATCH(endpoint, palias, mId1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"name":        "newM1 updated",
			"description": "newM1 desc updated",
			"key":         "newM1KeyUpdated",
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", mId1.String()).
		HasValue("name", "newM1 updated").
		HasValue("description", "newM1 desc updated").
		HasValue("public", true).
		HasValue("key", "newM1KeyUpdated").
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj.Value("createdAt").NotNull()
	obj.Value("updatedAt").NotNull()
	obj.Value("lastModified").NotNull()

	obj = e.GET("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}", palias, "newM1KeyUpdated").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", mId1.String()).
		HasValue("name", "newM1 updated").
		HasValue("description", "newM1 desc updated").
		HasValue("public", true).
		HasValue("key", "newM1KeyUpdated").
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj.Value("createdAt").NotNull()
	obj.Value("updatedAt").NotNull()
	obj.Value("lastModified").NotNull()
}

// DELETE /projects/{projectIdOrAlias}/models/{modelIdOrKey}
func TestIntegrationModelDeleteWithProjectAPI(t *testing.T) {
	endpoint := "/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}"
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.DELETE(endpoint, palias, id.NewModelID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.DELETE(endpoint, palias, id.NewModelID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.DELETE(endpoint, palias, id.NewModelID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.DELETE(endpoint, palias, id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	e.DELETE(endpoint, palias, mId1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"name":        "newM1 updated",
			"description": "newM1 desc updated",
			"key":         "newM1KeyUpdated",
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", mId1.String())

	e.GET("/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}", palias, mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)
}
