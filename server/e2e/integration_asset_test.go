package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

// GET|/assets/{assetId}
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

	obj := e.GET("/api/assets/{assetId}", aid).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("id").Equal(aid.String())
	obj.Value("projectId").Equal(pid)
	obj.Value("name").Equal("aaa.jpg")
	obj.Value("contentType").Equal("image/jpg")
	obj.Value("totalSize").Equal(1000)
}

// DELETE|/assets/{assetId}
func TestIntegrationDeleteAssetAPI(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	e.DELETE("/api/assets/{assetId}", aid).
		Expect().
		Status(http.StatusUnauthorized)

	e.DELETE("/api/assets/{assetId}", aid).
		WithHeader("authorization", "Bearer secret_abc").
		Expect().
		Status(http.StatusUnauthorized)

	obj := e.GET("/api/assets/{assetId}", aid).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	obj.Value("id").Equal(aid.String())
	obj.Value("projectId").Equal(pid)
	obj.Value("name").Equal("aaa.jpg")
	obj.Value("contentType").Equal("image/jpg")
	obj.Value("totalSize").Equal(1000)

	e.DELETE("/api/assets/{assetId}", aid).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().Keys().
		Contains("id")

	e.GET("/api/assets/{assetId}", aid).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusNotFound)
}
