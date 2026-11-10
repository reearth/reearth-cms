package value

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"slices"
	"strconv"
	"strings"

	geojson "github.com/paulmach/go.geojson"
)

// GeometryKey returns a key that is the same for two geometries when they are the same shape:
//   - positions are equal only when all their numbers are exactly equal, so [1,2] and [1,2,0] are different
//   - a LineString is the same in either direction
//   - a polygon ring is the same in either direction and from any starting position
//   - holes, the parts of multi geometries and the members of a GeometryCollection may be in any order
//   - different geometry types are never the same
//
// ok is false when g cannot be read as a geometry. GeometryKey does not validate g; schema.FieldGeometry does that before values are saved.
func GeometryKey(g Geometry) (string, bool) {
	b, err := json.Marshal(g)
	if err != nil {
		return "", false
	}
	gg, err := geojson.UnmarshalGeometry(b)
	if err != nil {
		return "", false
	}
	h := sha256.Sum256([]byte(geometryKey(gg)))
	return hex.EncodeToString(h[:]), true
}

// EquivalenceKeys returns one key per value for value types that are not compared with Equal when checking uniqueness.
// It returns nil for the other value types.
func (m *Multiple) EquivalenceKeys() []string {
	if m == nil || m.t != TypeGeometry {
		return nil
	}
	keys := make([]string, 0, len(m.v))
	for _, v := range m.v {
		g, ok := v.ValueGeometry()
		if !ok {
			return nil
		}
		k, ok := GeometryKey(g)
		if !ok {
			return nil
		}
		keys = append(keys, k)
	}
	return keys
}

// Equivalent reports whether m and w are the same value when checking uniqueness.
func (m *Multiple) Equivalent(w *Multiple) bool {
	if mk, wk := m.EquivalenceKeys(), w.EquivalenceKeys(); mk != nil && wk != nil {
		return slices.Equal(mk, wk)
	}
	return m.Equal(w)
}

// geometryKey writes g in a canonical text form, e.g. "LineString(([1 2],[3 4]))".
func geometryKey(g *geojson.Geometry) string {
	var k string
	switch g.Type {
	case geojson.GeometryPoint:
		k = positionKey(g.Point)
	case geojson.GeometryMultiPoint:
		k = sortedKeys(g.MultiPoint, positionKey)
	case geojson.GeometryLineString:
		k = lineStringKey(g.LineString)
	case geojson.GeometryMultiLineString:
		k = sortedKeys(g.MultiLineString, lineStringKey)
	case geojson.GeometryPolygon:
		k = polygonKey(g.Polygon)
	case geojson.GeometryMultiPolygon:
		k = sortedKeys(g.MultiPolygon, polygonKey)
	case geojson.GeometryCollection:
		k = sortedKeys(g.Geometries, geometryKey)
	}
	return string(g.Type) + "(" + k + ")"
}

func positionKey(p []float64) string {
	nums := make([]string, 0, len(p))
	for _, n := range p {
		if n == 0 {
			n = 0 // -0 and 0 are the same number
		}
		nums = append(nums, strconv.FormatFloat(n, 'g', -1, 64))
	}
	return "[" + strings.Join(nums, " ") + "]"
}

// lineStringKey uses whichever direction of the line comes first.
func lineStringKey(l [][]float64) string {
	ps := positionKeys(l)
	r := slices.Clone(ps)
	slices.Reverse(r)
	if slices.Compare(r, ps) < 0 {
		ps = r
	}
	return "(" + strings.Join(ps, ",") + ")"
}

// polygonKey keeps the exterior ring first and sorts the holes.
func polygonKey(rings [][][]float64) string {
	if len(rings) == 0 {
		return "()"
	}
	keys := []string{ringKey(rings[0])}
	if len(rings) > 1 {
		keys = append(keys, sortedKeys(rings[1:], ringKey))
	}
	return "(" + strings.Join(keys, ",") + ")"
}

// ringKey uses whichever rotation of the ring, in either direction, comes first.
func ringKey(r [][]float64) string {
	// drop the closing position, so the ring is a cycle of positions
	ps := positionKeys(r[:max(len(r)-1, 0)])
	rev := slices.Clone(ps)
	slices.Reverse(rev)

	best := slices.Clone(ps)
	rotated := make([]string, len(ps))
	for _, dir := range [][]string{ps, rev} {
		for start := range dir {
			copy(rotated, dir[start:])
			copy(rotated[len(dir)-start:], dir[:start])
			if slices.Compare(rotated, best) < 0 {
				copy(best, rotated)
			}
		}
	}
	return "(" + strings.Join(best, ",") + ")"
}

func positionKeys(l [][]float64) []string {
	keys := make([]string, 0, len(l))
	for _, p := range l {
		keys = append(keys, positionKey(p))
	}
	return keys
}

// sortedKeys joins the keys of the parts in sorted order, so the order of the parts does not matter but duplicates still count.
func sortedKeys[T any](parts []T, key func(T) string) string {
	keys := make([]string, 0, len(parts))
	for _, p := range parts {
		keys = append(keys, key(p))
	}
	slices.Sort(keys)
	return strings.Join(keys, ",")
}
