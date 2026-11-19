package value

// propertyGeometry stores a GeoJSON geometry as a JSON object, exactly like propertyJson,
// except that bbox members are removed: they are optional in GeoJSON (RFC 7946 §5) and can always be computed from the coordinates.
type propertyGeometry struct {
	propertyJson
}

func (p *propertyGeometry) ToValue(i any) (any, bool) {
	v, ok := p.propertyJson.ToValue(i)
	if !ok {
		return nil, false
	}
	// propertyJson always returns a new map, so it can be modified
	removeBBox(v.(Json))
	return v, true
}

func removeBBox(g Json) {
	delete(g, "bbox")
	members, _ := g["geometries"].([]any)
	for _, m := range members {
		if mg, ok := m.(Json); ok {
			removeBBox(mg)
		}
	}
}
