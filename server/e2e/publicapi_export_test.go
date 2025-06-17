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

	e.GET("/api/p/{project}/{model}.geojson", pApiP1Alias, pApiP1M4Key).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]interface{}{
			"type": "FeatureCollection",
			"features": []map[string]interface{}{
				{
					"type": "Feature",
					"id":   pApiP1M4I1Id.String(),
					"geometry": map[string]interface{}{
						"type": "Point",
						"coordinates": []interface{}{
							102,
							0.5,
						},
					},
					"properties": map[string]interface{}{
						pApiP1S3F1Key: map[string]interface{}{
							"text": "aaa",
						},
						pApiP1S3F2Key: []interface{}{
							map[string]interface{}{
								"text2": "bbb",
							},
						},
					},
				},
			},
		})
}
