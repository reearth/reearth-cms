package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
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
