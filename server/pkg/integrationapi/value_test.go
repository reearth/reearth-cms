package integrationapi

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
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
			input:    lo.ToPtr(ValueTypeText),
			expected: value.TypeText,
		},
		{
			name:     "Valid ValueTypeMarkdown",
			input:    lo.ToPtr(ValueTypeMarkdown),
			expected: value.TypeMarkdown,
		},
		{
			name:     "Valid ValueTypeTextArea",
			input:    lo.ToPtr(ValueTypeTextArea),
			expected: value.TypeTextArea,
		},
		{
			name:     "Valid ValueTypeRichText",
			input:    lo.ToPtr(ValueTypeRichText),
			expected: value.TypeRichText,
		},
		{
			name:     "Valid ValueTypeAsset",
			input:    lo.ToPtr(ValueTypeAsset),
			expected: value.TypeAsset,
		},
		{
			name:     "Valid ValueTypeDate",
			input:    lo.ToPtr(ValueTypeDate),
			expected: value.TypeDateTime,
		},
		{
			name:     "Valid ValueTypeBool",
			input:    lo.ToPtr(ValueTypeBool),
			expected: value.TypeBool,
		},
		{
			name:     "Valid ValueTypeSelect",
			input:    lo.ToPtr(ValueTypeSelect),
			expected: value.TypeSelect,
		},
		{
			name:     "Valid ValueTypeInteger",
			input:    lo.ToPtr(ValueTypeInteger),
			expected: value.TypeInteger,
		},
		{
			name:     "Valid ValueTypeNumber",
			input:    lo.ToPtr(ValueTypeNumber),
			expected: value.TypeNumber,
		},
		{
			name:     "Valid ValueTypeReference",
			input:    lo.ToPtr(ValueTypeReference),
			expected: value.TypeReference,
		},
		{
			name:     "Valid ValueTypeUrl",
			input:    lo.ToPtr(ValueTypeUrl),
			expected: value.TypeURL,
		},
		{
			name:     "Valid ValueTypeTag",
			input:    lo.ToPtr(ValueTypeTag),
			expected: value.TypeTag,
		},
		{
			name:     "Valid ValueTypeGroup",
			input:    lo.ToPtr(ValueTypeGroup),
			expected: value.TypeGroup,
		},
		{
			name:     "Valid ValueTypeGeometryObject",
			input:    lo.ToPtr(ValueTypeGeometryObject),
			expected: value.TypeGeometryObject,
		},
		{
			name:     "Valid ValueTypeGeometryEditor",
			input:    lo.ToPtr(ValueTypeGeometryEditor),
			expected: value.TypeGeometryEditor,
		},
		{
			name:     "Unknown ValueType",
			input:    lo.ToPtr(ValueType("Unknown")),
			expected: value.TypeUnknown,
		},
	}
	for _, tt := range tests {
		tt := tt
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
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.expected, ToValueType(tt.input))
		})
	}
}
