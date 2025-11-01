package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

func iAPIModelFilter(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models"
	return e.GET(endpoint, workspaceIdOrAlias, projectIdOrAlias)
}

func iAPIModelCreate(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models"
	return e.POST(endpoint, workspaceIdOrAlias, projectIdOrAlias)
}

func iAPIModelGet(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}, modelIdOrKey interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models/{modelIdOrKey}"
	return e.GET(endpoint, workspaceIdOrAlias, projectIdOrAlias, modelIdOrKey)
}

func iAPIModelUpdate(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}, modelIdOrKey interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models/{modelIdOrKey}"
	return e.PATCH(endpoint, workspaceIdOrAlias, projectIdOrAlias, modelIdOrKey)
}

func iAPIModelDelete(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}, modelIdOrKey interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models/{modelIdOrKey}"
	return e.DELETE(endpoint, workspaceIdOrAlias, projectIdOrAlias, modelIdOrKey)
}

func iAPIModelSchemaExport(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}, modelIdOrKey interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models/{modelIdOrKey}/schema.json"
	return e.GET(endpoint, workspaceIdOrAlias, projectIdOrAlias, modelIdOrKey)
}

func iAPIModelMetadataSchemaExport(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}, modelIdOrKey interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models/{modelIdOrKey}/metadata_schema.json"
	return e.GET(endpoint, workspaceIdOrAlias, projectIdOrAlias, modelIdOrKey)
}

func iAPIModelImport(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}, modelIdOrKey interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models/{modelIdOrKey}/import"
	return e.PUT(endpoint, workspaceIdOrAlias, projectIdOrAlias, modelIdOrKey)
}

func iAPIModelCopy(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}, modelIdOrKey interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/models/{modelIdOrKey}/copy"
	return e.POST(endpoint, workspaceIdOrAlias, projectIdOrAlias, modelIdOrKey)
}

