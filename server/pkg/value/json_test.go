package value

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func Test_propertyJson_ToValue(t *testing.T) {
	validJsonObj := `{"key":"value"}`
	validJsonArr := `["item1","item2"]`
	invalidJson := `{invalid json}`

	tests := []struct {
		name  string
		args  any
		want any
		ok   bool
	}{
		{
			name:  "valid json object string",
			args:  validJsonObj,
			want: validJsonObj,
			ok: true,
		},
		{
			name:  "valid json array string",
			args:  validJsonArr,
			want: validJsonArr,
			ok: true,
		},
		{
			name:  "pointer to valid json string",
			args:  lo.ToPtr(validJsonObj),
			want: validJsonObj,
			ok: true,
		},
		{
			name:  "invalid json string",
			args:  invalidJson,
			want: nil,
			ok: false,
		},
		{
			name:  "pointer to invalid json string",
			args:  lo.ToPtr(invalidJson),
			want: nil,
			ok: false,
		},
		{
			name:  "empty string",
			args:  "",
			want: nil,
			ok: false,
		},
		{
			name:  "map object",
			args:  map[string]any{"key": "value"},
			want: `{"key":"value"}`,
			ok: true,
		},
		{
			name:  "slice array",
			args:  []string{"item1", "item2"},
			want: `["item1","item2"]`,
			ok: true,
		},
		{
			name:  "nil pointer",
			args:  (*string)(nil),
			want: nil,
			ok: false,
		},
		{
			name:  "nil value",
			args:  nil,
			want: nil,
			ok: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			p := &propertyJson{}
			got, ok := p.ToValue(tt.args)
			assert.Equal(t, tt.want, got)
			assert.Equal(t, tt.ok, ok)
		})
	}
}

func Test_propertyJson_ToInterface(t *testing.T) {
	v := `{"key":"value"}`
	tt, ok := (&propertyJson{}).ToInterface(v)
	assert.Equal(t, v, tt)
	assert.Equal(t, true, ok)
}

func Test_propertyJson_IsEmpty(t *testing.T) {
	assert.True(t, (&propertyJson{}).IsEmpty(Json("")))
	assert.False(t, (&propertyJson{}).IsEmpty(Json(`{"key":"value"}`)))
}

func Test_propertyJson_Validate(t *testing.T) {
	v := `{"key":"value"}`
	assert.True(t, (&propertyJson{}).Validate(v))
	assert.False(t, (&propertyJson{}).Validate(123))
}

func Test_propertyJson_Equal(t *testing.T) {
	pj := &propertyJson{}
	j1 := Json(`{"key":"value"}`)
	j2 := Json(`{"key":"value"}`)
	j3 := Json(`{"key":"different"}`)
	assert.True(t, pj.Equal(j1, j2))
	assert.True(t, pj.Equal(nil, nil))
	assert.False(t, pj.Equal(nil, j1))
	assert.False(t, pj.Equal(j1, nil))
	assert.False(t, pj.Equal(j1, j3))
}

func TestValue_ValueJson(t *testing.T) {
	var v *Value
	got, ok := v.ValueJson()
	var expected Json
	assert.Equal(t, expected, got)
	assert.Equal(t, false, ok)

	v = &Value{
		v: 0,
	}
	got, ok = v.ValueJson()
	assert.Equal(t, expected, got)
	assert.Equal(t, false, ok)

	jsonStr := Json(`{"key":"value"}`)
	v = &Value{
		v: jsonStr,
	}
	got, ok = v.ValueJson()
	assert.Equal(t, jsonStr, got)
	assert.Equal(t, true, ok)
}

func TestMultiple_ValuesJson(t *testing.T) {
	var m *Multiple
	got, ok := m.ValuesJson()
	var expected []Json
	assert.Equal(t, expected, got)
	assert.Equal(t, false, ok)

	j1 := Json(`{"key1":"value1"}`)
	j2 := Json(`{"key2":"value2"}`)
	j3 := Json(`{"key3":"value3"}`)
	m = NewMultiple(TypeJson, []any{j1, j2, j3})
	expected = []Json{j1, j2, j3}
	got, _ = m.ValuesJson()
	assert.Equal(t, expected, got)
}
