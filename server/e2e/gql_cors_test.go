package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
)

func TestGQL_COES(t *testing.T) {
	e, _, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
		Origins:      []string{"https://example.com"},
	}, true, publicAPISeeder)

	res := e.OPTIONS("/gql").
		WithHeader("Origin", "https://example.com").
		WithHeader("Access-Control-Request-Method", "POST").
		Expect().
		Status(http.StatusNoContent)
	res.Header("Access-Control-Allow-Origin").IsEqual("https://example.com")
	res.Header("Access-Control-Allow-Methods").Contains("POST")

	e, _, _ = StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
		Origins:      []string{"*"},
	}, true, publicAPISeeder)

	res = e.OPTIONS("/gql").
		WithHeader("Origin", "https://example.com").
		WithHeader("Access-Control-Request-Method", "POST").
		Expect().
		Status(http.StatusNoContent)
	res.Header("Access-Control-Allow-Origin").IsEqual("*")
	res.Header("Access-Control-Allow-Methods").Contains("POST")
}
