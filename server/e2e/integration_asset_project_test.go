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

func iAPIAssetFilter(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/assets"
	return e.GET(endpoint, workspaceIdOrAlias, projectIdOrAlias)
}

func iAPIAssetCreate(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/assets"
	return e.POST(endpoint, workspaceIdOrAlias, projectIdOrAlias)
}

func iAPIAssetUploadCreate(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/assets/uploads"
	return e.POST(endpoint, workspaceIdOrAlias, projectIdOrAlias)
}

func iAPIAssetBatchDelete(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/assets"
	return e.DELETE(endpoint, workspaceIdOrAlias, projectIdOrAlias)
}

// GET projects/{projectId}/assets
func TestIntegrationGetAssetListAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIAssetFilter(e, wId0, pid).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetFilter(e, wId0, pid).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetFilter(e, wId0, pid).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetFilter(e, wId0, id.NewProjectID()).
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

	obj := iAPIAssetFilter(e, wId0, pid).
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

	iAPIAssetFilter(e, wId0, pid).
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

	iAPIAssetCreate(e, wId0, id.NewProjectID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCreate(e, wId0, id.NewProjectID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCreate(e, wId0, id.NewProjectID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetCreate(e, wId0, id.NewProjectID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusBadRequest)

	b := bytes.NewBufferString("test data")
	iAPIAssetCreate(e, wId0, id.NewProjectID()).
		WithHeader("authorization", "Bearer "+secret).
		WithMultipart().
		WithFile("file", "path", b).
		WithForm(map[string]any{"skipDecompression": true}).
		Expect().
		Status(http.StatusNotFound)

	r := iAPIAssetCreate(e, wId0, pid).
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

	iAPIAssetUploadCreate(e, wId0, id.NewProjectID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetUploadCreate(e, wId0, id.NewProjectID()).
		WithHeader("authorization", "secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetUploadCreate(e, wId0, id.NewProjectID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetUploadCreate(e, wId0, id.NewProjectID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusBadRequest)

	iAPIAssetUploadCreate(e, wId0, pid).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"name": "test.jpg"}).
		Expect().
		Status(http.StatusNotFound) // FS does not support upload link
}
