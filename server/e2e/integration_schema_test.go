package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

func iAPIProjectSchemaList(e *httpexpect.Expect, projectIdOrAlias interface{}) *httpexpect.Request {
	endpoint := "/api/projects/{projectIdOrAlias}/schemata"
	return e.GET(endpoint, projectIdOrAlias)
}

func iAPISchemaFieldCreate(e *httpexpect.Expect, schemaId interface{}) *httpexpect.Request {
	endpoint := "/api/schemata/{schemaId}/fields"
	return e.POST(endpoint, schemaId)
}

func iAPISchemaFieldUpdate(e *httpexpect.Expect, schemaId interface{}, fieldIdOrKey interface{}) *httpexpect.Request {
	endpoint := "/api/schemata/{schemaId}/fields/{fieldIdOrKey}"
	return e.PATCH(endpoint, schemaId, fieldIdOrKey)
}

func iAPISchemaFieldDelete(e *httpexpect.Expect, schemaId interface{}, fieldIdOrKey interface{}) *httpexpect.Request {
	endpoint := "/api/schemata/{schemaId}/fields/{fieldIdOrKey}"
	return e.DELETE(endpoint, schemaId, fieldIdOrKey)
}

func iAPIProjectModelFieldCreate(e *httpexpect.Expect, projectIdOrAlias interface{}, modelIdOrKey interface{}) *httpexpect.Request {
	endpoint := "/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/fields"
	return e.POST(endpoint, projectIdOrAlias, modelIdOrKey)
}

func iAPIProjectModelFieldUpdate(e *httpexpect.Expect, projectIdOrAlias interface{}, modelIdOrKey interface{}, fieldIdOrKey interface{}) *httpexpect.Request {
	endpoint := "/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/fields/{fieldIdOrKey}"
	return e.PATCH(endpoint, projectIdOrAlias, modelIdOrKey, fieldIdOrKey)
}

func iAPIProjectModelFieldDelete(e *httpexpect.Expect, projectIdOrAlias interface{}, modelIdOrKey interface{}, fieldIdOrKey interface{}) *httpexpect.Request {
	endpoint := "/api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/fields/{fieldIdOrKey}"
	return e.DELETE(endpoint, projectIdOrAlias, modelIdOrKey, fieldIdOrKey)
}

// GET /projects/{projectIdOrAlias}/schemata
func TestIntegrationSchemaFilterAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIProjectSchemaList(e, id.NewProjectID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectSchemaList(e, id.NewProjectID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectSchemaList(e, id.NewProjectID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectSchemaList(e, id.NewProjectID()).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 0).
		WithQuery("perPage", 5).
		WithQuery("sort", "createdAt").
		WithQuery("dir", "asc").
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

	assertRes(t, iAPIProjectSchemaList(e, pid).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 10).
		WithQuery("sort", "createdAt").
		WithQuery("dir", "asc").
		Expect())

	assertRes(t, iAPIProjectSchemaList(e, palias).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 10).
		WithQuery("sort", "createdAt").
		WithQuery("dir", "asc").
		Expect())

	res := iAPIProjectSchemaList(e, palias).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 10).
		WithQuery("keyword", "m1").
		WithQuery("sort", "createdAt").
		WithQuery("dir", "asc").
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
		HasValue("key", ikey1.String()).
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj1.Value("createdAt").NotNull()
	obj1.Value("updatedAt").NotNull()
	obj1.Value("lastModified").NotNull()
}

