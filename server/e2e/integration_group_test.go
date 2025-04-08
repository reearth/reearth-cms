package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
)

func TestIntegrationGroupCreate(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)
	endpoint := "/api/projects/{projectIdOrAlias}/groups"

	// Successful creation
	e.POST(endpoint, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{
			"name": "Create Group",
			"key":  "create-group",
		}).
		Expect().
		Status(http.StatusCreated)

	// Conflict: duplicate key
	e.POST(endpoint, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{
			"name": "Create Group 2",
			"key":  "create-group",
		}).
		Expect().
		Status(http.StatusBadRequest)
}

func TestIntegrationGroupFilter(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)
	endpoint := "/api/projects/{projectIdOrAlias}/groups"

	e.GET(endpoint, pid.String()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		Keys().
		ContainsAll("groups", "totalCount", "page", "perPage")
}

func TestIntegrationGroupGetByIDAndKey(t *testing.T) {
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

	// Get by ID
	endpoint = "/api/groups/{groupId}"
	e.GET(endpoint, groupID).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", groupID)

	// Get by key
	endpoint = "/api/projects/{projectIdOrAlias}/groups/{groupIdOrKey}"
	e.GET(endpoint, pid.String(), "to-get").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", groupID)
}

func TestIntegrationGroupUpdateByIDAndKey(t *testing.T) {
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

	// Update by ID
	endpoint = "/api/groups/{groupId}"
	e.PATCH(endpoint, groupID).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "Updated via ID"}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("name", "Updated via ID")

	// Update by key
	endpoint = "/api/projects/{projectIdOrAlias}/groups/{groupIdOrKey}"
	e.PATCH(endpoint, pid.String(), "to-update").
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "Updated via Key"}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("name", "Updated via Key")
}

func TestIntegrationGroupDeleteByIDAndKey(t *testing.T) {
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

	// Delete by key
	endpoint = "/api/projects/{projectIdOrAlias}/groups/{groupIdOrKey}"
	e.DELETE(endpoint, pid.String(), "to-delete").
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", groupID)

	// Delete by ID should now return 404
	endpoint = "/api/groups/{groupId}"
	e.DELETE(endpoint, groupID).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)
}
