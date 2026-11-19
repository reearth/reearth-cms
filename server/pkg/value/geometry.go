package value

// propertyGeometry stores a GeoJSON geometry as a JSON object, exactly like propertyJson,
// except that every member other than "type" and "coordinates" (or "geometries" for a GeometryCollection) is removed.
// These are bbox, which is optional in GeoJSON (RFC 7946 §5) and can always be computed from the coordinates,
// and foreign members (RFC 7946 §6.1), which the Geometry field does not store.
type propertyGeometry struct {
	propertyJson
}

func (p *propertyGeometry) ToValue(i any) (any, bool) {
	v, ok := p.propertyJson.ToValue(i)
	if !ok {
		return nil, false
	}
	// propertyJson always returns a new map, so it can be modified
	removeNonStandardMembers(v.(Json))
	return v, true
}

// removeNonStandardMembers removes the members that the geometry type does not define.
// A geometry with an unknown type is kept as it is, so that its validation reports the type.
func removeNonStandardMembers(g Json) {
	t, _ := g["type"].(string)
	member := "coordinates"
	switch t {
	case "Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon":
	case "GeometryCollection":
		member = "geometries"
	default:
		return
	}

	for k := range g {
		if k != "type" && k != member {
			delete(g, k)
		}
	}

	members, _ := g["geometries"].([]any)
	for _, m := range members {
		if mg, ok := m.(Json); ok {
			removeNonStandardMembers(mg)
		}
	}
}