// GET /projects/{projectIdOrAlias}/schemata with sorting
func TestIntegrationSchemaFilterSorting(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// createdAt and ascending
	res := iAPIProjectSchemaList(e, pid).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 10).
		WithQuery("sort", "createdAt").
		WithQuery("dir", "asc").
		Expect()
	res.Status(http.StatusOK)
	models := res.JSON().
		Object().
		Value("models").
		Array()

	models.Value(0).Object().Value("id").String().IsEqual(mId0.String())
	models.Value(1).Object().Value("id").String().IsEqual(mId1.String())
	models.Value(2).Object().Value("id").String().IsEqual(mId2.String())
	models.Value(3).Object().Value("id").String().IsEqual(mId3.String())
	models.Value(4).Object().Value("id").String().IsEqual(mId4.String())
	models.Value(5).Object().Value("id").String().IsEqual(mId5.String())
	models.Value(6).Object().Value("id").String().IsEqual(dvmId.String())
	// createdAt and descending
	res = iAPIProjectSchemaList(e, pid).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 10).
		WithQuery("sort", "createdAt").
		WithQuery("dir", "desc").
		Expect()
	res.Status(http.StatusOK)
	models = res.JSON().
		Object().
		Value("models").
		Array()

	models.Value(0).Object().Value("id").String().IsEqual(dvmId.String())
	models.Value(1).Object().Value("id").String().IsEqual(mId5.String())
	models.Value(2).Object().Value("id").String().IsEqual(mId4.String())
	models.Value(3).Object().Value("id").String().IsEqual(mId3.String())
	models.Value(4).Object().Value("id").String().IsEqual(mId2.String())
	models.Value(5).Object().Value("id").String().IsEqual(mId1.String())
	models.Value(6).Object().Value("id").String().IsEqual(mId0.String())
	// updatedAt and ascending
	res = iAPIProjectSchemaList(e, pid).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 10).
		WithQuery("sort", "updatedAt").
		WithQuery("dir", "asc").
		Expect()
	res.Status(http.StatusOK)
	models = res.JSON().
		Object().
		Value("models").
		Array()
	models.Value(0).Object().Value("id").String().IsEqual(mId0.String())
	models.Value(1).Object().Value("id").String().IsEqual(mId1.String())
	models.Value(2).Object().Value("id").String().IsEqual(mId2.String())
	models.Value(3).Object().Value("id").String().IsEqual(mId3.String())
	models.Value(4).Object().Value("id").String().IsEqual(mId4.String())
	models.Value(5).Object().Value("id").String().IsEqual(mId5.String())
	models.Value(6).Object().Value("id").String().IsEqual(dvmId.String())

	// updatedAt and descending
	res = iAPIProjectSchemaList(e, pid).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 10).
		WithQuery("sort", "updatedAt").
		WithQuery("dir", "desc").
		Expect()
	res.Status(http.StatusOK)
	models = res.JSON().
		Object().
		Value("models").
		Array()
	models.Value(0).Object().Value("id").String().IsEqual(dvmId.String())
	models.Value(1).Object().Value("id").String().IsEqual(mId5.String())
	models.Value(2).Object().Value("id").String().IsEqual(mId4.String())
	models.Value(3).Object().Value("id").String().IsEqual(mId3.String())
	models.Value(4).Object().Value("id").String().IsEqual(mId2.String())
	models.Value(5).Object().Value("id").String().IsEqual(mId1.String())
	models.Value(6).Object().Value("id").String().IsEqual(mId0.String())

	// if no sort is provided default to createdAt and descending
	res = iAPIProjectSchemaList(e, pid).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 10).
		Expect()
	res.Status(http.StatusOK)
	models = res.JSON().
		Object().
		Value("models").
		Array()
	models.Value(0).Object().Value("id").String().IsEqual(dvmId.String())
	models.Value(1).Object().Value("id").String().IsEqual(mId5.String())
	models.Value(2).Object().Value("id").String().IsEqual(mId4.String())
	models.Value(3).Object().Value("id").String().IsEqual(mId3.String())
	models.Value(4).Object().Value("id").String().IsEqual(mId2.String())
	models.Value(5).Object().Value("id").String().IsEqual(mId1.String())
	models.Value(6).Object().Value("id").String().IsEqual(mId0.String())
}

