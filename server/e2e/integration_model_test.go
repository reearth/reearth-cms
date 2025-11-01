package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
)

func iAPIModelGetWithWorkspace(e *httpexpect.Expect, workspaceId accountdomain.WorkspaceID, projectId id.ProjectID, modelId interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceId}/projects/{projectId}/models/{modelId}"
	return e.GET(endpoint, workspaceId, projectId, modelId)
}

func iAPIModelCopy(e *httpexpect.Expect, workspaceId accountdomain.WorkspaceID, projectId id.ProjectID, modelId interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceId}/projects/{projectId}/models/{modelId}/copy"
	return e.POST(endpoint, workspaceId, projectId, modelId)
}

func iAPIModelGet(e *httpexpect.Expect, modelId interface{}) *httpexpect.Request {
	endpoint := "/api/models/{modelId}"
	return e.GET(endpoint, modelId)
}

func iAPIModelUpdate(e *httpexpect.Expect, modelId interface{}) *httpexpect.Request {
	endpoint := "/api/models/{modelId}"
	return e.PATCH(endpoint, modelId)
}

func iAPIModelDelete(e *httpexpect.Expect, modelId interface{}) *httpexpect.Request {
	endpoint := "/api/models/{modelId}"
	return e.DELETE(endpoint, modelId)
}

func iAPIModelFilter(e *httpexpect.Expect, projectIdOrAlias string) *httpexpect.Request {
	endpoint := "/api/projects/{projectIdOrAlias}/models"
	return e.GET(endpoint, projectIdOrAlias)
}

func iAPIModelCreate(e *httpexpect.Expect, projectIdOrAlias string) *httpexpect.Request {
	endpoint := "/api/projects/{projectIdOrAlias}/models"
	return e.POST(endpoint, projectIdOrAlias)
}

func iAPIModelGetWithProject(e *httpexpect.Expect, projectIdOrAlias string, modelIdOrKey string) *httpexpect.Request {
	endpoint := "/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}"
	return e.GET(endpoint, projectIdOrAlias, modelIdOrKey)
}

func iAPIModelUpdateWithProject(e *httpexpect.Expect, projectIdOrAlias string, modelIdOrKey string) *httpexpect.Request {
	endpoint := "/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}"
	return e.PATCH(endpoint, projectIdOrAlias, modelIdOrKey)
}

func iAPIModelDeleteWithProject(e *httpexpect.Expect, projectIdOrAlias string, modelIdOrKey string) *httpexpect.Request {
	endpoint := "/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}"
	return e.DELETE(endpoint, projectIdOrAlias, modelIdOrKey)
}

// GET /models/{modelId}
func TestIntegrationModelGetAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIModelGetWithWorkspace(e, wId0, pid, id.NewModelID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelGetWithWorkspace(e, wId0, pid, id.NewModelID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelGetWithWorkspace(e, wId0, pid, id.NewModelID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelGetWithWorkspace(e, wId0, pid, id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	// get by key
	iAPIModelGetWithWorkspace(e, wId0, pid, ikey1).
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

	obj := iAPIModelGetWithWorkspace(e, wId0, pid, mId1).
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

	oldModel := iAPIModelGetWithWorkspace(e, wId0, pid, mId1).
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
	copiedModel := iAPIModelGetWithWorkspace(e, wId0, pid, id.MustModelID(newModelID.Raw())).
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

	iAPIModelUpdate(e, id.NewModelID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelUpdate(e, id.NewModelID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelUpdate(e, id.NewModelID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	// update empty model
	obj := iAPIModelUpdate(e, mId0).
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

	obj = iAPIModelUpdate(e, mId1).
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

	obj = iAPIModelGet(e, mId1).
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

	iAPIModelDelete(e, id.NewModelID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelDelete(e, id.NewModelID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelDelete(e, id.NewModelID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelDelete(e, mId1).
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

	iAPIModelGet(e, mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

}

// GET /projects/{projectIdOrAlias}/models
func TestIntegrationModelFilterAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIModelFilter(e, id.NewProjectID().String()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelFilter(e, id.NewProjectID().String()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelFilter(e, id.NewProjectID().String()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelFilter(e, id.NewProjectID().String()).
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

	assertRes(t, iAPIModelFilter(e, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 10).
		WithQuery("sort", "id").
		WithQuery("dir", "asc").
		Expect())

	assertRes(t, iAPIModelFilter(e, palias).
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

	iAPIModelCreate(e, id.NewProjectID().String()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelCreate(e, id.NewProjectID().String()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelCreate(e, id.NewProjectID().String()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	obj := iAPIModelCreate(e, pid.String()).
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
	obj = iAPIModelGet(e, id.MustModelID(mId)).
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

	iAPIModelGetWithProject(e, palias, id.NewModelID().String()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelGetWithProject(e, palias, id.NewModelID().String()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelGetWithProject(e, palias, id.NewModelID().String()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelGetWithProject(e, palias, id.NewModelID().String()).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusNotFound)

	obj := iAPIModelGetWithProject(e, palias, mId1.String()).
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

	obj = iAPIModelGetWithProject(e, palias, ikey1.String()).
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

	iAPIModelUpdateWithProject(e, palias, id.NewModelID().String()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelUpdateWithProject(e, palias, id.NewModelID().String()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelUpdateWithProject(e, palias, id.NewModelID().String()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelUpdateWithProject(e, palias, id.NewModelID().String()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	obj := iAPIModelUpdateWithProject(e, palias, mId1.String()).
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

	obj = iAPIModelGetWithProject(e, palias, "newM1KeyUpdated").
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

	iAPIModelDeleteWithProject(e, palias, id.NewModelID().String()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelDeleteWithProject(e, palias, id.NewModelID().String()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelDeleteWithProject(e, palias, id.NewModelID().String()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIModelDeleteWithProject(e, palias, id.NewModelID().String()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	iAPIModelDeleteWithProject(e, palias, mId1.String()).
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

	iAPIModelGetWithProject(e, palias, mId1.String()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)
}
