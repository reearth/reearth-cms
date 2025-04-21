package e2e

import (
	"net/http"
	"strings"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

// GET /assets/{assetId}
func TestIntegrationGetAssetAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.GET("/api/assets/{assetId}", id.NewAssetID()).
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/assets/{assetId}", id.NewAssetID()).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/assets/{assetId}", id.NewAssetID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	e.GET("/api/assets/{assetId}", aid1).
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

	e.DELETE("/api/assets/{assetId}", aid1).
		Expect().
		Status(http.StatusUnauthorized)

	e.DELETE("/api/assets/{assetId}", aid1).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.GET("/api/assets/{assetId}", aid1).
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

	e.DELETE("/api/assets/{assetId}", aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", aid1.String())

	e.GET("/api/assets/{assetId}", aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)
}

// Test asset Publish/Unpublish API with private asset bucket
func TestIntegrationPublishAssetAPI1(t *testing.T) {
	e := StartServer(t, &app.Config{
		Host:         "http://localhost:8080",
		AssetBaseURL: "http://localhost:8080",
		Asset_Public: false,
	}, true, baseSeeder)

	e.POST("/api/assets/{assetId}/publish", aid1).
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/assets/{assetId}/publish", aid1).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/assets/{assetId}/publish", id.NewAssetID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	e.POST("/api/assets/{assetId}/unpublish", aid1).
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/assets/{assetId}/unpublish", aid1).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/assets/{assetId}/unpublish", id.NewAssetID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	res := e.GET("/api/assets/{assetId}", aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	res.HasValue("public", false)
	res.Value("url").String().Match("localhost:8080/assets/[0-9a-f]{2}/[0-9a-f-]{34}/aaa.jpg")

	aUrl := strings.TrimPrefix(res.Value("url").String().Raw(), "http://localhost:8080")
	e.GET(aUrl).
		Expect().
		Status(http.StatusNotFound)

	e.POST("/api/assets/{assetId}/publish", aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", aid1.String()).
		HasValue("public", true)

	res = e.GET("/api/assets/{assetId}", aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.HasValue("public", true)
	res.Value("url").String().Match("localhost:8080/assets/[0-9a-f]{2}/[0-9a-f-]{34}/aaa.jpg")

	aUrl = strings.TrimPrefix(res.Value("url").String().Raw(), "http://localhost:8080")
	e.GET(aUrl).
		Expect().
		Status(http.StatusOK)

	e.POST("/api/assets/{assetId}/unpublish", aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", aid1.String()).
		HasValue("public", false)

	res = e.GET("/api/assets/{assetId}", aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.HasValue("public", false)
	res.Value("url").String().Match("localhost:8080/assets/[0-9a-f]{2}/[0-9a-f-]{34}/aaa.jpg")

	aUrl = strings.TrimPrefix(res.Value("url").String().Raw(), "http://localhost:8080")
	e.GET(aUrl).
		Expect().
		Status(http.StatusNotFound)

}

// Test asset Publish/Unpublish API with public asset bucket
func TestIntegrationPublishAssetAPI2(t *testing.T) {
	e := StartServer(t, &app.Config{
		Host:         "http://localhost:8080",
		AssetBaseURL: "http://localhost:8080",
		Asset_Public: true,
	}, true, baseSeeder)

	e.POST("/api/assets/{assetId}/publish", aid1).
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/assets/{assetId}/publish", aid1).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/assets/{assetId}/publish", id.NewAssetID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	e.POST("/api/assets/{assetId}/unpublish", aid1).
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/assets/{assetId}/unpublish", aid1).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	e.POST("/api/assets/{assetId}/unpublish", id.NewAssetID()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)

	res := e.GET("/api/assets/{assetId}", aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	res.HasValue("public", false)
	res.Value("url").String().Match("localhost:8080/assets/[0-9a-f]{2}/[0-9a-f-]{34}/aaa.jpg")

	aUrl := strings.TrimPrefix(res.Value("url").String().Raw(), "http://localhost:8080")
	e.GET(aUrl).
		Expect().
		Status(http.StatusOK)

	e.POST("/api/assets/{assetId}/publish", aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", aid1.String()).
		HasValue("public", true)

	res = e.GET("/api/assets/{assetId}", aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.HasValue("public", true)
	res.Value("url").String().Match("localhost:8080/assets/[0-9a-f]{2}/[0-9a-f-]{34}/aaa.jpg")

	aUrl = strings.TrimPrefix(res.Value("url").String().Raw(), "http://localhost:8080")
	e.GET(aUrl).
		Expect().
		Status(http.StatusOK)

	e.POST("/api/assets/{assetId}/unpublish", aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		HasValue("id", aid1.String()).
		HasValue("public", false)

	res = e.GET("/api/assets/{assetId}", aid1).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()

	res.HasValue("public", false)
	res.Value("url").String().Match("localhost:8080/assets/[0-9a-f]{2}/[0-9a-f-]{34}/aaa.jpg")

	aUrl = strings.TrimPrefix(res.Value("url").String().Raw(), "http://localhost:8080")
	e.GET(aUrl).
		Expect().
		Status(http.StatusOK)

}
