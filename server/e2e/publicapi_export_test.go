package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
)

func TestPublicAPI_Export(t *testing.T) {
	e, _, _ := StartServerWithRepos(t, &app.Config{
		AssetBaseURL: "https://example.com",
	}, true, publicAPISeeder)

	e.GET("/api/p/{workspace}/{project}/{model}.geojson", pApiW1Alias, pApiP1Alias, pApiP1M4Key).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]any{
			"type": "FeatureCollection",
			"features": []map[string]any{
				{
					"type": "Feature",
					"id":   pApiP1M4I1Id.String(),
					"geometry": map[string]any{
						"type": "Point",
						"coordinates": []any{
							102,
							0.5,
						},
					},
					"properties": map[string]any{
						pApiP1S3F1Key: map[string]any{
							"text": "aaa",
						},
						pApiP1S3F2Key: []any{
							map[string]any{
								"text2": "bbb",
							},
						},
					},
				},
			},
		})
}
