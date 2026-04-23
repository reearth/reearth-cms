package e2e

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
)

func TestIntegrationAPI_CORS(t *testing.T) {
	endpoints := []string{
		"/api/openapi.json",
		fmt.Sprintf("/api/%s/projects", wId0.String()),
	}

	t.Run("specific domain", func(t *testing.T) {
		e, _, _ := StartServerWithRepos(t, &app.Config{
			AssetBaseURL:        "https://example.com",
			Integration_Origins: []string{"https://example.com"},
			Dev:                 false,
		}, true, publicAPISeeder)

		for _, endpoint := range endpoints {
			res := e.OPTIONS(endpoint).
				WithHeader("Origin", "https://example.com").
				WithHeader("Access-Control-Request-Method", "GET").
				Expect().
				Status(http.StatusNoContent)
			res.Header("Access-Control-Allow-Origin").IsEqual("https://example.com")
			res.Header("Access-Control-Allow-Methods").Contains("GET")
		}
	})

	t.Run("*", func(t *testing.T) {
		e, _, _ := StartServerWithRepos(t, &app.Config{
			AssetBaseURL:        "https://example.com",
			Integration_Origins: []string{"*"},
		}, true, publicAPISeeder)

		for _, endpoint := range endpoints {
			res := e.OPTIONS(endpoint).
				WithHeader("Origin", "https://example.com").
				WithHeader("Access-Control-Request-Method", "POST").
				Expect().
				Status(http.StatusNoContent)
			res.Header("Access-Control-Allow-Origin").IsEqual("*")
			res.Header("Access-Control-Allow-Methods").Contains("POST")
		}
	})

	t.Run("specific integration domain in dev mode", func(t *testing.T) {
		e, _, _ := StartServerWithRepos(t, &app.Config{
			AssetBaseURL:        "https://example.com",
			Integration_Origins: []string{"https://example.com"},
			Dev:                 true,
		}, true, publicAPISeeder)

		for _, endpoint := range endpoints {
			res := e.OPTIONS(endpoint).
				WithHeader("Origin", "https://example.com").
				WithHeader("Access-Control-Request-Method", "POST").
				Expect().
				Status(http.StatusNoContent)
			res.Header("Access-Control-Allow-Origin").IsEqual("*")
			res.Header("Access-Control-Allow-Methods").Contains("POST")
		}
	})
}
