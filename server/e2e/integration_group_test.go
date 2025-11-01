package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
)

func iAPIProjectGroupsList(e *httpexpect.Expect, projectIdOrAlias interface{}) *httpexpect.Request {
	endpoint := "/api/projects/{projectIdOrAlias}/groups"
	return e.GET(endpoint, projectIdOrAlias)
}

func iAPIProjectGroupCreate(e *httpexpect.Expect, projectIdOrAlias interface{}) *httpexpect.Request {
	endpoint := "/api/projects/{projectIdOrAlias}/groups"
	return e.POST(endpoint, projectIdOrAlias)
}

func iAPIGroupGet(e *httpexpect.Expect, groupId interface{}) *httpexpect.Request {
	endpoint := "/api/groups/{groupId}"
	return e.GET(endpoint, groupId)
}

func iAPIGroupUpdate(e *httpexpect.Expect, groupId interface{}) *httpexpect.Request {
	endpoint := "/api/groups/{groupId}"
	return e.PATCH(endpoint, groupId)
}

func iAPIGroupDelete(e *httpexpect.Expect, groupId interface{}) *httpexpect.Request {
	endpoint := "/api/groups/{groupId}"
	return e.DELETE(endpoint, groupId)
}

func iAPIProjectGroupGet(e *httpexpect.Expect, projectIdOrAlias interface{}, groupIdOrKey interface{}) *httpexpect.Request {
	endpoint := "/api/projects/{projectIdOrAlias}/groups/{groupIdOrKey}"
	return e.GET(endpoint, projectIdOrAlias, groupIdOrKey)
}

func iAPIProjectGroupUpdate(e *httpexpect.Expect, projectIdOrAlias interface{}, groupIdOrKey interface{}) *httpexpect.Request {
	endpoint := "/api/projects/{projectIdOrAlias}/groups/{groupIdOrKey}"
	return e.PATCH(endpoint, projectIdOrAlias, groupIdOrKey)
}

func iAPIProjectGroupDelete(e *httpexpect.Expect, projectIdOrAlias interface{}, groupIdOrKey interface{}) *httpexpect.Request {
	endpoint := "/api/projects/{projectIdOrAlias}/groups/{groupIdOrKey}"
	return e.DELETE(endpoint, projectIdOrAlias, groupIdOrKey)
}

func TestIntegrationGroupFilter(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// Unauthorized
	iAPIProjectGroupsList(e, pid.String()).
		Expect().
		Status(http.StatusUnauthorized)

	// Invalid project
	iAPIProjectGroupsList(e, "unknown").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	// Success
	res := iAPIProjectGroupsList(e, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 50).
		WithQuery("sort", "createdAt").
		WithQuery("dir", "asc").
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("page", 1).
		HasValue("perPage", 50).
		HasValue("totalCount", 2)

	groups := res.Value("groups").Array()
	groups.Length().IsEqual(2)

	g1 := groups.Value(0).Object()
	g1.
		HasValue("id", gId1).
		HasValue("projectId", pid).
		HasValue("schemaId", sid4).
		HasValue("name", "group").
		HasValue("description", "").
		HasValue("key", gKey1.String())

	g2 := groups.Value(1).Object()
	g2.
		HasValue("id", gId2).
		HasValue("projectId", pid).
		HasValue("schemaId", gsId).
		HasValue("name", "group2").
		HasValue("description", "").
		HasValue("key", gKey2.String())
}

func TestIntegrationGroupCreate(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// Unauthorized
	iAPIProjectGroupCreate(e, pid.String()).
		Expect().
		Status(http.StatusUnauthorized)

	// Success
	created := iAPIProjectGroupCreate(e, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{
			"name": "Create Group",
			"key":  "create-group",
		}).
		Expect().
		Status(http.StatusCreated).
		JSON().
		Object()

	created.
		HasValue("name", "Create Group").
		HasValue("key", "create-group").
		HasValue("description", "").
		HasValue("projectId", pid)
	created.Value("id").NotNull()
	created.Value("schemaId").NotNull()

	// Duplicate key
	iAPIProjectGroupCreate(e, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{
			"name": "Create Group 2",
			"key":  "create-group",
		}).
		Expect().
		Status(http.StatusBadRequest)
}

func TestIntegrationGroupGet(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// Create group
	created := iAPIProjectGroupCreate(e, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "ToGet", "key": "to-get"}).
		Expect().
		Status(http.StatusCreated).
		JSON().
		Object()

	groupID := created.Value("id").String().Raw()

	// Get by ID - success
	got := iAPIGroupGet(e, groupID).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	got.
		HasValue("id", groupID).
		HasValue("name", "ToGet").
		HasValue("key", "to-get").
		HasValue("description", "").
		HasValue("projectId", pid)
	got.Value("schemaId").NotNull()

	// Get by ID - not found
	iAPIGroupGet(e, "gr_xxxxxx").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusBadRequest)
}

