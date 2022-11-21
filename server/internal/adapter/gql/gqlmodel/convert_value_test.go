package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestValueType(t *testing.T) {
	tests := []struct {
		name string
		t    value.Type
		want SchemaFiledType
	}{
		{
			name: "TypeText",
			t:    value.TypeText,
			want: SchemaFiledTypeText,
		},
		{
			name: "TypeTextArea",
			t:    value.TypeTextArea,
			want: SchemaFiledTypeTextArea,
		},
		{
			name: "TypeRichText",
			t:    value.TypeRichText,
			want: SchemaFiledTypeRichText,
		},
		{
			name: "TypeMarkdown",
			t:    value.TypeMarkdown,
			want: SchemaFiledTypeMarkdownText,
		},
		{
			name: "TypeAsset",
			t:    value.TypeAsset,
			want: SchemaFiledTypeAsset,
		},
		{
			name: "TypeDate",
			t:    value.TypeDateTime,
			want: SchemaFiledTypeDate,
		},
		{
			name: "TypeBool",
			t:    value.TypeBool,
			want: SchemaFiledTypeBool,
		},
		{
			name: "TypeSelect",
			t:    value.TypeSelect,
			want: SchemaFiledTypeSelect,
		},
		{
			name: "TypeInteger",
			t:    value.TypeInteger,
			want: SchemaFiledTypeInteger,
		},
		{
			name: "TypeReference",
			t:    value.TypeReference,
			want: SchemaFiledTypeReference,
		},
		{
			name: "TypeURL",
			t:    value.TypeURL,
			want: SchemaFiledTypeURL,
		},
		{
			name: "invalid",
			t:    "some value",
			want: "",
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, ToValueType(tt.t))
			if tt.want != "" {
				assert.Equal(t, tt.t, FromValueType(tt.want))
			} else {
				assert.Equal(t, value.TypeUnknown, FromValueType(tt.want))
			}
		})
	}
}
