package value

import (
	"net/url"
	"testing"
	"time"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func Test_propertyString_ToValue(t *testing.T) {
	u, _ := url.Parse("https://reearth.io")
	now := time.Now().Truncate(time.Second)

	tests := []struct {
		name  string
		args  []any
		want1 any
		want2 bool
	}{
		{
			name:  "string",
			args:  []any{"foobar", lo.ToPtr("foobar")},
			want1: "foobar",
			want2: true,
		},
		{
			name:  "number",
			args:  []any{1.12, lo.ToPtr(1.12)},
			want1: "1.12",
			want2: true,
		},
		{
			name:  "url",
			args:  []any{u},
			want1: "https://reearth.io",
			want2: true,
		},
		{
			name:  "time",
			args:  []any{now},
			want1: now.Format(time.RFC3339),
			want2: true,
		},
		{
			name:  "nil",
			args:  []any{(*string)(nil), nil},
			want1: nil,
			want2: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			p := &propertyString{}
			for i, v := range tt.args {
				got1, got2 := p.ToValue(v)
				assert.Equal(t, tt.want1, got1, "test %d", i)
				assert.Equal(t, tt.want2, got2, "test %d", i)
			}
		})
	}
}

func Test_propertyString_ToInterface(t *testing.T) {
	v := "a"
	tt, ok := (&propertyString{}).ToInterface(v)
	assert.Equal(t, v, tt)
	assert.Equal(t, true, ok)
}

func Test_propertyString_IsEmpty(t *testing.T) {
	assert.True(t, (&propertyString{}).IsEmpty(""))
	assert.False(t, (&propertyString{}).IsEmpty("a"))
}

func Test_propertyString_Validate(t *testing.T) {
	assert.True(t, (&propertyString{}).Validate("a"))
	assert.False(t, (&propertyString{}).Validate(1))
}

func Test_propertyString_Equal(t *testing.T) {
	ps := &propertyString{}
	assert.True(t, ps.Equal("xxx", "xxx"))
}

func TestValue_ValueString(t *testing.T) {
	var v *Value
	got, ok := v.ValueString()
	assert.Equal(t, "", got)
	assert.Equal(t, false, ok)

	v = &Value{
		v: "xxx",
	}
	got, ok = v.ValueString()
	assert.Equal(t, "xxx", got)
	assert.Equal(t, true, ok)
	v = &Value{
		v: 0,
	}
	got, ok = v.ValueString()
	assert.Equal(t, "", got)
	assert.Equal(t, false, ok)
}

func TestMultiple_ValuesString(t *testing.T) {
	var m *Multiple
	got, ok := m.ValuesString()
	var expected []String
	assert.Equal(t, expected, got)
	assert.False(t, ok)
	m = NewMultiple(TypeText, []any{"a", "b", "c"})
	expected = []String{"a", "b", "c"}
	got, ok = m.ValuesString()
	assert.Equal(t, expected, got)
	assert.True(t, ok)
}

func TestNormalizeString(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "ASCII unchanged",
			input:    "Hello World",
			expected: "Hello World",
		},
		{
			name:     "Fullwidth to halfwidth",
			input:    "ＨｅｌｌｏＷｏｒｌｄ",
			expected: "HelloWorld",
		},
		{
			name:     "Fullwidth digits",
			input:    "２０２４",
			expected: "2024",
		},
		{
			name:     "Japanese with fullwidth spaces",
			input:    "こんにちは　世界",
			expected: "こんにちは 世界",
		},
		{
			name:     "Mixed fullwidth and halfwidth",
			input:    "Ｔｏｋｙｏ２０２４",
			expected: "Tokyo2024",
		},
		{
			name:     "Empty string",
			input:    "",
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := normalizeString(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestPropertyString_ToValue_Normalization(t *testing.T) {
	p := &propertyString{}

	tests := []struct {
		name     string
		input    any
		expected string
		ok       bool
	}{
		{
			name:     "String with fullwidth characters",
			input:    "ｆｉｌｅ．ｔｘｔ",
			expected: "file.txt",
			ok:       true,
		},
		{
			name:     "String with fullwidth digits",
			input:    "document２０２４",
			expected: "document2024",
			ok:       true,
		},
		{
			name:     "Regular ASCII string",
			input:    "normal text",
			expected: "normal text",
			ok:       true,
		},
		{
			name:     "Japanese with fullwidth space",
			input:    "ファイル　名",
			expected: "ファイル 名",
			ok:       true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, ok := p.ToValue(tt.input)
			assert.Equal(t, tt.ok, ok)
			if ok {
				assert.Equal(t, tt.expected, result)
			}
		})
	}
}

func TestValue_ValueString_Normalization(t *testing.T) {
	// Test that creating a value with fullwidth characters normalizes them
	val := New(TypeText, "ｆｕｌｌｗｉｄｔｈ")
	assert.NotNil(t, val)

	str, ok := val.ValueString()
	assert.True(t, ok)
	assert.Equal(t, "fullwidth", str)
}

func TestMultiple_ValuesString_Normalization(t *testing.T) {
	// Test multiple values with fullwidth characters
	multi := NewMultiple(TypeText, []any{"ｖａｌｕｅ１", "ｖａｌｕｅ２", "normal"})
	assert.NotNil(t, multi)

	strs, ok := multi.ValuesString()
	assert.True(t, ok)
	assert.Equal(t, []string{"value1", "value2", "normal"}, strs)
}

func TestTextFieldTypes_Normalization(t *testing.T) {
	// Test all text-based field types
	textTypes := []Type{
		TypeText,
		TypeTextArea,
		TypeRichText,
		TypeMarkdown,
		TypeSelect,
		TypeTag,
		TypeGeometryObject,
		TypeGeometryEditor,
	}

	input := "ｆｕｌｌｗｉｄｔｈ"
	expected := "fullwidth"

	for _, fieldType := range textTypes {
		t.Run(string(fieldType), func(t *testing.T) {
			val := New(fieldType, input)
			assert.NotNil(t, val)

			str, ok := val.ValueString()
			assert.True(t, ok)
			assert.Equal(t, expected, str, "Field type %s should normalize text", fieldType)
		})
	}
}
