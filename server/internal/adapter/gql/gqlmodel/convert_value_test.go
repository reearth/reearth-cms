package gqlmodel

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
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

func TestToValue(t *testing.T) {
	now := time.Now()
	aid := id.NewAssetID()
	iid := id.NewItemID()

	tests := []struct {
		name string
		v    *value.Value
		want any
	}{
		{
			name: "TypeText",
			v:    value.TypeText.Value("aaa"),
			want: "aaa",
		},
		{
			name: "TypeTextArea",
			v:    value.TypeTextArea.Value("aaa"),
			want: "aaa",
		},
		{
			name: "TypeRichText",
			v:    value.TypeRichText.Value("aaa"),
			want: "aaa",
		},
		{
			name: "TypeMarkdown",
			v:    value.TypeMarkdown.Value("aaa"),
			want: "aaa",
		},
		{
			name: "TypeAsset",
			v:    value.TypeAsset.Value(aid),
			want: aid.String(),
		},
		{
			name: "TypeDate",
			v:    value.TypeDateTime.Value(now),
			want: now.Format(time.RFC3339),
		},
		{
			name: "TypeBool",
			v:    value.TypeBool.Value(true),
			want: true,
		},
		{
			name: "TypeSelect",
			v:    value.TypeSelect.Value("aaa"),
			want: "aaa",
		},
		{
			name: "TypeInteger",
			v:    value.TypeInteger.Value(lo.ToPtr(100)),
			want: int64(100),
		},
		{
			name: "TypeReference",
			v:    value.TypeReference.Value(iid),
			want: iid.String(),
		},
		{
			name: "TypeURL",
			v:    value.TypeURL.Value("https://example.com"),
			want: "https://example.com",
		},
		{
			name: "nil",
			v:    nil,
			want: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, ToValue(tt.v.Some()))
		})
	}
}

func TestFromValue(t *testing.T) {
	now := time.Date(2022, time.January, 1, 0, 0, 0, 0, time.UTC)
	aid := id.NewAssetID()
	iid := id.NewItemID()

	tests := []struct {
		name string
		t    SchemaFiledType
		v    any
		want *value.Value
	}{
		{
			name: "TypeText",
			t:    SchemaFiledTypeText,
			v:    "aaa",
			want: value.TypeText.Value("aaa"),
		},
		{
			name: "TypeTextArea",
			t:    SchemaFiledTypeTextArea,
			v:    "aaa",
			want: value.TypeTextArea.Value("aaa"),
		},
		{
			name: "TypeRichText",
			t:    SchemaFiledTypeRichText,
			v:    "aaa",
			want: value.TypeRichText.Value("aaa"),
		},
		{
			name: "TypeMarkdown",
			t:    SchemaFiledTypeMarkdownText,
			v:    "aaa",
			want: value.TypeMarkdown.Value("aaa"),
		},
		{
			name: "TypeAsset",
			t:    SchemaFiledTypeAsset,
			v:    aid,
			want: value.TypeAsset.Value(aid),
		},
		{
			name: "TypeDate",
			t:    SchemaFiledTypeDate,
			v:    now.Format(time.RFC3339),
			want: value.TypeDateTime.Value(now),
		},
		{
			name: "TypeBool",
			t:    SchemaFiledTypeBool,
			v:    true,
			want: value.TypeBool.Value(true),
		},
		{
			name: "TypeSelect",
			t:    SchemaFiledTypeSelect,
			v:    "aaa",
			want: value.TypeSelect.Value("aaa"),
		},
		{
			name: "TypeInteger",
			t:    SchemaFiledTypeInteger,
			v:    int64(100),
			want: value.TypeInteger.Value(lo.ToPtr(100)),
		},
		{
			name: "TypeReference",
			t:    SchemaFiledTypeReference,
			v:    iid,
			want: value.TypeReference.Value(iid),
		},
		{
			name: "TypeURL",
			t:    SchemaFiledTypeURL,
			v:    "https://example.com",
			want: value.TypeURL.Value("https://example.com"),
		},
		{
			name: "nil",
			t:    SchemaFiledTypeBool,
			v:    nil,
			want: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, FromValue(tt.t, tt.v))
		})
	}
}
