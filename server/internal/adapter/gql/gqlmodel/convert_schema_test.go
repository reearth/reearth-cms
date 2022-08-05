package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestToSchema(t *testing.T) {
	wId := id.NewWorkspaceID()
	sId := schema.NewID()
	tests := []struct {
		name   string
		schema *schema.Schema
		want   *Schema
	}{
		{
			name:   "nil",
			schema: nil,
			want:   nil,
		},
		{
			name:   "success",
			schema: schema.New().ID(sId).Workspace(wId).Fields(nil).MustBuild(),
			want: &Schema{
				ID:      IDFrom(sId),
				Project: nil,
				Fields:  []*SchemaField{},
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := ToSchema(tt.schema)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestToSchemaField(t *testing.T) {
	fId := schema.NewFieldID()
	tests := []struct {
		name   string
		schema *schema.Field
		want   *SchemaField
	}{
		{
			name:   "nil",
			schema: nil,
			want:   nil,
		},
		{
			name: "success",
			schema: schema.NewFieldText(nil, nil).ID(fId).UpdatedAt(fId.Timestamp()).
				Name("N1").Description("D1").Key(key.New("K123456")).Options(true, true, true).MustBuild(),
			want: &SchemaField{
				ID:           IDFrom(fId),
				ModelID:      "",
				Model:        nil,
				Type:         SchemaFiledTypeText,
				TypeProperty: nil,
				Key:          "K123456",
				Title:        "N1",
				Description:  lo.ToPtr("D1"),
				MultiValue:   true,
				Unique:       true,
				Required:     true,
				CreatedAt:    fId.Timestamp(),
				UpdatedAt:    fId.Timestamp(),
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := ToSchemaField(tt.schema)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestToSchemaFieldType(t *testing.T) {
	tests := []struct {
		name string
		t    schema.Type
		want SchemaFiledType
	}{
		{
			name: "TypeText",
			t:    schema.TypeText,
			want: SchemaFiledTypeText,
		},
		{
			name: "TypeTextArea",
			t:    schema.TypeTextArea,
			want: SchemaFiledTypeTextArea,
		},
		{
			name: "TypeRichText",
			t:    schema.TypeRichText,
			want: SchemaFiledTypeRichText,
		},
		{
			name: "TypeMarkdown",
			t:    schema.TypeMarkdown,
			want: SchemaFiledTypeMarkdownText,
		},
		{
			name: "TypeAsset",
			t:    schema.TypeAsset,
			want: SchemaFiledTypeAsset,
		},
		{
			name: "TypeDate",
			t:    schema.TypeDate,
			want: SchemaFiledTypeDate,
		},
		{
			name: "TypeBool",
			t:    schema.TypeBool,
			want: SchemaFiledTypeBool,
		},
		{
			name: "TypeSelect",
			t:    schema.TypeSelect,
			want: SchemaFiledTypeSelect,
		},
		{
			name: "TypeTag",
			t:    schema.TypeTag,
			want: SchemaFiledTypeTag,
		},
		{
			name: "TypeInteger",
			t:    schema.TypeInteger,
			want: SchemaFiledTypeInteger,
		},
		{
			name: "TypeReference",
			t:    schema.TypeReference,
			want: SchemaFiledTypeReference,
		},
		{
			name: "TypeURL",
			t:    schema.TypeURL,
			want: SchemaFiledTypeURL,
		},
		{
			name: "TypeURL",
			t:    "some value",
			want: "",
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, ToSchemaFieldType(tt.t))
		})
	}
}
