package value

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_propertyPosition_ToValue(t *testing.T) {
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
			arg:   []string{"1", "2"},
			want1: []float64{1, 2},
			want2: true,
		},
		{
			name:  "json.Number",
			arg:   []json.Number{"1", "2"},
			want1: []float64{1, 2},
			want2: true,
		},
		{
			name:  "float64",
			arg:   []float64{1, 2},
			want1: []float64{1, 2},
			want2: true,
		},
		{
			name:  "float32",
			arg:   []float32{1, 2},
			want1: []float64{1, 2},
			want2: true,
		},
		{
			name:  "int",
			arg:   []int{1, 2},
			want1: []float64{1, 2},
			want2: true,
		},
		{
			name:  "int8",
			arg:   []int8{1, 2},
			want1: []float64{1, 2},
			want2: true,
		},
		{
			name:  "int16",
			arg:   []int16{1, 2},
			want1: []float64{1, 2},
			want2: true,
		},
		{
			name:  "int32",
			arg:   []int32{1, 2},
			want1: []float64{1, 2},
			want2: true,
		},
		{
			name:  "int64",
			arg:   []int64{1, 2},
			want1: []float64{1, 2},
			want2: true,
		},
		{
			name:  "uint",
			arg:   []uint{1, 2},
			want1: []float64{1, 2},
			want2: true,
		},
		{
			name:  "uint8",
			arg:   []uint8{1, 2},
			want1: []float64{1, 2},
			want2: true,
		},
		{
			name:  "uint16",
			arg:   []uint16{1, 2},
			want1: []float64{1, 2},
			want2: true,
		},
		{
			name:  "uint32",
			arg:   []uint32{1, 2},
			want1: []float64{1, 2},
			want2: true,
		},
		{
			name:  "uint64",
			arg:   []uint64{1, 2},
			want1: []float64{1, 2},
			want2: true,
		},
		{
			name:  "uintptr",
			arg:   []uintptr{1, 2},
			want1: []float64{1, 2},
			want2: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			p := &propertyPosition{}
			got1, got2 := p.ToValue(tt.arg)
			assert.Equal(t, tt.want1, got1)
			assert.Equal(t, tt.want2, got2)
		})
	}
}

func Test_propertyPosition_ToInterface(t *testing.T) {
	v := []float64{1, 2, 3}
	tt, ok := (&propertyPosition{}).ToInterface(v)
	assert.Equal(t, v, tt)
	assert.Equal(t, true, ok)
}

func Test_propertyPosition_IsEmpty(t *testing.T) {
	assert.True(t, (&propertyPosition{}).IsEmpty([]float64{}))
	assert.False(t, (&propertyPosition{}).IsEmpty([]float64{1, 2, 3}))
}

func Test_propertyPosition_Validate(t *testing.T) {
	assert.True(t, (&propertyPosition{}).Validate([]float64{1, 2, 3}))
	assert.False(t, (&propertyPosition{}).Validate([]float64{1}))
	assert.False(t, (&propertyPosition{}).Validate([]int{1, 2, 3}))
	assert.False(t, (&propertyPosition{}).Validate([]string{"1", "2", "3"}))
	assert.False(t, (&propertyPosition{}).Validate(1))
}

func TestValue_ValuePosition(t *testing.T) {
	var v *Value
	got, ok := v.ValuePosition()
	assert.Equal(t, []float64(nil), got)
	assert.Equal(t, false, ok)

	v = &Value{
		v: []float64{1, 2, 3},
	}
	got, ok = v.ValuePosition()
	assert.Equal(t, []float64{1, 2, 3}, got)
	assert.Equal(t, true, ok)
}

func TestMultiple_ValuesPosition(t *testing.T) {
	var m *Multiple
	got, ok := m.ValuesPosition()
	var expected []Position
	assert.Equal(t, expected, got)
	assert.False(t, ok)

	// m = NewMultiple(TypeText, []any{[]float64{1, 2, 3}, []float64{1, 2, 3}, []float64{1, 2, 3}})
	// expected = []Position{[]float64{1, 2, 3}, []float64{1, 2, 3}, []float64{1, 2, 3}}
	// got, ok = m.ValuesPosition()
	// assert.Equal(t, expected, got)
	// assert.True(t, ok)
}
