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
	e.GET(endpoint, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("page", 1).
		HasValue("perPage", 50).
		HasValue("totalCount", 2)
}

func TestIntegrationGroupCreate(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)
	endpoint := "/api/projects/{projectIdOrAlias}/groups"

	// Unauthorized
	e.POST(endpoint, pid.String()).
		Expect().
		Status(http.StatusUnauthorized)

	// Success
	e.POST(endpoint, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{
			"name": "Create Group",
			"key":  "create-group",
		}).
		Expect().
		Status(http.StatusCreated)

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
	e.GET(endpoint, groupID).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", groupID)

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
	e.PATCH(endpoint, groupID).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "Updated Name"}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("name", "Updated Name")

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
	e.DELETE(endpoint, groupID).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", groupID)

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
	e.GET(endpoint, pid.String(), groupID).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", groupID)

	// Get by ID - not found
	e.GET(endpoint, pid.String(), "gr_xxxxxx").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	// Get by key - success
	e.GET(endpoint, pid.String(), "to-get").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", groupID)

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
	e.PATCH(endpoint, pid.String(), groupID).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "Updated Name"}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("name", "Updated Name")

	// Update by ID - not found
	e.PATCH(endpoint, pid.String(), "gr_unknown").
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "X"}).
		Expect().
		Status(http.StatusNotFound)

	// Update by key - success
	e.PATCH(endpoint, pid.String(), "to-update").
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "Updated Again"}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("name", "Updated Again")

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

	// Delete by ID - success
	endpoint = "/api/projects/{projectIdOrAlias}/groups/{groupIdOrKey}"
	e.DELETE(endpoint, pid.String(), groupID2).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", groupID2)

	// Delete by ID - already deleted
	e.DELETE(endpoint, pid.String(), groupID2).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	// Delete by key - success
	e.DELETE(endpoint, pid.String(), "to-delete").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", groupID1)

	// Delete by key - already deleted
	e.DELETE(endpoint, pid.String(), "to-delete").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)
}
