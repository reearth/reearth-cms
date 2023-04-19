package e2e

import (
	"bytes"
	"net/http"
	"strings"
	"testing"
	"time"

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

	e.GET("/api/projects/{projectId}/assets", id.NewProjectID()).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		ValueEqual("page", 1).
		ValueEqual("perPage", 5).
		ValueEqual("totalCount", 0)

	obj := e.GET("/api/projects/{projectId}/assets", pid).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		ValueEqual("page", 1).
		ValueEqual("perPage", 5).
		ValueEqual("totalCount", 1)

	al := obj.Value("items").Array()
	al.Length().Equal(1)
	al.First().Object().
		ValueEqual("id", aid.String()).
		ValueEqual("projectId", pid).
		ValueEqual("totalSize", 1000).
		ValueEqual("previewType", "unknown").
		ValueEqual("createdAt", aid.Timestamp().UTC().Format("2006-01-02T15:04:05.000Z")).
		ValueEqual("updatedAt", time.Time{}.Format("2006-01-02T15:04:05Z"))
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
		Object().
		ValueEqual("id", aid.String()).
		ValueEqual("projectId", pid).
		ValueEqual("name", "aaa.jpg").
		ValueEqual("contentType", "image/jpg").
		ValueEqual("totalSize", 1000)
	r.Keys().
		Contains("id", "modelId", "fields", "createdAt", "updatedAt", "version", "parents", "refs")

}
