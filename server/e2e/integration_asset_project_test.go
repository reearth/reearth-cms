package e2e

import (
	"bytes"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

func iAPIProjectAssetsList(e *httpexpect.Expect, projectId interface{}) *httpexpect.Request {
	endpoint := "/api/projects/{projectId}/assets"
	return e.GET(endpoint, projectId)
}

func iAPIProjectAssetCreate(e *httpexpect.Expect, projectId interface{}) *httpexpect.Request {
	endpoint := "/api/projects/{projectId}/assets"
	return e.POST(endpoint, projectId)
}

func iAPIProjectAssetCreateUpload(e *httpexpect.Expect, projectId interface{}) *httpexpect.Request {
	endpoint := "/api/projects/{projectId}/assets/uploads"
	return e.POST(endpoint, projectId)
}

// GET projects/{projectId}/assets
func TestIntegrationGetAssetListAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIProjectAssetsList(e, pid).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectAssetsList(e, pid).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectAssetsList(e, pid).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectAssetsList(e, id.NewProjectID()).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("page", 1).
		HasValue("perPage", 5).
		HasValue("totalCount", 0)

	obj := iAPIProjectAssetsList(e, pid).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("page", 1).
		HasValue("perPage", 5).
		HasValue("totalCount", 3)

	al := obj.Value("items").Array()
	al.Length().IsEqual(3)
	al.Value(0).Object().
		HasValue("id", aid1.String()).
		HasValue("projectId", pid).
		HasValue("totalSize", 1000).
		HasValue("previewType", "unknown").
		HasValue("createdAt", aid1.Timestamp().UTC().Format(time.RFC3339Nano)).
		HasValue("updatedAt", time.Time{}.Format("2006-01-02T15:04:05Z"))

	iAPIProjectAssetsList(e, pid).
		WithHeader("authorization", "Bearer "+secret).
		WithQuery("page", 1).
		WithQuery("perPage", 5).
		WithQuery("keyword", "aaa").
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("totalCount", 1)
}

// POST projects/{projectId}/assets
func TestIntegrationCreateAssetAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIProjectAssetCreate(e, id.NewProjectID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectAssetCreate(e, id.NewProjectID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectAssetCreate(e, id.NewProjectID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectAssetCreate(e, id.NewProjectID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusBadRequest)

	b := bytes.NewBufferString("test data")
	iAPIProjectAssetCreate(e, id.NewProjectID()).
		WithHeader("authorization", "Bearer "+secret).
		WithMultipart().
		WithFile("file", "path", b).
		WithForm(map[string]any{"skipDecompression": true}).
		Expect().
		Status(http.StatusNotFound)

	r := iAPIProjectAssetCreate(e, pid).
		WithHeader("authorization", "Bearer "+secret).
		WithMultipart().
		WithFile("file", "./testFile.jpg", strings.NewReader("test")).
		WithForm(map[string]any{"skipDecompression": true}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("projectId", pid).
		HasValue("name", "testFile.jpg").
		HasValue("contentType", "image/jpeg").
		HasValue("totalSize", 4)
	r.Keys().
		ContainsAll("id", "file", "name", "projectId", "url", "contentType", "createdAt", "previewType", "totalSize", "updatedAt")
}

// POST projects/{projectId}/assets/uploads
func TestIntegrationCreateAssetUploadAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIProjectAssetCreateUpload(e, id.NewProjectID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectAssetCreateUpload(e, id.NewProjectID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectAssetCreateUpload(e, id.NewProjectID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIProjectAssetCreateUpload(e, id.NewProjectID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusBadRequest)

	iAPIProjectAssetCreateUpload(e, pid).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "test.jpg"}).
		Expect().
		Status(http.StatusNotFound) // FS does not support upload link
}
