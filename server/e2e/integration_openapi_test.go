package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/stretchr/testify/assert"
)

func TestIntegrationOpenAPISpec(t *testing.T) {
	e := StartServer(t, &app.Config{}, false, nil)

	obj := e.GET("/api/openapi.json").
		Expect().
		Status(http.StatusOK).
		HasContentType("application/json").
		JSON().Object()

	obj.Value("openapi").String().NotEmpty()
	obj.Value("info").Object().NotEmpty()
	obj.Value("paths").Object().NotEmpty()
}

func TestIntegrationOpenAPISpecWithQueryParams(t *testing.T) {
	e := StartServer(t, &app.Config{}, false, nil)

	r := e.GET("/api/openapi.json").
		WithQuery("workspaceId", "ws1").
		Expect().
		Status(http.StatusOK).
		HasContentType("application/json").
		Body().Raw()

	assert.NotContains(t, r, "{workspaceIdOrAlias}")
	assert.Contains(t, r, "ws1")
}
