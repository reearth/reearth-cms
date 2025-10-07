package types

import (
	"encoding/json"
	"reflect"
	"testing"

	"github.com/iancoleman/orderedmap"
	"github.com/samber/lo"
)

func TestGeometryCoordinates_AsPoint(t *testing.T) {
	data := []byte(`[1.0, 2.0]`)
	var gc GeometryCoordinates = data
	p, err := gc.AsPoint()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !reflect.DeepEqual(p, Point{1.0, 2.0}) {
		t.Errorf("expected %v, got %v", Point{1.0, 2.0}, p)
	}
}

func TestGeometryCoordinates_AsMultiPoint(t *testing.T) {
	data := []byte(`[[1.0,2.0],[3.0,4.0]]`)
	var gc GeometryCoordinates = data
	mp, err := gc.AsMultiPoint()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !reflect.DeepEqual(mp, MultiPoint{{1.0, 2.0}, {3.0, 4.0}}) {
		t.Errorf("expected %v, got %v", MultiPoint{{1.0, 2.0}, {3.0, 4.0}}, mp)
	}
}

func TestGeometryCoordinates_AsLineString(t *testing.T) {
	data := []byte(`[[1.0,2.0],[3.0,4.0]]`)
	var gc GeometryCoordinates = data
	ls, err := gc.AsLineString()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !reflect.DeepEqual(ls, LineString{{1.0, 2.0}, {3.0, 4.0}}) {
		t.Errorf("expected %v, got %v", LineString{{1.0, 2.0}, {3.0, 4.0}}, ls)
	}
}

func TestGeometryCoordinates_AsMultiLineString(t *testing.T) {
	data := []byte(`[[[1.0,2.0],[3.0,4.0]],[[5.0,6.0],[7.0,8.0]]]`)
	var gc GeometryCoordinates = data
	mls, err := gc.AsMultiLineString()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !reflect.DeepEqual(mls, MultiLineString{{{1.0, 2.0}, {3.0, 4.0}}, {{5.0, 6.0}, {7.0, 8.0}}}) {
		t.Errorf("expected %v, got %v", MultiLineString{{{1.0, 2.0}, {3.0, 4.0}}, {{5.0, 6.0}, {7.0, 8.0}}}, mls)
	}
}

func TestGeometryCoordinates_AsPolygon(t *testing.T) {
	data := []byte(`[[[1.0,2.0],[3.0,4.0],[5.0,6.0],[1.0,2.0]]]`)
	var gc GeometryCoordinates = data
	poly, err := gc.AsPolygon()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expected := Polygon{{{1.0, 2.0}, {3.0, 4.0}, {5.0, 6.0}, {1.0, 2.0}}}
	if !reflect.DeepEqual(poly, expected) {
		t.Errorf("expected %v, got %v", expected, poly)
	}
}

func TestGeometryCoordinates_AsMultiPolygon(t *testing.T) {
	data := []byte(`[[[[1.0,2.0],[3.0,4.0],[5.0,6.0],[1.0,2.0]]],[[[7.0,8.0],[9.0,10.0],[11.0,12.0],[7.0,8.0]]]]`)
	var gc GeometryCoordinates = data
	mp, err := gc.AsMultiPolygon()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expected := MultiPolygon{
		{{{1.0, 2.0}, {3.0, 4.0}, {5.0, 6.0}, {1.0, 2.0}}},
		{{{7.0, 8.0}, {9.0, 10.0}, {11.0, 12.0}, {7.0, 8.0}}},
	}
	if !reflect.DeepEqual(mp, expected) {
		t.Errorf("expected %v, got %v", expected, mp)
	}
}

func TestGeometryCoordinates_MarshalUnmarshalJSON(t *testing.T) {
	coords := GeometryCoordinates([]byte(`[1.0,2.0]`))
	b, err := json.Marshal(coords)
	if err != nil {
		t.Fatalf("marshal error: %v", err)
	}
	var coords2 GeometryCoordinates
	err = json.Unmarshal(b, &coords2)
	if err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}
	p, err := coords2.AsPoint()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !reflect.DeepEqual(p, Point{1.0, 2.0}) {
		t.Errorf("expected %v, got %v", Point{1.0, 2.0}, p)
	}
}

func TestFeatureCollection_MarshalUnmarshalJSON(t *testing.T) {
	id := "feature1"
	ftype := FeatureTypeFeature
	gtype := GeometryTypePoint
	props := orderedmap.New()
	props.Set("foo", "bar")
	feature := Feature{
		Id:   &id,
		Type: &ftype,
		Geometry: &Geometry{
			Type:        &gtype,
			Coordinates: lo.ToPtr(GeometryCoordinates([]byte(`[1.0,2.0]`))),
		},
		Properties: props,
	}
	ftypecol := FeatureCollectionTypeFeatureCollection
	fc := FeatureCollection{
		Type:     &ftypecol,
		Features: &[]Feature{feature},
	}
	b, err := json.Marshal(fc)
	if err != nil {
		t.Fatalf("marshal error: %v", err)
	}
	var fc2 FeatureCollection
	err = json.Unmarshal(b, &fc2)
	if err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}
	if fc2.Type == nil || *fc2.Type != FeatureCollectionTypeFeatureCollection {
		t.Errorf("expected type %v, got %v", FeatureCollectionTypeFeatureCollection, fc2.Type)
	}
	if fc2.Features == nil || len(*fc2.Features) != 1 {
		t.Fatalf("expected 1 feature, got %v", fc2.Features)
	}
	f := (*fc2.Features)[0]
	if f.Id == nil || *f.Id != id {
		t.Errorf("expected id %v, got %v", id, f.Id)
	}
	if f.Type == nil || *f.Type != FeatureTypeFeature {
		t.Errorf("expected type %v, got %v", FeatureTypeFeature, f.Type)
	}
	if f.Geometry == nil || f.Geometry.Type == nil || *f.Geometry.Type != GeometryTypePoint {
		t.Errorf("expected geometry type %v, got %v", GeometryTypePoint, f.Geometry)
	}
	if f.Properties == nil || len(f.Properties.Keys()) != 1 {
		t.Errorf("expected properties length 1, got %v", f.Properties)
	}
	val, _ := f.Properties.Get("foo")
	if val != "bar" {
		t.Errorf("expected property 'foo' to be 'bar', got %v", val)
	}
}
