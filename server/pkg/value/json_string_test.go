package value

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_propertyJsonString_ToValue(t *testing.T) {
	validJsonObj := `{"key":"value"}`
	validJsonArr := `["item1","item2"]`
	invalidJson := `{invalid json}`

	tests := []struct {
		name string
		args any
		want any
		ok   bool
	}{
		{
			name: "valid json object string",
			args: validJsonObj,
			want: validJsonObj,
			ok:   true,
		},
		{
			name: "valid json array string",
			args: validJsonArr,
			want: validJsonArr,
			ok:   true,
		},
		{
			name: "pointer to valid json string",
			args: new(validJsonObj),
			want: validJsonObj,
			ok:   true,
		},
		{
			name: "invalid json string",
			args: invalidJson,
			want: nil,
			ok:   false,
		},
		{
			name: "pointer to invalid json string",
			args: new(invalidJson),
			want: nil,
			ok:   false,
		},
		{
			name: "empty string",
			args: "",
			want: nil,
			ok:   false,
		},
		{
			name: "map object",
			args: map[string]any{"key": "value"},
			want: `{"key":"value"}`,
			ok:   true,
		},
		{
			name: "slice array",
			args: []string{"item1", "item2"},
			want: `["item1","item2"]`,
			ok:   true,
		},
		{
			name: "nil pointer",
			args: (*string)(nil),
			want: nil,
			ok:   false,
		},
		{
			name: "nil value",
			args: nil,
			want: nil,
			ok:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			p := &propertyJsonString{}
			got, ok := p.ToValue(tt.args)
			assert.Equal(t, tt.want, got)
			assert.Equal(t, tt.ok, ok)
		})
	}
}

func Test_propertyJsonString_ToInterface(t *testing.T) {
	v := `{"key":"value"}`
	tt, ok := (&propertyJsonString{}).ToInterface(v)
	assert.Equal(t, v, tt)
	assert.Equal(t, true, ok)
}

func Test_propertyJsonString_IsEmpty(t *testing.T) {
	assert.True(t, (&propertyJsonString{}).IsEmpty(JsonString("")))
	assert.False(t, (&propertyJsonString{}).IsEmpty(JsonString(`{"key":"value"}`)))
}

func Test_propertyJsonString_Validate(t *testing.T) {
	v := `{"key":"value"}`
	assert.True(t, (&propertyJsonString{}).Validate(v))
	assert.False(t, (&propertyJsonString{}).Validate(123))
}

func Test_propertyJsonString_Equal(t *testing.T) {
	pj := &propertyJsonString{}
	j1 := JsonString(`{"key":"value"}`)
	j2 := JsonString(`{"key":"value"}`)
	j3 := JsonString(`{"key":"different"}`)
	assert.True(t, pj.Equal(j1, j2))
	assert.True(t, pj.Equal(nil, nil))
	assert.False(t, pj.Equal(nil, j1))
	assert.False(t, pj.Equal(j1, nil))
	assert.False(t, pj.Equal(j1, j3))
}

func TestValue_ValueJsonString(t *testing.T) {
	var v *Value
	got, ok := v.ValueJsonString()
	var expected JsonString
	assert.Equal(t, expected, got)
	assert.Equal(t, false, ok)

	v = &Value{
		v: 0,
	}
	got, ok = v.ValueJsonString()
	assert.Equal(t, expected, got)
	assert.Equal(t, false, ok)

	jsonStr := JsonString(`{"key":"value"}`)
	v = &Value{
		v: jsonStr,
	}
	got, ok = v.ValueJsonString()
	assert.Equal(t, jsonStr, got)
	assert.Equal(t, true, ok)
}

func TestMultiple_ValuesJsonString(t *testing.T) {
	var m *Multiple
	got, ok := m.ValuesJsonString()
	var expected []JsonString
	assert.False(t, ok)
	assert.Equal(t, expected, got)

	j1 := JsonString(`{"key1":"value1"}`)
	j2 := JsonString(`{"key2":"value2"}`)
	j3 := JsonString(`{"key3":"value3"}`)
	m = NewMultiple(TypeGeometryObject, []any{j1, j2, j3})
	expected = []JsonString{j1, j2, j3}
	got, ok = m.ValuesJsonString()
	assert.True(t, ok)
	assert.Equal(t, expected, got)
}
