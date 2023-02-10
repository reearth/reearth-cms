package e2e

import (
	"bytes"
	"net/http"
	"strings"
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
	a.Value("name").Equal("aaa.jpg")
	a.Value("contentType").Equal("image/jpg")
	a.Value("totalSize").Equal(1000)
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
		Expect().
		Status(http.StatusNotFound)

	t.Skip("creating asset skipped because of worker event")
	r := e.POST("/api/projects/{projectId}/assets", pid).
		WithHeader("authorization", "Bearer "+secret).
		WithMultipart().
		WithFile("file", "./testFile.jpg", strings.NewReader("test")).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	r.Keys().
		Contains("id", "modelId", "fields", "createdAt", "updatedAt", "version", "parents", "refs")
	r.Value("id").Equal(aid.String())
	r.Value("projectId").Equal(pid)
	r.Value("name").Equal("aaa.jpg")
	r.Value("contentType").Equal("image/jpg")
	r.Value("totalSize").Equal(1000)

}
