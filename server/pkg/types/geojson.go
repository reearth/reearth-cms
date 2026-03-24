package types

import (
	"encoding/json"

	"github.com/iancoleman/orderedmap"
)

type GeoJSON = FeatureCollection

type FeatureCollection struct {
	Features *[]Feature             `json:"features,omitempty"`
	Type     *FeatureCollectionType `json:"type,omitempty"`
}

type FeatureCollectionType string

const FeatureCollectionTypeFeatureCollection FeatureCollectionType = "FeatureCollection"

type FeatureType string

const FeatureTypeFeature FeatureType = "Feature"

type Feature struct {
	Geometry   *Geometry              `json:"geometry,omitempty"`
	Id         *string                `json:"id,omitempty"`
	Properties *orderedmap.OrderedMap `json:"properties,omitempty"`
	Type       *FeatureType           `json:"type,omitempty"`
}

type GeometryCollectionType string

const GeometryCollectionTypeGeometryCollection GeometryCollectionType = "GeometryCollection"

type GeometryCollection struct {
	Geometries *[]Geometry             `json:"geometries,omitempty"`
	Type       *GeometryCollectionType `json:"type,omitempty"`
}

type GeometryType string

const (
	GeometryTypeGeometryCollection GeometryType = "GeometryCollection"
	GeometryTypeLineString         GeometryType = "LineString"
	GeometryTypeMultiLineString    GeometryType = "MultiLineString"
	GeometryTypeMultiPoint         GeometryType = "MultiPoint"
	GeometryTypeMultiPolygon       GeometryType = "MultiPolygon"
	GeometryTypePoint              GeometryType = "Point"
	GeometryTypePolygon            GeometryType = "Polygon"
)

type Geometry struct {
	Coordinates *GeometryCoordinates `json:"coordinates,omitempty"`
	Geometries  *[]Geometry          `json:"geometries,omitempty"`
	Type        *GeometryType        `json:"type,omitempty"`
}

type GeometryCoordinates json.RawMessage

type LineString = []Point
type MultiLineString = []LineString
type MultiPoint = []Point
type MultiPolygon = []Polygon
type Point = []float64
type Polygon = [][]Point

func (t GeometryCoordinates) AsPoint() (Point, error) {
	var body Point
	err := json.Unmarshal(t, &body)
	return body, err
}

func (t GeometryCoordinates) AsMultiPoint() (MultiPoint, error) {
	var body MultiPoint
	err := json.Unmarshal(t, &body)
	return body, err
}

func (t GeometryCoordinates) AsLineString() (LineString, error) {
	var body LineString
	err := json.Unmarshal(t, &body)
	return body, err
}

func (t GeometryCoordinates) AsMultiLineString() (MultiLineString, error) {
	var body MultiLineString
	err := json.Unmarshal(t, &body)
	return body, err
}

func (t GeometryCoordinates) AsPolygon() (Polygon, error) {
	var body Polygon
	err := json.Unmarshal(t, &body)
	return body, err
}

func (t GeometryCoordinates) AsMultiPolygon() (MultiPolygon, error) {
	var body MultiPolygon
	err := json.Unmarshal(t, &body)
	return body, err
}

func (t GeometryCoordinates) MarshalJSON() ([]byte, error) {
	if t == nil {
		return []byte("null"), nil
	}
	return json.RawMessage(t).MarshalJSON()
}

func (t *GeometryCoordinates) UnmarshalJSON(b []byte) error {
	if t == nil {
		return nil
	}
	*t = GeometryCoordinates(json.RawMessage(append([]byte(nil), b...)))
	return nil
}
