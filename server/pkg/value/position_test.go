package value

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_propertyPosition_ToValue(t *testing.T) {
	tests := []struct {
		name  string
		args  []any
		want1 any
		want2 bool
	}{
		{
			name:  "string",
			args:  []any{[]float64{1, 2}, []float64{1, 2}},
			want1: []float64{1, 2},
			want2: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			p := &propertyPosition{}
			for i, v := range tt.args {
				got1, got2 := p.ToValue(v)
				assert.Equal(t, tt.want1, got1, "test %d", i)
				assert.Equal(t, tt.want2, got2, "test %d", i)
			}
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
	assert.False(t, (&propertyPosition{}).Validate([]int{1,2,3}))
	assert.False(t, (&propertyPosition{}).Validate([]string{"1","2","3"}))
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
