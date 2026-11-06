package value

import (
	"crypto/sha256"
	"encoding/hex"
	"slices"
	"strconv"
	"strings"
)

// GeometryKey returns a key that is the same for two geometries if and only if they are the same value
// under the geometry uniqueness rules:
//   - vertices are equal only when longitude, latitude and altitude (if any) are exactly equal
//   - a LineString is the same in either direction
//   - a polygon ring is the same in either direction and from any starting vertex
//   - polygon holes, multi-part parts and GeometryCollection members may be in any order, duplicates count
//   - different geometry types are never the same
//
// ok is false when g is not a well-formed geometry.
func GeometryKey(g Geometry) (string, bool) {
	c, ok := canonicalGeometry(g)
	if !ok {
		return "", false
	}
	h := sha256.Sum256([]byte(c))
	return hex.EncodeToString(h[:]), true
}

// EquivalenceKeys returns, for value types whose values are compared by something other than plain equality
// when checking uniqueness, one key per value. It returns nil for the other value types.
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

// Equivalent reports whether v and w are the same value when checking uniqueness.
func (v *Value) Equivalent(w *Value) bool {
	if v.Type() == TypeGeometry && w.Type() == TypeGeometry {
		vg, ok1 := v.ValueGeometry()
		wg, ok2 := w.ValueGeometry()
		if ok1 && ok2 {
			vk, ok1 := GeometryKey(vg)
			wk, ok2 := GeometryKey(wg)
			if ok1 && ok2 {
				return vk == wk
			}
		}
	}
	return v.Equal(w)
}

// Equivalent reports whether m and w are the same value when checking uniqueness.
func (m *Multiple) Equivalent(w *Multiple) bool {
	if m == nil && w == nil {
		return true
	}
	if m.IsEmpty() && w.IsEmpty() {
		return true
	}
	if m == nil || w == nil || m.t != w.t || len(m.v) != len(w.v) {
		return false
	}
	for i := range m.v {
		if !m.v[i].Equivalent(w.v[i]) {
			return false
		}
	}
	return true
}

func canonicalGeometry(g Geometry) (string, bool) {
	t, ok := g["type"].(string)
	if !ok {
		return "", false
	}
	switch t {
	case "Point":
		p, ok := toPosition(g["coordinates"])
		if !ok {
			return "", false
		}
		return "Point(" + p + ")", true
	case "LineString":
		l, ok := toPositions(g["coordinates"])
		if !ok {
			return "", false
		}
		return "LineString(" + canonicalLineString(l) + ")", true
	case "Polygon":
		p, ok := toPolygon(g["coordinates"])
		if !ok {
			return "", false
		}
		return "Polygon(" + p + ")", true
	case "MultiPoint":
		parts, ok := mapParts(g["coordinates"], func(c any) (string, bool) {
			p, ok := toPosition(c)
			return "(" + p + ")", ok
		})
		if !ok {
			return "", false
		}
		return "MultiPoint(" + parts + ")", true
	case "MultiLineString":
		parts, ok := mapParts(g["coordinates"], func(c any) (string, bool) {
			l, ok := toPositions(c)
			if !ok {
				return "", false
			}
			return "(" + canonicalLineString(l) + ")", true
		})
		if !ok {
			return "", false
		}
		return "MultiLineString(" + parts + ")", true
	case "MultiPolygon":
		parts, ok := mapParts(g["coordinates"], func(c any) (string, bool) {
			p, ok := toPolygon(c)
			return "(" + p + ")", ok
		})
		if !ok {
			return "", false
		}
		return "MultiPolygon(" + parts + ")", true
	case "GeometryCollection":
		parts, ok := mapParts(g["geometries"], func(c any) (string, bool) {
			m, ok := c.(map[string]any)
			if !ok {
				return "", false
			}
			return canonicalGeometry(m)
		})
		if !ok {
			return "", false
		}
		return "GeometryCollection(" + parts + ")", true
	}
	return "", false
}

// mapParts converts every element of a list and joins them in sorted order, so the order of the parts does not matter
// while duplicated parts are kept.
func mapParts(v any, f func(any) (string, bool)) (string, bool) {
	l, ok := v.([]any)
	if !ok {
		return "", false
	}
	res := make([]string, 0, len(l))
	for _, e := range l {
		s, ok := f(e)
		if !ok {
			return "", false
		}
		res = append(res, s)
	}
	slices.Sort(res)
	return strings.Join(res, ","), true
}

func toPosition(v any) (string, bool) {
	l, ok := v.([]any)
	if !ok || len(l) < 2 {
		return "", false
	}
	res := make([]string, 0, len(l))
	for _, e := range l {
		f, ok := e.(float64)
		if !ok {
			return "", false
		}
		if f == 0 {
			f = 0 // -0 and 0 are the same number
		}
		res = append(res, strconv.FormatFloat(f, 'g', -1, 64))
	}
	return "[" + strings.Join(res, " ") + "]", true
}

func toPositions(v any) ([]string, bool) {
	l, ok := v.([]any)
	if !ok {
		return nil, false
	}
	res := make([]string, 0, len(l))
	for _, e := range l {
		p, ok := toPosition(e)
		if !ok {
			return nil, false
		}
		res = append(res, p)
	}
	return res, true
}

func toPolygon(v any) (string, bool) {
	l, ok := v.([]any)
	if !ok {
		return "", false
	}
	rings := make([]string, 0, len(l))
	for _, r := range l {
		ps, ok := toPositions(r)
		if !ok {
			return "", false
		}
		rings = append(rings, "("+canonicalRing(ps)+")")
	}
	if len(rings) == 0 {
		return "", true
	}
	// the exterior ring stays first, holes may be in any order
	holes := slices.Clone(rings[1:])
	slices.Sort(holes)
	return strings.Join(append([]string{rings[0]}, holes...), ","), true
}

// canonicalLineString returns the smaller of the two directions of the line.
func canonicalLineString(ps []string) string {
	r := slices.Clone(ps)
	slices.Reverse(r)
	if slices.Compare(r, ps) < 0 {
		ps = r
	}
	return strings.Join(ps, ",")
}

// canonicalRing returns the smallest of every rotation of the ring in both directions.
func canonicalRing(ps []string) string {
	// drop the closing position, the ring is then a cycle of vertices
	if len(ps) > 1 && ps[0] == ps[len(ps)-1] {
		ps = ps[:len(ps)-1]
	}
	n := len(ps)
	if n == 0 {
		return ""
	}
	r := slices.Clone(ps)
	slices.Reverse(r)

	best, bestStart := ps, 0
	for _, cand := range [][]string{ps, r} {
		for s := range n {
			if compareRotations(cand, s, best, bestStart) < 0 {
				best, bestStart = cand, s
			}
		}
	}
	res := make([]string, 0, n)
	for i := range n {
		res = append(res, best[(bestStart+i)%n])
	}
	return strings.Join(res, ",")
}

func compareRotations(a []string, as int, b []string, bs int) int {
	n := len(a)
	for i := range n {
		if c := strings.Compare(a[(as+i)%n], b[(bs+i)%n]); c != 0 {
			return c
		}
	}
	return 0
}
