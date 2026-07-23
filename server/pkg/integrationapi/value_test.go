package integrationapi

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestFromValueType(t *testing.T) {
	tests := []struct {
		name     string
		input    *ValueType
		expected value.Type
	}{
		{
			name:     "Nil input",
			input:    nil,
			expected: "",
		},
		{
			name:     "Valid ValueTypeText",
			input:    new(ValueTypeText),
			expected: value.TypeText,
		},
		{
			name:     "Valid ValueTypeMarkdown",
			input:    new(ValueTypeMarkdown),
			expected: value.TypeMarkdown,
		},
		{
			name:     "Valid ValueTypeTextArea",
			input:    new(ValueTypeTextArea),
			expected: value.TypeTextArea,
		},
		{
			name:     "Valid ValueTypeRichText",
			input:    new(ValueTypeRichText),
			expected: value.TypeRichText,
		},
		{
			name:     "Valid ValueTypeAsset",
			input:    new(ValueTypeAsset),
			expected: value.TypeAsset,
		},
		{
			name:     "Valid ValueTypeDate",
			input:    new(ValueTypeDate),
			expected: value.TypeDateTime,
		},
		{
			name:     "Valid ValueTypeBool",
			input:    new(ValueTypeBool),
			expected: value.TypeBool,
		},
		{
			name:     "Valid ValueTypeSelect",
			input:    new(ValueTypeSelect),
			expected: value.TypeSelect,
		},
		{
			name:     "Valid ValueTypeInteger",
			input:    new(ValueTypeInteger),
			expected: value.TypeInteger,
		},
		{
			name:     "Valid ValueTypeNumber",
			input:    new(ValueTypeNumber),
			expected: value.TypeNumber,
		},
		{
			name:     "Valid ValueTypeReference",
			input:    new(ValueTypeReference),
			expected: value.TypeReference,
		},
		{
			name:     "Valid ValueTypeUrl",
			input:    new(ValueTypeUrl),
			expected: value.TypeURL,
		},
		{
			name:     "Valid ValueTypeTag",
			input:    new(ValueTypeTag),
			expected: value.TypeTag,
		},
		{
			name:     "Valid ValueTypeGroup",
			input:    new(ValueTypeGroup),
			expected: value.TypeGroup,
		},
		{
			name:     "Valid ValueTypeGeometryObject",
			input:    new(ValueTypeGeometryObject),
			expected: value.TypeGeometryObject,
		},
		{
			name:     "Valid ValueTypeGeometryEditor",
			input:    new(ValueTypeGeometryEditor),
			expected: value.TypeGeometryEditor,
		},
		{
			name:     "Unknown ValueType",
			input:    new(ValueType("Unknown")),
			expected: value.TypeUnknown,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.expected, FromValueType(tt.input))
		})
	}
}

func TestToValueType(t *testing.T) {
	tests := []struct {
		name     string
		input    value.Type
		expected ValueType
	}{
		{
			name:     "TypeText",
			input:    value.TypeText,
			expected: ValueTypeText,
		},
		{
			name:     "TypeTextArea",
			input:    value.TypeTextArea,
			expected: ValueTypeTextArea,
		},
		{
			name:     "TypeRichText",
			input:    value.TypeRichText,
			expected: ValueTypeRichText,
		},
		{
			name:     "TypeMarkdown",
			input:    value.TypeMarkdown,
			expected: ValueTypeMarkdown,
		},
		{
			name:     "TypeAsset",
			input:    value.TypeAsset,
			expected: ValueTypeAsset,
		},
		{
			name:     "TypeDateTime",
			input:    value.TypeDateTime,
			expected: ValueTypeDate,
		},
		{
			name:     "TypeBool",
			input:    value.TypeBool,
			expected: ValueTypeBool,
		},
		{
			name:     "TypeSelect",
			input:    value.TypeSelect,
			expected: ValueTypeSelect,
		},
		{
			name:     "TypeInteger",
			input:    value.TypeInteger,
			expected: ValueTypeInteger,
		},
		{
			name:     "TypeNumber",
			input:    value.TypeNumber,
			expected: ValueTypeNumber,
		},
		{
			name:     "TypeReference",
			input:    value.TypeReference,
			expected: ValueTypeReference,
		},
		{
			name:     "TypeURL",
			input:    value.TypeURL,
			expected: ValueTypeUrl,
		},
		{
			name:     "TypeGroup",
			input:    value.TypeGroup,
			expected: ValueTypeGroup,
		},
		{
			name:     "TypeTag",
			input:    value.TypeTag,
			expected: ValueTypeTag,
		},
		{
			name:     "TypeCheckbox",
			input:    value.TypeCheckbox,
			expected: ValueTypeCheckbox,
		},
		{
			name:     "TypeGeometryObject",
			input:    value.TypeGeometryObject,
			expected: ValueTypeGeometryObject,
		},
		{
			name:     "TypeGeometryEditor",
			input:    value.TypeGeometryEditor,
			expected: ValueTypeGeometryEditor,
		},
		{
			name:     "Unknown Type",
			input:    value.Type("Unknown"),
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.expected, ToValueType(tt.input))
		})
	}
}