// POST /api/models/{modelId}/fields
func TestIntegrationFieldCreateAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPISchemaFieldCreate(e, id.NewSchemaID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPISchemaFieldCreate(e, id.NewSchemaID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPISchemaFieldCreate(e, id.NewSchemaID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPISchemaFieldCreate(e, id.NewSchemaID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	// key cannot be used
	iAPISchemaFieldCreate(e, ikey1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusBadRequest)

	// region text
	res := iAPISchemaFieldCreate(e, sid1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"key":      "テスト",
			"type":     "text",
			"multiple": false,
			"required": false,
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.ContainsKey("id")

	res = e.GET("/api/models/{modelId}", mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.ContainsSubset(map[string]any{
		"name":        "m1",
		"id":          mId1.String(),
		"description": "m1 desc",
		"key":         ikey1.String(),
		"projectId":   pid,
		"schemaId":    sid1,
	})

	res.Value("createdAt").NotNull()
	res.Value("updatedAt").NotNull()
	res.Value("lastModified").NotNull()
	resf := res.Value("schema").Object().Value("fields").Array()
	resf.Length().IsEqual(3)
	resf.Value(2).Object().ContainsSubset(map[string]any{
		// "id":    "", // generated
		"key":      "テスト",
		"type":     "text",
		"required": false,
	})
	// endregion

	//region bool
	res = iAPISchemaFieldCreate(e, sid1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"key":      "fKey1",
			"type":     "bool",
			"multiple": false,
			"required": false,
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.ContainsKey("id")

	res = e.GET("/api/models/{modelId}", mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.HasValue("id", mId1.String()).
		HasValue("name", "m1").
		HasValue("description", "m1 desc").
		HasValue("key", ikey1.String()).
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	res.Value("createdAt").NotNull()
	res.Value("updatedAt").NotNull()
	res.Value("lastModified").NotNull()
	resf = res.Value("schema").Object().Value("fields").Array()
	resf.Length().IsEqual(4)
	resf.Value(3).Object().ContainsSubset(map[string]any{
		// "id":    "", // generated
		"key":      "fKey1",
		"type":     "bool",
		"required": false,
	})
	// endregion

	//region number
	res = iAPISchemaFieldCreate(e, sid1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"key":      "fKey2",
			"type":     "number",
			"multiple": false,
			"required": false,
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.ContainsKey("id")

	res = e.GET("/api/models/{modelId}", mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.HasValue("id", mId1.String()).
		HasValue("name", "m1").
		HasValue("description", "m1 desc").
		HasValue("key", ikey1.String()).
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	res.Value("createdAt").NotNull()
	res.Value("updatedAt").NotNull()
	res.Value("lastModified").NotNull()
	resf = res.Value("schema").Object().Value("fields").Array()
	resf.Length().IsEqual(5)
	resf.Value(4).Object().ContainsSubset(map[string]any{
		// "id":    "", // generated
		"key":      "fKey2",
		"type":     "number",
		"required": false,
	})
	// endregion

	// region GeoObject
	res = iAPISchemaFieldCreate(e, sid1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]interface{}{
			"key":      "fKey3",
			"type":     "geometryObject",
			"multiple": false,
			"required": false,
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.ContainsKey("id")

	res = e.GET("/api/models/{modelId}", mId1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.HasValue("id", mId1.String()).
		HasValue("name", "m1").
		HasValue("description", "m1 desc").
		HasValue("key", ikey1.String()).
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	res.Value("createdAt").NotNull()
	res.Value("updatedAt").NotNull()
	res.Value("lastModified").NotNull()
	// endregion
}

// PATCH /api/models/{modelId}/fields/{FieldIdOrKey}
func TestIntegrationFieldUpdateAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	obj := iAPISchemaFieldCreate(e, sid1).
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

	iAPISchemaFieldUpdate(e, id.NewModelID(), id.NewFieldID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPISchemaFieldUpdate(e, id.NewSchemaID(), id.NewFieldID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPISchemaFieldUpdate(e, id.NewSchemaID(), id.NewFieldID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPISchemaFieldUpdate(e, id.NewSchemaID(), id.NewFieldID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	iAPISchemaFieldUpdate(e, id.NewSchemaID(), fId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	// model key cannot be used
	iAPISchemaFieldUpdate(e, ikey1, fId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusBadRequest)

	iAPISchemaFieldUpdate(e, sid1, fId).
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

	iAPISchemaFieldUpdate(e, sid1, "fKey1Updated").
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
		HasValue("key", ikey1.String()).
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj1.Value("createdAt").NotNull()
	obj1.Value("updatedAt").NotNull()
	obj1.Value("lastModified").NotNull()
}

// DELETE /api/models/{modelId}/fields/{FieldIdOrKey}
func TestIntegrationFieldDeleteAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	obj := iAPISchemaFieldCreate(e, sid1).
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

	iAPISchemaFieldDelete(e, id.NewSchemaID(), id.NewFieldID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPISchemaFieldDelete(e, id.NewSchemaID(), id.NewFieldID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPISchemaFieldDelete(e, id.NewSchemaID(), id.NewFieldID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPISchemaFieldDelete(e, id.NewSchemaID(), id.NewFieldID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	iAPISchemaFieldDelete(e, id.NewSchemaID(), fId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	// model key cannot be used
	iAPISchemaFieldDelete(e, ikey1, fId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusBadRequest)

	iAPISchemaFieldDelete(e, sid1, fId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", fId)

	obj = iAPISchemaFieldCreate(e, sid1).
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

	iAPISchemaFieldDelete(e, sid1, "fKey1").
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
		HasValue("key", ikey1.String()).
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj1.Value("createdAt").NotNull()
	obj1.Value("updatedAt").NotNull()
	obj1.Value("lastModified").NotNull()
}

// POST /api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/fields
func TestIntegrationFieldCreateWithProjectAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIProjectModelFieldCreate(e, pid, id.NewModelID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectModelFieldCreate(e, pid, id.NewModelID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectModelFieldCreate(e, pid, id.NewModelID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectModelFieldCreate(e, pid, id.NewModelID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	obj1 := iAPIProjectModelFieldCreate(e, pid, mId1).
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

	obj1 = iAPIProjectModelFieldCreate(e, pid, ikey1).
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
		HasValue("key", ikey1.String()).
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj.Value("createdAt").NotNull()
	obj.Value("updatedAt").NotNull()
	obj.Value("lastModified").NotNull()
}

// PATCH /api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/fields/{FieldIdOrKey}
func TestIntegrationFieldUpdateWithProjectAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	obj := iAPISchemaFieldCreate(e, sid1).
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

	iAPIProjectModelFieldUpdate(e, pid, id.NewModelID(), id.NewFieldID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectModelFieldUpdate(e, pid, id.NewModelID(), id.NewFieldID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectModelFieldUpdate(e, pid, id.NewModelID(), id.NewFieldID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectModelFieldUpdate(e, pid, id.NewModelID(), id.NewFieldID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	iAPIProjectModelFieldUpdate(e, pid, id.NewModelID(), fId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	iAPIProjectModelFieldUpdate(e, pid, mId1, fId).
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

	iAPIProjectModelFieldUpdate(e, pid, mId1, "fKey1Updated").
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
		HasValue("key", ikey1.String()).
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj1.Value("createdAt").NotNull()
	obj1.Value("updatedAt").NotNull()
	obj1.Value("lastModified").NotNull()
}

// DELETE /api/projects/{projectIdOrAlias}/models/{modelIdOrKey}/fields/{FieldIdOrKey}
func TestIntegrationFieldDeleteWithProjectAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	obj := iAPISchemaFieldCreate(e, sid1).
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

	iAPIProjectModelFieldDelete(e, pid, id.NewModelID(), id.NewFieldID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectModelFieldDelete(e, pid, id.NewModelID(), id.NewFieldID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectModelFieldDelete(e, pid, id.NewModelID(), id.NewFieldID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectModelFieldDelete(e, pid, id.NewModelID(), id.NewFieldID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	iAPIProjectModelFieldDelete(e, pid, id.NewModelID(), fId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	iAPIProjectModelFieldDelete(e, pid, ikey1, fId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", fId)

	obj = iAPISchemaFieldCreate(e, sid1).
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

	iAPIProjectModelFieldDelete(e, pid, mId1, fId).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", fId)

	obj = iAPISchemaFieldCreate(e, sid1).
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

	iAPIProjectModelFieldDelete(e, pid, mId1, "fKey1").
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
		HasValue("key", ikey1.String()).
		HasValue("projectId", pid).
		HasValue("schemaId", sid1)

	obj1.Value("createdAt").NotNull()
	obj1.Value("updatedAt").NotNull()
	obj1.Value("lastModified").NotNull()
}
