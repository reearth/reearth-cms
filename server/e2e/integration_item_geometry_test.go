package e2e

import (
	"net/http"
	"strings"
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

	// a valid bbox is accepted and stored
	pointWithBBox := map[string]any{"type": "Point", "bbox": []any{139.7, 35.6, 139.7, 35.6}, "coordinates": []any{139.7, 35.6}}
	iAPIItemCreate(e, wId0, pid, mId1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{
			"fields": []any{
				map[string]any{"key": "geo", "value": []any{pointWithBBox}},
			},
		}).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object().
		Value("fields").Array().Value(0).Object().
		Value("value").IsEqual([]any{pointWithBBox})

	// invalid geometries are rejected, and the response tells which field failed and why
	tests := []struct {
		value  any
		detail string
	}{
		{value: map[string]any{"type": "Point", "coordinates": []any{35.6, 139.7}}, detail: "latitude must be between -90 and 90; longitude and latitude may be swapped"},
		{value: map[string]any{"type": "Point", "coordinates": []any{139.7, 35.6}, "name": "x"}, detail: "geometry contains an unknown property"},
		{value: map[string]any{"type": "MultiPoint", "coordinates": []any{}}, detail: "a geometry must not be empty"},
		{value: map[string]any{"type": "Point", "bbox": []any{0, 0, 200, 1}, "coordinates": []any{139.7, 35.6}}, detail: "a bbox must have longitudes between -180 and 180, latitudes between -90 and 90, and south and minimum altitude not greater than north and maximum altitude"},
		{value: map[string]any{"type": "GeometryCollection", "geometries": []any{map[string]any{"type": "GeometryCollection", "geometries": []any{}}}}, detail: "a GeometryCollection must not contain another GeometryCollection"},
		{value: map[string]any{"type": "LineString", "coordinates": []any{[]any{139.7, 35.6}}}, detail: "a LineString must have at least 2 positions"},
		{value: `{"type": "Polygon", "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1]]]}`, detail: "the first and last positions of a polygon ring must be equal"},
	}
	for _, tt := range tests {
		iAPIItemCreate(e, wId0, pid, mId1).
			WithHeader("authorization", "Bearer "+secret).
			WithJSON(map[string]any{
				"fields": []any{
					map[string]any{"key": "geo", "value": []any{tt.value}},
				},
			}).
			Expect().
			Status(http.StatusBadRequest).
			JSON().
			IsEqual(map[string]any{
				"error": "field validation failed",
				"details": []any{
					map[string]any{"field": "geo[0]", "code": "INVALID_GEO_STRUCTURE", "detail": tt.detail},
				},
			})
	}

	// imports report invalid geometries the same way
	// GeoJSON imports write one geometry per item, so they use a field that is not multiple
	iAPIFieldCreate(e, wId0, pid, sid1).
		WithHeader("authorization", "Bearer "+secret).
		WithJSON(map[string]any{"key": "location", "type": "geometry", "multiple": false, "required": false}).
		Expect().
		Status(http.StatusOK)

	iAPIModelImport(e, wId0, pid, mId1).
		WithHeader("authorization", "Bearer "+secret).
		WithMultipart().
		WithFile("file", "./test.geojson", strings.NewReader(`{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[35.6,139.7]},"properties":{}}]}`)).
		WithFormField("format", "geoJson").
		WithFormField("strategy", "insert").
		WithFormField("mutateSchema", "false").
		WithFormField("geometryFieldKey", "location").
		Expect().
		Status(http.StatusBadRequest).
		JSON().
		IsEqual(map[string]any{
			"error": "field validation failed",
			"details": []any{
				map[string]any{"field": "location", "code": "INVALID_GEO_STRUCTURE", "detail": "latitude must be between -90 and 90; longitude and latitude may be swapped"},
			},
		})
}
