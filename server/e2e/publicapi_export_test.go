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

	e.GET("/api/p/{project}/{model}.geojson", publicAPIProjectAlias, publicAPIModelKey5).
		Expect().
		Status(http.StatusOK).
		JSON().
		IsEqual(map[string]interface{}{
			"type": "FeatureCollection",
			"features": []map[string]interface{}{
				{
					"type": "Feature",
					"id":   publicAPIItem8ID.String(),
					"geometry": map[string]interface{}{
						"type": "Point",
						"coordinates": []interface{}{
							102,
							0.5,
						},
					},
					"properties": map[string]interface{}{
						publicAPIField7Key: map[string]interface{}{
							"text": "aaa",
						},
						publicAPIField8Key: []interface{}{
							map[string]interface{}{
								"text2": "bbb",
							},
						},
					},
				},
			},
		})
}
