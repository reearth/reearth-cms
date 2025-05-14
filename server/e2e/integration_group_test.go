package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
)

func TestIntegrationGroupFilter(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)
	endpoint := "/api/projects/{projectIdOrAlias}/groups"

	// Unauthorized
	e.GET(endpoint, pid.String()).
		Expect().
		Status(http.StatusUnauthorized)

	// Invalid project
	e.GET(endpoint, "unknown").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	// Success
	res := e.GET(endpoint, pid.String()).
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
	endpoint := "/api/projects/{projectIdOrAlias}/groups"

	// Unauthorized
	e.POST(endpoint, pid.String()).
		Expect().
		Status(http.StatusUnauthorized)

	// Success
	created := e.POST(endpoint, pid.String()).
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
	e.POST(endpoint, pid.String()).
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
	endpoint := "/api/projects/{projectIdOrAlias}/groups"
	created := e.POST(endpoint, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "ToGet", "key": "to-get"}).
		Expect().
		Status(http.StatusCreated).
		JSON().
		Object()

	groupID := created.Value("id").String().Raw()

	// Get by ID - success
	endpoint = "/api/groups/{groupId}"
	got := e.GET(endpoint, groupID).
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
	e.GET(endpoint, "gr_xxxxxx").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusBadRequest)
}

func TestIntegrationGroupUpdate(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// Create
	endpoint := "/api/projects/{projectIdOrAlias}/groups"
	created := e.POST(endpoint, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "ToUpdate", "key": "to-update"}).
		Expect().
		Status(http.StatusCreated).
		JSON().
		Object()

	groupID := created.Value("id").String().Raw()

	// Update by ID - success
	endpoint = "/api/groups/{groupId}"
	updated := e.PATCH(endpoint, groupID).
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
	e.PATCH(endpoint, "gr_unknown").
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "X"}).
		Expect().
		Status(http.StatusBadRequest)
}

func TestIntegrationGroupDelete(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// Create group
	endpoint := "/api/projects/{projectIdOrAlias}/groups"

	created := e.POST(endpoint, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "ToDelete", "key": "to-delete"}).
		Expect().
		Status(http.StatusCreated).
		JSON().
		Object()

	groupID := created.Value("id").String().Raw()

	// Delete by ID - success
	endpoint = "/api/groups/{groupId}"
	deleted := e.DELETE(endpoint, groupID).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	deleted.HasValue("id", groupID)

	// Delete by ID - already deleted
	e.DELETE(endpoint, groupID).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)
}

func TestIntegrationGroupGetWithProject(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// Create group
	endpoint := "/api/projects/{projectIdOrAlias}/groups"
	created := e.POST(endpoint, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "ToGet", "key": "to-get"}).
		Expect().
		Status(http.StatusCreated).
		JSON().
		Object()

	groupID := created.Value("id").String().Raw()

	// Get by ID - success
	endpoint = "/api/projects/{projectIdOrAlias}/groups/{groupIdOrKey}"
	got := e.GET(endpoint, pid.String(), groupID).
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
	e.GET(endpoint, pid.String(), "gr_xxxxxx").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	// Get by key - success
	got2 := e.GET(endpoint, pid.String(), "to-get").
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
	e.GET(endpoint, pid.String(), "unknown").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)
}

func TestIntegrationGroupUpdateWithProject(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// Create
	endpoint := "/api/projects/{projectIdOrAlias}/groups"
	created := e.POST(endpoint, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "ToUpdate", "key": "to-update"}).
		Expect().
		Status(http.StatusCreated).
		JSON().
		Object()

	groupID := created.Value("id").String().Raw()

	// Update by ID - success
	endpoint = "/api/projects/{projectIdOrAlias}/groups/{groupIdOrKey}"
	updated := e.PATCH(endpoint, pid.String(), groupID).
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
	e.PATCH(endpoint, pid.String(), "gr_unknown").
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "X"}).
		Expect().
		Status(http.StatusNotFound)

	// Update by key - success
	updated2 := e.PATCH(endpoint, pid.String(), "to-update").
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
	e.PATCH(endpoint, pid.String(), "not-found").
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "X"}).
		Expect().
		Status(http.StatusNotFound)
}

func TestIntegrationGroupDeleteWithProject(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// Create groups
	endpoint := "/api/projects/{projectIdOrAlias}/groups"
	created1 := e.POST(endpoint, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "ToDelete", "key": "to-delete"}).
		Expect().
		Status(http.StatusCreated).
		JSON().
		Object()

	created2 := e.POST(endpoint, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "ToDelete2", "key": "to-delete2"}).
		Expect().
		Status(http.StatusCreated).
		JSON().
		Object()

	groupID1 := created1.Value("id").String().Raw()
	groupID2 := created2.Value("id").String().Raw()

	// Delete
	endpoint = "/api/projects/{projectIdOrAlias}/groups/{groupIdOrKey}"

	// Delete by ID - success
	deleted := e.DELETE(endpoint, pid.String(), groupID2).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	deleted.HasValue("id", groupID2)

	// Delete by ID - already deleted
	e.DELETE(endpoint, pid.String(), groupID2).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	// Delete by key - success
	deleted2 := e.DELETE(endpoint, pid.String(), "to-delete").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	deleted2.HasValue("id", groupID1)

	// Delete by key - already deleted
	e.DELETE(endpoint, pid.String(), "to-delete").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)
}
