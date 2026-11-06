package e2e

import (
	"net/http"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/app"
)

// POST /models/{modelId}/items with a unified Geometry field
func TestIntegrationItemGeometryField(t *testing.T) {
	e := StartServer(t, &app.Config{}, true, baseSeeder)

	fid := iAPIFieldCreate(e, wId0, pid, sid1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{
			"key":      "geo",
			"type":     "geometry",
			"multiple": true,
			"required": false,
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		Value("id").String().Raw()

	point := map[string]any{"type": "Point", "coordinates": []any{139.7, 35.6}}
	line := map[string]any{"type": "LineString", "coordinates": []any{[]any{139.7, 35.6}, []any{139.8, 35.7}}}

	// values can be sent as objects or as GeoJSON strings, they are always returned as objects
	itm := iAPIItemCreate(e, wId0, pid, mId1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{
			"fields": []any{
				map[string]any{
					"key": "geo",
					"value": []any{
						point,
						`{"type": "LineString", "coordinates": [[139.70, 35.60], [139.8, 35.7]]}`,
					},
				},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	itm.Value("fields").IsEqual([]any{
		map[string]any{
			"id":    fid,
			"key":   "geo",
			"type":  "geometry",
			"value": []any{point, line},
		},
	})

	iAPIItemGet(e, wId0, pid, mId1, itm.Value("id").String().Raw()).
		WithHeader("authorization", "Bearer "+secret).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		Value("fields").IsEqual([]any{
		map[string]any{
			"id":    fid,
			"key":   "geo",
			"type":  "geometry",
			"value": []any{point, line},
		},
	})

	// invalid geometries are rejected
	for _, v := range []any{
		map[string]any{"type": "Point", "coordinates": []any{35.6, 139.7}},
		map[string]any{"type": "Point", "coordinates": []any{139.7, 35.6}, "name": "x"},
		map[string]any{"type": "GeometryCollection", "geometries": []any{map[string]any{"type": "GeometryCollection", "geometries": []any{}}}},
		map[string]any{"type": "LineString", "coordinates": []any{[]any{139.7, 35.6}}},
		`{"type": "Polygon", "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1]]]}`,
	} {
		iAPIItemCreate(e, wId0, pid, mId1).
			WithHeader("authorization", "Bearer "+secret).
			WithJSON(map[string]any{
				"fields": []any{
					map[string]any{"key": "geo", "value": []any{v}},
				},
			}).
			Expect().
			Status(http.StatusBadRequest)
	}
}