// GET /models/{modelId}
func TestIntegrationModelGetAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIModelGet(e, wId0, pid, id.NewModelID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelGet(e, wId0, pid, id.NewModelID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelGet(e, wId0, pid, id.NewModelID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelGet(e, wId0, pid, id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	// get by key
	iAPIModelGet(e, wId0, pid, ikey1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", mId1.String()).
		HasValue("name", "m1").
		HasValue("description", "m1 desc").
		HasValue("key", ikey1.String()).
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj := iAPIModelGet(e, wId0, pid, mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", mId1.String()).
		HasValue("name", "m1").
		HasValue("description", "m1 desc").
		HasValue("key", ikey1.String()).
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj.Value("createdAt").NotNull()
	obj.Value("updatedAt").NotNull()
	obj.Value("lastModified").NotNull()
}

// POST /models/{modelId}/copy
func TestIntegrationModelCopy(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIModelCopy(e, wId0, pid, id.NewModelID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelCopy(e, wId0, pid, id.NewModelID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelCopy(e, wId0, pid, id.NewModelID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	oldModel := iAPIModelGet(e, wId0, pid, mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	newName := "new name"
	newKey := id.RandomKey().Ref().StringRef()
	newModel := iAPIModelCopy(e, wId0, pid, mId1).
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
		ContainsKey("createdAt").
		ContainsKey("updatedAt").
		ContainsKey("key")

	newModelID := newModel.Value("id").String()
	newModelID.NotEqual(mId1.String())
	copiedModel := iAPIModelGet(e, wId0, pid, id.MustModelID(newModelID.Raw())).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	copiedModel.
		HasValue("id", newModelID.Raw()).
		HasValue("projectId", oldModel.Value("projectId").String().Raw()).
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
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIModelUpdate(e, wId0, pid, id.NewModelID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelUpdate(e, wId0, pid, id.NewModelID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelUpdate(e, wId0, pid, id.NewModelID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	// update empty model
	obj := iAPIModelUpdate(e, wId0, pid, mId0).
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

	obj = iAPIModelUpdate(e, wId0, pid, mId1).
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

	obj = iAPIModelGet(e, wId0, pid, mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", mId1).
		HasValue("name", "newM1 updated").
		HasValue("description", "newM1 desc updated").
		HasValue("key", "newM1KeyUpdated").
		HasValue("projectId", pid)

	obj.Value("createdAt").NotNull()
	obj.Value("updatedAt").NotNull()
	//obj.Value("lastModified").NotNull()
	obj.Value("schemaId").NotNull()
}

// DELETE /models/{modelId}
func TestIntegrationModelDeleteAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIModelDelete(e, wId0, pid, id.NewModelID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelDelete(e, wId0, pid, id.NewModelID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelDelete(e, wId0, pid, id.NewModelID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelDelete(e, wId0, pid, mId1).
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

	iAPIModelGet(e, wId0, pid, mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

}

// GET /projects/{projectIdOrAlias}/models
func TestIntegrationModelFilterAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIModelFilter(e, wId0, id.NewProjectID().String()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelFilter(e, wId0, id.NewProjectID().String()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelFilter(e, wId0, id.NewProjectID().String()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelFilter(e, wId0, id.NewProjectID().String()).
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
			HasValue("key", ikey0.String()).
			HasValue("projectId", pid).
			HasValue("schemaId", sid0)

		obj1 := models.Value(1).Object()
		obj1.
			HasValue("id", mId1.String()).
			HasValue("name", "m1").
			HasValue("description", "m1 desc").
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
			HasValue("key", ikey2.String()).
			HasValue("projectId", pid).
			HasValue("schemaId", sid2)

		obj2.Value("createdAt").NotNull()
		obj2.Value("updatedAt").NotNull()
		obj2.Value("lastModified").NotNull()
	}

	assertRes(t, iAPIModelFilter(e, wId0, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 10).
		WithQuery("sort", "id").
		WithQuery("dir", "asc").
		Expect())

	assertRes(t, iAPIModelFilter(e, wId0, palias).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 10).
		WithQuery("sort", "id").
		WithQuery("dir", "asc").
		Expect())
}

// POST /projects/{projectIdOrAlias}/models
func TestIntegrationModelCreateAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIModelCreate(e, wId0, id.NewProjectID().String()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelCreate(e, wId0, id.NewProjectID().String()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelCreate(e, wId0, id.NewProjectID().String()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	obj := iAPIModelCreate(e, wId0, pid.String()).
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
	obj = iAPIModelGet(e, wId0, pid, id.MustModelID(mId)).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", mId).
		HasValue("name", "newM1").
		HasValue("description", "newM1 desc").
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

	iAPIModelGet(e, wId0, palias, id.NewModelID().String()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelGet(e, wId0, palias, id.NewModelID().String()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelGet(e, wId0, palias, id.NewModelID().String()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelGet(e, wId0, palias, id.NewModelID().String()).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusNotFound)

	obj := iAPIModelGet(e, wId0, palias, mId1.String()).
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
		HasValue("key", ikey1.String()).
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj.Value("createdAt").NotNull()
	obj.Value("updatedAt").NotNull()
	obj.Value("lastModified").NotNull()

	obj = iAPIModelGet(e, wId0, palias, ikey1.String()).
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
		HasValue("key", ikey1.String()).
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj.Value("createdAt").NotNull()
	obj.Value("updatedAt").NotNull()
	obj.Value("lastModified").NotNull()
}

// PATCH /projects/{projectIdOrAlias}/models/{modelIdOrKey}
func TestIntegrationModelUpdateWithProjectAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIModelUpdate(e, wId0, palias, id.NewModelID().String()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelUpdate(e, wId0, palias, id.NewModelID().String()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelUpdate(e, wId0, palias, id.NewModelID().String()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelUpdate(e, wId0, palias, id.NewModelID().String()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	obj := iAPIModelUpdate(e, wId0, palias, mId1.String()).
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
		HasValue("key", "newM1KeyUpdated").
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj.Value("createdAt").NotNull()
	obj.Value("updatedAt").NotNull()
	obj.Value("lastModified").NotNull()

	obj = iAPIModelGet(e, wId0, palias, "newM1KeyUpdated").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", mId1.String()).
		HasValue("name", "newM1 updated").
		HasValue("description", "newM1 desc updated").
		HasValue("key", "newM1KeyUpdated").
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj.Value("createdAt").NotNull()
	obj.Value("updatedAt").NotNull()
	obj.Value("lastModified").NotNull()
}

// DELETE /projects/{projectIdOrAlias}/models/{modelIdOrKey}
func TestIntegrationModelDeleteWithProjectAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIModelDelete(e, wId0, palias, id.NewModelID().String()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelDelete(e, wId0, palias, id.NewModelID().String()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelDelete(e, wId0, palias, id.NewModelID().String()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelDelete(e, wId0, palias, id.NewModelID().String()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	iAPIModelDelete(e, wId0, palias, mId1.String()).
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

	iAPIModelGet(e, wId0, palias, mId1.String()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)
}
