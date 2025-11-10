package e2e

import (
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
)

func iAPIProjectFilter(e *httpexpect.Expect, workspaceId accountdomain.WorkspaceID) *httpexpect.Request {
	endpoint := "/api/{workspaceId}/projects"
	return e.GET(endpoint, workspaceId)
}

func iAPIProjectCreate(e *httpexpect.Expect, workspaceId accountdomain.WorkspaceID) *httpexpect.Request {
	endpoint := "/api/{workspaceId}/projects"
	return e.POST(endpoint, workspaceId)
}

func iAPIProjectGet(e *httpexpect.Expect, workspaceId accountdomain.WorkspaceID, projectId id.ProjectID) *httpexpect.Request {
	endpoint := "/api/{workspaceId}/projects/{projectId}"
	return e.GET(endpoint, workspaceId, projectId)
}

func iAPIProjectUpdate(e *httpexpect.Expect, workspaceId accountdomain.WorkspaceID, projectId id.ProjectID) *httpexpect.Request {
	endpoint := "/api/{workspaceId}/projects/{projectId}"
	return e.PATCH(endpoint, workspaceId, projectId)
}

func iAPIProjectDelete(e *httpexpect.Expect, workspaceId accountdomain.WorkspaceID, projectId id.ProjectID) *httpexpect.Request {
	endpoint := "/api/{workspaceId}/projects/{projectId}"
	return e.DELETE(endpoint, workspaceId, projectId)
}

// GET /{workspaceId}}/projects
func TestIntegrationProjectFilterAPI(t *testing.T) {

	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIProjectFilter(e, accountdomain.NewWorkspaceID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectFilter(e, accountdomain.NewWorkspaceID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectFilter(e, accountdomain.NewWorkspaceID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectFilter(e, accountdomain.NewWorkspaceID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	res := iAPIProjectFilter(e, wId0).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.HasValue("page", 1).
		HasValue("perPage", 50).
		HasValue("totalCount", 2).
		Path("$.projects[:].id").Array().IsEqual([]string{pid2.String(), pid.String()})

	res.Path("$.projects[:].workspaceId").Array().IsEqual([]string{wId0.String(), wId0.String()})
}

// POST /{workspaceId}/projects
func TestIntegrationProjectCreateAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// Unauthorized
	iAPIProjectCreate(e, accountdomain.NewWorkspaceID()).
		WithJSON(map[string]any{"name": "Unauthorized Project"}).
		Expect().
		Status(http.StatusUnauthorized)

	// Valid creation
	res := iAPIProjectCreate(e, wId0).
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

// GET /{workspaceId}/projects/{projectId}
func TestIntegrationProjectGetAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// Unauthorized
	iAPIProjectGet(e, wId0, pid).
		Expect().
		Status(http.StatusUnauthorized)

	// Authorized fetch
	res := iAPIProjectGet(e, wId0, pid).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.HasValue("id", pid.String()).
		HasValue("workspaceId", wId0.String())
}

// PATCH /{workspaceId}/projects/{projectId}
func TestIntegrationProjectUpdateAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// Unauthorized
	iAPIProjectUpdate(e, wId0, pid).
		WithJSON(map[string]any{
			"name": "Updated Name",
		}).
		Expect().
		Status(http.StatusUnauthorized)

	// Authorized update public scope
	res := iAPIProjectUpdate(e, wId0, pid).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{
			"name":          "Updated Project Name",
			"description":   "Updated Description",
			"alias":         "updated-alias",
			"accessibility": map[string]any{"visibility": "PUBLIC", "publication": nil},
			"requestRoles":  []string{"OWNER", "READER"},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.HasValue("name", "Updated Project Name").
		HasValue("description", "Updated Description").
		HasValue("alias", "updated-alias").
		HasValue("accessibility", map[string]any{"visibility": "PUBLIC", "apiKeys": nil}).
		HasValue("requestRoles", []string{"OWNER", "READER"}).
		HasValue("workspaceId", wId0.String()).
		Keys().ContainsAll("id", "createdAt", "updatedAt")

	// Authorized update limited scope
	res = iAPIProjectUpdate(e, wId0, pid).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{
			"name":          "Updated Project Name 2",
			"description":   "Updated Description 2",
			"alias":         "updated-alias-2",
			"accessibility": map[string]any{"visibility": "PRIVATE", "publication": nil},
			"requestRoles":  []string{"WRITER"},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.HasValue("name", "Updated Project Name 2").
		HasValue("description", "Updated Description 2").
		HasValue("alias", "updated-alias-2").
		HasValue("requestRoles", []string{"WRITER"}).
		HasValue("workspaceId", wId0.String()).
		HasValue("accessibility", map[string]any{"visibility": "PRIVATE", "apiKeys": []any{}}).
		Keys().ContainsAll("id", "createdAt", "updatedAt")
}

// DELETE /{workspaceId}/projects/{projectId}
func TestIntegrationProjectDeleteAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	// First, create a project to delete
	createRes := iAPIProjectCreate(e, wId0).
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
	iAPIProjectDelete(e, wId0, id.MustProjectID(projectIDToDelete)).
		Expect().
		Status(http.StatusUnauthorized)

	// Authorized delete
	del := iAPIProjectDelete(e, wId0, id.MustProjectID(projectIDToDelete)).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	del.HasValue("id", projectIDToDelete)

	// Verify the project is deleted
	iAPIProjectGet(e, wId0, id.MustProjectID(projectIDToDelete)).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)
}
