package value

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_propertyGeometry_ToValue(t *testing.T) {
	t.Parallel()

	point := Geometry{"type": "Point", "coordinates": []any{139.7, 35.6}}
	pointStr := `{"type":"Point","coordinates":[139.7,35.6]}`

	tests := []struct {
		name string
		args any
		want any
		ok   bool
	}{
		{name: "json string", args: pointStr, want: point, ok: true},
		{name: "formatted json string", args: "{\n \"coordinates\": [139.70, 35.60],\n \"type\": \"Point\"\n}", want: point, ok: true},
		{name: "pointer to json string", args: new(pointStr), want: point, ok: true},
		{name: "bytes", args: []byte(pointStr), want: point, ok: true},
		{name: "raw message", args: json.RawMessage(pointStr), want: point, ok: true},
		{name: "map", args: map[string]any{"type": "Point", "coordinates": []any{139.7, 35.6}}, want: point, ok: true},
		{name: "map with integers", args: map[string]any{"type": "Point", "coordinates": []int{1, 2}}, want: Geometry{"type": "Point", "coordinates": []any{1.0, 2.0}}, ok: true},
		{name: "struct", args: struct {
			Type        string    `json:"type"`
			Coordinates []float64 `json:"coordinates"`
		}{Type: "Point", Coordinates: []float64{139.7, 35.6}}, want: point, ok: true},
		{name: "nil", args: nil, want: nil, ok: false},
		{name: "nil string pointer", args: (*string)(nil), want: nil, ok: false},
		{name: "empty string", args: "", want: nil, ok: false},
		{name: "blank string", args: "  ", want: nil, ok: false},
		{name: "invalid json", args: "{invalid", want: nil, ok: false},
		{name: "json array", args: "[1,2]", want: nil, ok: false},
		{name: "json null", args: "null", want: nil, ok: false},
		{name: "number", args: 1.0, want: nil, ok: false},
		{name: "unsupported value", args: make(chan int), want: nil, ok: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, ok := (&propertyGeometry{}).ToValue(tt.args)
			assert.Equal(t, tt.ok, ok)
			assert.Equal(t, tt.want, got)
		})
	}
}

func Test_propertyGeometry(t *testing.T) {
	t.Parallel()

	p := &propertyGeometry{}
	a := Geometry{"type": "Point", "coordinates": []any{1.0, 2.0}}
	b := Geometry{"coordinates": []any{1.0, 2.0}, "type": "Point"}
	c := Geometry{"type": "Point", "coordinates": []any{1.0, 3.0}}

	assert.True(t, p.Equal(a, b))
	assert.False(t, p.Equal(a, c))
	assert.False(t, p.Equal(a, nil))
	assert.True(t, p.Equal(nil, nil))
	assert.True(t, p.Validate(a))
	assert.False(t, p.Validate("{}"))
	assert.True(t, p.IsEmpty(Geometry{}))
	assert.False(t, p.IsEmpty(a))
	got, ok := p.ToInterface(a)
	assert.True(t, ok)
	assert.Equal(t, a, got)
}

func TestValue_ValueGeometry(t *testing.T) {
	t.Parallel()

	v := TypeGeometry.Value(`{"type":"Point","coordinates":[1,2]}`)
	g, ok := v.ValueGeometry()
	assert.True(t, ok)
	assert.Equal(t, Geometry{"type": "Point", "coordinates": []any{1.0, 2.0}}, g)
	assert.Equal(t, g, v.Interface())

	// cloned values are deep copies
	c := v.Clone()
	cg, _ := c.ValueGeometry()
	cg["coordinates"].([]any)[0] = 5.0
	assert.Equal(t, 1.0, g["coordinates"].([]any)[0])

	_, ok = TypeText.Value("a").ValueGeometry()
	assert.False(t, ok)
	_, ok = (*Value)(nil).ValueGeometry()
	assert.False(t, ok)
}

func TestMultiple_ValuesGeometry(t *testing.T) {
	t.Parallel()

	m := NewMultiple(TypeGeometry, []any{`{"type":"Point","coordinates":[1,2]}`, `{"type":"Point","coordinates":[3,4]}`})
	got, ok := m.ValuesGeometry()
	assert.True(t, ok)
	assert.Equal(t, []Geometry{
		{"type": "Point", "coordinates": []any{1.0, 2.0}},
		{"type": "Point", "coordinates": []any{3.0, 4.0}},
	}, got)

	_, ok = NewMultiple(TypeText, []any{"a"}).ValuesGeometry()
	assert.False(t, ok)
	_, ok = (*Multiple)(nil).ValuesGeometry()
	assert.False(t, ok)
}

func TestValue_MatchGeometry(t *testing.T) {
	t.Parallel()

	var got Geometry
	TypeGeometry.Value(`{"type":"Point","coordinates":[1,2]}`).Match(Match{
		Geometry: func(g Geometry) { got = g },
	})
	assert.Equal(t, Geometry{"type": "Point", "coordinates": []any{1.0, 2.0}}, got)
}
