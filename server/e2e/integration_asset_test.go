package e2e

import (
	"net/http"
	"strings"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

func iAPIAssetGet(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}, assetId interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/assets/{assetId}"
	return e.GET(endpoint, workspaceIdOrAlias, projectIdOrAlias, assetId)
}

func iAPIAssetDelete(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}, assetId interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/assets/{assetId}"
	return e.DELETE(endpoint, workspaceIdOrAlias, projectIdOrAlias, assetId)
}

func iAPIAssetPublish(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}, assetId interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/assets/{assetId}/publish"
	return e.POST(endpoint, workspaceIdOrAlias, projectIdOrAlias, assetId)
}

func iAPIAssetUnpublish(e *httpexpect.Expect, workspaceIdOrAlias interface{}, projectIdOrAlias interface{}, assetId interface{}) *httpexpect.Request {
	endpoint := "/api/{workspaceIdOrAlias}/projects/{projectIdOrAlias}/assets/{assetId}/unpublish"
	return e.POST(endpoint, workspaceIdOrAlias, projectIdOrAlias, assetId)
}

// GET /assets/{assetId}
func TestIntegrationGetAssetAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIAssetGet(e, wId0, pid, id.NewAssetID()).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetGet(e, wId0, pid, id.NewAssetID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetGet(e, wId0, pid, id.NewAssetID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	iAPIAssetGet(e, wId0, pid, aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", aid1.String()).
		HasValue("projectId", pid).
		HasValue("name", "aaa.jpg").
		HasValue("contentType", "image/jpg").
		HasValue("totalSize", 1000)
}

// DELETE /assets/{assetId}
func TestIntegrationDeleteAssetAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	iAPIAssetDelete(e, wId0, pid, aid1).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetDelete(e, wId0, pid, aid1).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetGet(e, wId0, pid, aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", aid1.String()).
		HasValue("projectId", pid).
		HasValue("name", "aaa.jpg").
		HasValue("contentType", "image/jpg").
		HasValue("totalSize", 1000)

	iAPIAssetDelete(e, wId0, pid, aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", aid1.String())

	iAPIAssetGet(e, wId0, pid, aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)
}

// Test asset Publish/Unpublish API with private asset bucket
func TestIntegrationPublishAssetAPI1(t *testing.T) {
	e := StartServer(t, &app.Config{
		Host:         "https://api.example.com",
		AssetBaseURL: "https://assets.example.com",
		Asset_Public: false,
	}, true, baseSeeder)

	iAPIAssetPublish(e, wId0, pid, aid1).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetPublish(e, wId0, pid, aid1).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetPublish(e, wId0, pid, id.NewAssetID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	iAPIAssetUnpublish(e, wId0, pid, aid1).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetUnpublish(e, wId0, pid, aid1).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetUnpublish(e, wId0, pid, id.NewAssetID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	res := iAPIAssetGet(e, wId0, pid, aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	res.HasValue("public", false)
	res.Value("url").String().Match("https://api.example.com/assets/[0-9a-f]{2}/[0-9a-f-]{34}/aaa.jpg")

	aUrl := strings.TrimPrefix(res.Value("url").String().Raw(), "https://api.example.com")
	e.GET(aUrl).
		Expect().
		Status(http.StatusNotFound)
	e.GET(aUrl).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK)

	iAPIAssetPublish(e, wId0, pid, aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", aid1.String()).
		HasValue("public", true)

	res = iAPIAssetGet(e, wId0, pid, aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.HasValue("public", true)
	res.Value("url").String().Match("https://assets.example.com/assets/[0-9a-f]{2}/[0-9a-f-]{34}/aaa.jpg")

	aUrl = strings.TrimPrefix(res.Value("url").String().Raw(), "https://assets.example.com")
	e.GET(aUrl).
		Expect().
		Status(http.StatusOK)

	iAPIAssetUnpublish(e, wId0, pid, aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", aid1.String()).
		HasValue("public", false)

	res = iAPIAssetGet(e, wId0, pid, aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.HasValue("public", false)
	res.Value("url").String().Match("https://api.example.com/assets/[0-9a-f]{2}/[0-9a-f-]{34}/aaa.jpg")

	aUrl = strings.TrimPrefix(res.Value("url").String().Raw(), "https://api.example.com")
	e.GET(aUrl).
		Expect().
		Status(http.StatusNotFound)
	e.GET(aUrl).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK)

}

// Test asset Publish/Unpublish API with public asset bucket
func TestIntegrationPublishAssetAPI2(t *testing.T) {
	e := StartServer(t, &app.Config{
		Host:         "https://api.example.com",
		AssetBaseURL: "https://assets.example.com",
		Asset_Public: true,
	}, true, baseSeeder)

	iAPIAssetPublish(e, wId0, pid, aid1).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetPublish(e, wId0, pid, aid1).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetPublish(e, wId0, pid, id.NewAssetID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	iAPIAssetUnpublish(e, wId0, pid, aid1).
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetUnpublish(e, wId0, pid, aid1).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	iAPIAssetUnpublish(e, wId0, pid, id.NewAssetID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	res := iAPIAssetGet(e, wId0, pid, aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	res.HasValue("public", true)
	res.Value("url").String().Match("https://assets.example.com/assets/[0-9a-f]{2}/[0-9a-f-]{34}/aaa.jpg")

	aUrl := strings.TrimPrefix(res.Value("url").String().Raw(), "https://assets.example.com")
	e.GET(aUrl).
		Expect().
		Status(http.StatusOK)

	iAPIAssetPublish(e, wId0, pid, aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", aid1.String()).
		HasValue("public", true)

	res = iAPIAssetGet(e, wId0, pid, aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.HasValue("public", true)
	res.Value("url").String().Match("https://assets.example.com/assets/[0-9a-f]{2}/[0-9a-f-]{34}/aaa.jpg")

	aUrl = strings.TrimPrefix(res.Value("url").String().Raw(), "https://assets.example.com")
	e.GET(aUrl).
		Expect().
		Status(http.StatusOK)

	iAPIAssetUnpublish(e, wId0, pid, aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", aid1.String()).
		HasValue("public", true)

	res = iAPIAssetGet(e, wId0, pid, aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.HasValue("public", true)
	res.Value("url").String().Match("https://assets.example.com/assets/[0-9a-f]{2}/[0-9a-f-]{34}/aaa.jpg")

	aUrl = strings.TrimPrefix(res.Value("url").String().Raw(), "https://assets.example.com")
	e.GET(aUrl).
		Expect().
		Status(http.StatusOK)
}
