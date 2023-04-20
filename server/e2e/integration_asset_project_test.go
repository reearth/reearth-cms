package e2e

import (
	"bytes"
	"net/http"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

// GET projects/{projectId}/assets
func TestIntegrationGetAssetListAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.GET("/api/projects/{projectId}/assets", pid).
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/projects/{projectId}/assets", pid).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/projects/{projectId}/assets", pid).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	// e.GET("/api/projects/{projectId}/assets", id.NewProjectID()).
	// 	WithHeader("authorization", "Bearer "+secret).
	// 	WithQuery("page", 1).
	// 	WithQuery("perPage", 5).
	// 	Expect().
	// 	Status(http.StatusNotFound)

	obj := e.GET("/api/projects/{projectId}/assets", pid).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	obj.Value("page").Equal(1)
	obj.Value("perPage").Equal(5)
	obj.Value("totalCount").Equal(1)

	al := obj.Value("items").Array()
	al.Length().Equal(1)
	a := al.First().Object()
	a.Value("id").Equal(aid.String())
	a.Value("projectId").Equal(pid)
	a.Value("totalSize").Equal(1000)
	a.Value("previewType").Equal("unknown")
	// a.Value("createdAt").Equal("")
	// a.Value("updatedAt").Equal("")
}

// POST projects/{projectId}/assets
func TestIntegrationCreateAssetAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.POST("/api/projects/{projectId}/assets", id.NewProjectID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/projects/{projectId}/assets", id.NewProjectID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/projects/{projectId}/assets", id.NewProjectID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/projects/{projectId}/assets", id.NewProjectID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusBadRequest)

	b := bytes.NewBufferString("test data")
	e.POST("/api/projects/{projectId}/assets", id.NewProjectID()).
		WithHeader("authorization", "Bearer "+secret).
		WithMultipart().
		WithFile("file", "path", b).
		WithForm(map[string]any{"skipDecompression": true}).
		Expect().
		Status(http.StatusNotFound)

	r := e.POST("/api/projects/{projectId}/assets", pid).
		WithHeader("authorization", "Bearer "+secret).
		WithMultipart().
		WithFile("file", "testData/image.png").
		WithForm(map[string]any{"skipDecompression": true}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	r.Keys().
		Contains("createdAt", "file", "id", "name", "previewType", "projectId", "contentType", "url", "totalSize")
	r.Value("projectId").Equal(pid)
	r.Value("name").Equal("image.png")
	r.Value("contentType").Equal("image/png")
	r.Value("totalSize").Equal(2502)
}