func TestIntegrationGroupUpdate(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// Create
	created := iAPIProjectGroupCreate(e, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "ToUpdate", "key": "to-update"}).
		Expect().
		Status(http.StatusCreated).
		JSON().
		Object()

	groupID := created.Value("id").String().Raw()

	// Update by ID - success
	updated := iAPIGroupUpdate(e, groupID).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "Updated Name"}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	updated.
		HasValue("id", groupID).
		HasValue("name", "Updated Name").
		HasValue("key", "to-update").
		HasValue("description", "").
		HasValue("projectId", pid)
	updated.Value("schemaId").NotNull()

	// Update by ID - not found
	iAPIGroupUpdate(e, "gr_unknown").
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "X"}).
		Expect().
		Status(http.StatusBadRequest)
}

func TestIntegrationGroupDelete(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// Create group
	created := iAPIProjectGroupCreate(e, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "ToDelete", "key": "to-delete"}).
		Expect().
		Status(http.StatusCreated).
		JSON().
		Object()

	groupID := created.Value("id").String().Raw()

	// Delete by ID - success
	deleted := iAPIGroupDelete(e, groupID).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	deleted.HasValue("id", groupID)

	// Delete by ID - already deleted
	iAPIGroupDelete(e, groupID).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)
}

func TestIntegrationGroupGetWithProject(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// Create group
	created := iAPIProjectGroupCreate(e, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "ToGet", "key": "to-get"}).
		Expect().
		Status(http.StatusCreated).
		JSON().
		Object()

	groupID := created.Value("id").String().Raw()

	// Get by ID - success
	got := iAPIProjectGroupGet(e, pid.String(), groupID).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	got.
		HasValue("id", groupID).
		HasValue("name", "ToGet").
		HasValue("key", "to-get").
		HasValue("description", "").
		HasValue("projectId", pid)
	got.Value("schemaId").NotNull()

	// Get by ID - not found
	iAPIProjectGroupGet(e, pid.String(), "gr_xxxxxx").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	// Get by key - success
	got2 := iAPIProjectGroupGet(e, pid.String(), "to-get").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	got2.
		HasValue("id", groupID).
		HasValue("name", "ToGet").
		HasValue("key", "to-get").
		HasValue("description", "").
		HasValue("projectId", pid)
	got2.Value("schemaId").NotNull()

	// Get by key - not found
	iAPIProjectGroupGet(e, pid.String(), "unknown").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)
}

func TestIntegrationGroupUpdateWithProject(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// Create
	created := iAPIProjectGroupCreate(e, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "ToUpdate", "key": "to-update"}).
		Expect().
		Status(http.StatusCreated).
		JSON().
		Object()

	groupID := created.Value("id").String().Raw()

	// Update by ID - success
	updated := iAPIProjectGroupUpdate(e, pid.String(), groupID).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "Updated Name"}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	updated.
		HasValue("id", groupID).
		HasValue("name", "Updated Name").
		HasValue("key", "to-update").
		HasValue("description", "").
		HasValue("projectId", pid)
	updated.Value("schemaId").NotNull()

	// Update by ID - not found
	iAPIProjectGroupUpdate(e, pid.String(), "gr_unknown").
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "X"}).
		Expect().
		Status(http.StatusNotFound)

	// Update by key - success
	updated2 := iAPIProjectGroupUpdate(e, pid.String(), "to-update").
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "Updated Again"}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	updated2.
		HasValue("name", "Updated Again").
		HasValue("key", "to-update").
		HasValue("description", "").
		HasValue("projectId", pid)
	updated2.Value("schemaId").NotNull()

	// Update by key - not found
	iAPIProjectGroupUpdate(e, pid.String(), "not-found").
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "X"}).
		Expect().
		Status(http.StatusNotFound)
}

func TestIntegrationGroupDeleteWithProject(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// Create groups
	created1 := iAPIProjectGroupCreate(e, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "ToDelete", "key": "to-delete"}).
		Expect().
		Status(http.StatusCreated).
		JSON().
		Object()

	created2 := iAPIProjectGroupCreate(e, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "ToDelete2", "key": "to-delete2"}).
		Expect().
		Status(http.StatusCreated).
		JSON().
		Object()

	groupID1 := created1.Value("id").String().Raw()
	groupID2 := created2.Value("id").String().Raw()

	// Delete by ID - success
	deleted := iAPIProjectGroupDelete(e, pid.String(), groupID2).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	deleted.HasValue("id", groupID2)

	// Delete by ID - already deleted
	iAPIProjectGroupDelete(e, pid.String(), groupID2).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	// Delete by key - success
	deleted2 := iAPIProjectGroupDelete(e, pid.String(), "to-delete").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	deleted2.HasValue("id", groupID1)

	// Delete by key - already deleted
	iAPIProjectGroupDelete(e, pid.String(), "to-delete").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)
}
