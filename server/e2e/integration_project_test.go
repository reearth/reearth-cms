package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

// GET /{workspaceId}}/projects
func TestIntegrationProjectFilterAPI(t *testing.T) {
	endpoint := "/api/{workspaceId}/projects"
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.GET(endpoint, id.NewWorkspaceID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.GET(endpoint, id.NewWorkspaceID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET(endpoint, id.NewWorkspaceID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET(endpoint, id.NewWorkspaceID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	res := e.GET(endpoint, wId0).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.HasValue("page", 1).
		HasValue("perPage", 50).
		HasValue("totalCount", 1).
		Path("$.projects[:].id").Array().IsEqual([]string{pid.String()})

	res.Path("$.projects[:].workspaceId").Array().IsEqual([]string{wId0.String()})
}

// POST /{workspaceId}/projects
func TestIntegrationProjectCreateAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)
	endpoint := "/api/{workspaceId}/projects"

	// Unauthorized
	e.POST(endpoint, id.NewWorkspaceID).
		WithJSON(map[string]any{"name": "Unauthorized Project"}).
		Expect().
		Status(http.StatusUnauthorized)

	// Valid creation
	res := e.POST(endpoint, wId0).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{
			"name":         "Test Project",
			"description":  "This is a test project",
			"alias":        "test-project-alias",
			"requestRoles": []string{"READER", "WRITER"},
		}).
		Expect().
		Status(http.StatusCreated).
		JSON().
		Object()

	res.HasValue("name", "Test Project").
		HasValue("description", "This is a test project").
		HasValue("alias", "test-project-alias").
		HasValue("requestRoles", []string{"READER", "WRITER"}).
		HasValue("workspaceId", wId0.String()).
		Keys().ContainsAll("id", "createdAt")
}

// GET /{workspaceId}/projects/{projectIdOrAlias}
func TestIntegrationProjectGetAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)
	endpoint := "/api/{workspaceId}/projects/{projectIdOrAlias}"

	// Unauthorized
	e.GET(endpoint, wId0, pid).
		Expect().
		Status(http.StatusUnauthorized)

	// Authorized fetch
	res := e.GET(endpoint, wId0, pid).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.HasValue("id", pid.String()).
		HasValue("workspaceId", wId0.String())
}

// PATCH /{workspaceId}/projects/{projectIdOrAlias}
func TestIntegrationProjectUpdateAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)
	endpoint := "/api/{workspaceId}/projects/{projectIdOrAlias}"

	// Unauthorized
	e.PATCH(endpoint, wId0, pid).
		WithJSON(map[string]any{
			"name": "Updated Name",
		}).
		Expect().
		Status(http.StatusUnauthorized)

	// Authorized update
	res := e.PATCH(endpoint, wId0, pid).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{
			"name":         "Updated Project Name",
			"description":  "Updated Description",
			"alias":        "updated-alias",
			"publication":  map[string]any{"scope": "PUBLIC", "assetPublic": true},
			"requestRoles": []string{"OWNER", "READER"},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.HasValue("name", "Updated Project Name").
		HasValue("description", "Updated Description").
		HasValue("alias", "updated-alias").
		HasValue("publication", map[string]any{"scope": "PUBLIC", "assetPublic": true, "token": ""}).
		HasValue("requestRoles", []string{"OWNER", "READER"}).
		HasValue("workspaceId", wId0.String()).
		Keys().ContainsAll("id", "createdAt", "updatedAt")
}

// DELETE /{workspaceId}/projects/{projectIdOrAlias}
func TestIntegrationProjectDeleteAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// First, create a project to delete
	createRes := e.POST("/api/{workspaceId}/projects", wId0).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{
			"name":  "Temp Project",
			"alias": "to-delete",
		}).
		Expect().
		Status(http.StatusCreated).
		JSON().
		Object()

	projectIDToDelete := createRes.Value("id").String().Raw()

	// Unauthorized
	e.DELETE("/api/{workspaceId}/projects/{projectIdOrAlias}", wId0, projectIDToDelete).
		Expect().
		Status(http.StatusUnauthorized)

	// Authorized delete
	del := e.DELETE("/api/{workspaceId}/projects/{projectIdOrAlias}", wId0, projectIDToDelete).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	del.HasValue("id", projectIDToDelete)
}
