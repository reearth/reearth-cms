package value

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_propertyLineString_ToValue(t *testing.T) {
	tests := []struct {
		name  string
		arg   any
		want1 any
		want2 bool
	}{
		{
			name:  "nil",
			arg:   nil,
			want1: nil,
			want2: true,
		},
		{
			name:  "string",
			arg:   [][]string{{"1.1", "2.1", "3.1"}, {"1.1", "2.1", "3.1"}},
			want1: [][]float64{{1.1, 2.1, 3.1}, {1.1, 2.1, 3.1}},
			want2: true,
		},
		{
			name:  "json.Number",
			arg:   [][]json.Number{{"1.1", "2.1", "3.1"}, {"1.1", "2.1", "3.1"}},
			want1: [][]float64{{1.1, 2.1, 3.1}, {1.1, 2.1, 3.1}},
			want2: true,
		},
		{
			name:  "float64",
			arg:   [][]float64{{1.1, 2.1, 3.1}, {1.1, 2.1, 3.1}},
			want1: [][]float64{{1.1, 2.1, 3.1}, {1.1, 2.1, 3.1}},
			want2: true,
		},
		{
			name:  "float32",
			arg:   [][]float32{{1.1234567, 2.1234567, 3.1234567}, {1.1234567, 2.1234567, 3.1234567}},
			want1: [][]float64{{1.1234567, 2.1234567, 3.1234567}, {1.1234567, 2.1234567, 3.1234567}},
			want2: true,
		},
		{
			name:  "int",
			arg:   [][]int{{1, 2, 3}, {1, 2, 3}},
			want1: [][]float64{{1.0, 2.0, 3.0}, {1.0, 2.0, 3.0}},
			want2: true,
		},
		{
			name:  "int8",
			arg:   [][]int8{{1, 2, 3}, {1, 2, 3}},
			want1: [][]float64{{1.0, 2.0, 3.0}, {1.0, 2.0, 3.0}},
			want2: true,
		},
		{
			name:  "int16",
			arg:   [][]int16{{1, 2, 3}, {1, 2, 3}},
			want1: [][]float64{{1.0, 2.0, 3.0}, {1.0, 2.0, 3.0}},
			want2: true,
		},
		{
			name:  "int32",
			arg:   [][]int32{{1, 2, 3}, {1, 2, 3}},
			want1: [][]float64{{1.0, 2.0, 3.0}, {1.0, 2.0, 3.0}},
			want2: true,
		},
		{
			name:  "int64",
			arg:   [][]int64{{1, 2, 3}, {1, 2, 3}},
			want1: [][]float64{{1.0, 2.0, 3.0}, {1.0, 2.0, 3.0}},
			want2: true,
		},
		{
			name:  "uint",
			arg:   [][]uint{{1, 2, 3}, {1, 2, 3}},
			want1: [][]float64{{1.0, 2.0, 3.0}, {1.0, 2.0, 3.0}},
			want2: true,
		},
		{
			name:  "uint8",
			arg:   [][]uint8{{1, 2, 3}, {1, 2, 3}},
			want1: [][]float64{{1.0, 2.0, 3.0}, {1.0, 2.0, 3.0}},
			want2: true,
		},
		{
			name:  "uint16",
			arg:   [][]uint16{{1, 2, 3}, {1, 2, 3}},
			want1: [][]float64{{1.0, 2.0, 3.0}, {1.0, 2.0, 3.0}},
			want2: true,
		},
		{
			name:  "uint32",
			arg:   [][]uint32{{1, 2, 3}, {1, 2, 3}},
			want1: [][]float64{{1.0, 2.0, 3.0}, {1.0, 2.0, 3.0}},
			want2: true,
		},
		{
			name:  "uint64",
			arg:   [][]uint64{{1, 2, 3}, {1, 2, 3}},
			want1: [][]float64{{1.0, 2.0, 3.0}, {1.0, 2.0, 3.0}},
			want2: true,
		},
		{
			name:  "uintptr",
			arg:   [][]uintptr{{1, 2, 3}, {1, 2, 3}},
			want1: [][]float64{{1.0, 2.0, 3.0}, {1.0, 2.0, 3.0}},
			want2: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			p := &propertyLineString{}
			got1, got2 := p.ToValue(tt.arg)
			assert.Equal(t, tt.want1, got1)
			assert.Equal(t, tt.want2, got2)
		})
	}
}

func Test_propertyLineString_ToInterface(t *testing.T) {
	v := [][]float64{{1.1, 2.1, 3.1}, {1.1, 2.1, 3.1}}
	tt, ok := (&propertyLineString{}).ToInterface(v)
	assert.Equal(t, v, tt)
	assert.Equal(t, true, ok)
}

func Test_propertyLineString_IsEmpty(t *testing.T) {
	assert.True(t, (&propertyLineString{}).IsEmpty([][]float64{}))
	assert.False(t, (&propertyLineString{}).IsEmpty([][]float64{{1.1, 2.1, 3.1}, {1.1, 2.1, 3.1}}))
}

func Test_propertyLineString_Validate(t *testing.T) {
	assert.True(t, (&propertyLineString{}).Validate([][]float64{{1.1, 2.1, 3.1}, {1.1, 2.1, 3.1}}))
	assert.False(t, (&propertyLineString{}).Validate([][]float64{{1.1}}))
	assert.False(t, (&propertyLineString{}).Validate([][]int{{1, 2, 3}}))
	assert.False(t, (&propertyLineString{}).Validate([][]string{{"1", "2", "3"}}))
	assert.False(t, (&propertyLineString{}).Validate(1))
}

func Test_propertyLineString_Equal(t *testing.T) {
	ps := &propertyLineString{}
	assert.True(t, ps.Equal(LineString{{1.1, 2.1, 3.1}, {1.1, 2.1, 3.1}}, LineString{{1.1, 2.1, 3.1}, {1.1, 2.1, 3.1}}))
	ps1 := &propertyLineString{}
	assert.False(t, ps1.Equal(LineString{{1.1, 2.1, 3.1}, {1.1, 2.1, 3.1}}, LineString{{1.1, 2.1}, {1.1, 2.1}}))
}

func TestValue_ValueLineString(t *testing.T) {
	var v *Value
	got, ok := v.ValueLineString()
	assert.Equal(t, [][]float64(nil), got)
	assert.Equal(t, false, ok)

	v = &Value{
		v: [][]float64{{1.1, 2.1, 3.1}, {1.1, 2.1, 3.1}},
	}
	got, ok = v.ValueLineString()
	assert.Equal(t, [][]float64{{1.1, 2.1, 3.1}, {1.1, 2.1, 3.1}}, got)
	assert.Equal(t, true, ok)
}

func TestMultiple_ValuesLineString(t *testing.T) {
	var m *Multiple
	got, ok := m.ValuesLineString()
	var expected []LineString
	assert.Equal(t, expected, got)
	assert.False(t, ok)

	m = NewMultiple(TypeLineString, []any{LineString{{1.1, 2.1, 3.1}, {1.1, 2.1, 3.1}}, LineString{{1.1, 2.1, 3.1}, {1.1, 2.1, 3.1}}, LineString{{1.1, 2.1, 3.1}, {1.1, 2.1, 3.1}}})
	expected = []LineString{{{1.1, 2.1, 3.1}, {1.1, 2.1, 3.1}}, {{1.1, 2.1, 3.1}, {1.1, 2.1, 3.1}}, {{1.1, 2.1, 3.1}, {1.1, 2.1, 3.1}}}
	got, ok = m.ValuesLineString()
	assert.Equal(t, expected, got)
	assert.True(t, ok)
}
