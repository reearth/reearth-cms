package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

// GET /{workspaceId}}/project
func TestIntegrationProjectGetAPI(t *testing.T) {
	endpoint := "/api/{workspaceId}/projects"
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
