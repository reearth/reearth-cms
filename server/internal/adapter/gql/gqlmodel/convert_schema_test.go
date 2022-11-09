package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestToSchema(t *testing.T) {
	wId := id.NewWorkspaceID()
	pId := id.NewProjectID()
	sId := schema.NewID()
	fId := id.NewFieldID()
	k := key.Random()
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
			schema: schema.New().ID(sId).Workspace(wId).Fields(nil).Project(pId).MustBuild(),
			want: &Schema{
				ID:        IDFrom(sId),
				ProjectID: IDFrom(pId),
				Fields:    []*SchemaField{},
			},
		},
		{
			name:   "success",
			schema: schema.New().ID(sId).Workspace(wId).Project(pId).Fields([]*schema.Field{schema.NewFieldText(nil, nil).ID(fId).Key(k).MustBuild()}).MustBuild(),
			want: &Schema{
				ID:        IDFrom(sId),
				ProjectID: IDFrom(pId),
				Fields: []*SchemaField{{
					ID:          IDFrom(fId),
					Type:        "Text",
					Description: lo.ToPtr(""),
					TypeProperty: &SchemaFieldText{
						DefaultValue: nil,
						MaxLength:    nil,
					},
					Key:       k.String(),
					CreatedAt: fId.Timestamp(),
					UpdatedAt: fId.Timestamp(),
				}},
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
			schema: schema.NewFieldText(nil).ID(fId).UpdatedAt(fId.Timestamp()).
				Name("N1").Description("D1").Key(key.New("K123456")).Options(true, true, true).MustBuild(),
			want: &SchemaField{
				ID:           IDFrom(fId),
				ModelID:      "",
				Model:        nil,
				Type:         ValueTypeText,
				TypeProperty: &SchemaFieldText{},
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
		t    value.Type
		want ValueType
	}{
		{
			name: "TypeText",
			t:    value.TypeText,
			want: ValueTypeText,
		},
		{
			name: "TypeTextArea",
			t:    value.TypeTextArea,
			want: ValueTypeTextArea,
		},
		{
			name: "TypeRichText",
			t:    value.TypeRichText,
			want: ValueTypeRichText,
		},
		{
			name: "TypeMarkdown",
			t:    value.TypeMarkdown,
			want: ValueTypeMarkdownText,
		},
		{
			name: "TypeAsset",
			t:    value.TypeAsset,
			want: ValueTypeAsset,
		},
		{
			name: "TypeDate",
			t:    value.TypeDate,
			want: ValueTypeDate,
		},
		{
			name: "TypeBool",
			t:    value.TypeBool,
			want: ValueTypeBool,
		},
		{
			name: "TypeSelect",
			t:    value.TypeSelect,
			want: ValueTypeSelect,
		},
		{
			name: "TypeTag",
			t:    value.TypeTag,
			want: ValueTypeTag,
		},
		{
			name: "TypeInteger",
			t:    value.TypeInteger,
			want: ValueTypeInteger,
		},
		{
			name: "TypeReference",
			t:    value.TypeReference,
			want: ValueTypeReference,
		},
		{
			name: "TypeURL",
			t:    value.TypeURL,
			want: ValueTypeURL,
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

			assert.Equal(t, tt.want, ToValueType(tt.t))
		})
	}
}

func TestToSchemaFieldTypeProperty(t *testing.T) {
	mId := id.NewModelID()
	tpInt, _ := schema.NewFieldTypePropertyInteger(nil, nil, nil)
	tpURL, _ := schema.NewFieldTypePropertyURL(nil)
	tpTag, _ := schema.NewFieldTypePropertyTag([]string{"v1"}, nil)
	tpSelect, _ := schema.NewFieldTypePropertySelect([]string{"v1"}, nil)
	tpText, _ := schema.NewFieldTypePropertyText(nil, nil)
	tpTextarea, _ := schema.NewFieldTypePropertyTextArea(nil, nil)
	tpRichtext, _ := schema.NewFieldTypePropertyRichText(nil, nil)
	tpMarkdown, _ := schema.NewFieldTypePropertyMarkdown(nil, nil)
	type args struct {
		tp *schema.TypeProperty
	}
	tests := []struct {
		name string
		args args
		want SchemaFieldTypeProperty
	}{
		{
			name: "test",
			args: args{tp: nil},
			want: nil,
		},
		{
			name: "test",
			args: args{tp: tpText},
			want: &SchemaFieldText{DefaultValue: nil, MaxLength: nil},
		},
		{
			name: "test",
			args: args{tp: tpTextarea},
			want: &SchemaFieldTextArea{DefaultValue: nil, MaxLength: nil},
		},
		{
			name: "test",
			args: args{tp: tpMarkdown},
			want: &SchemaFieldMarkdown{DefaultValue: nil, MaxLength: nil},
		},
		{
			name: "test",
			args: args{tp: schema.NewFieldTypePropertyBool(nil)},
			want: &SchemaFieldBool{DefaultValue: nil},
		},
		{
			name: "test",
			args: args{tp: schema.NewFieldTypePropertyDate(nil)},
			want: &SchemaFieldDate{DefaultValue: nil},
		},
		{
			name: "test",
			args: args{tp: schema.NewFieldTypePropertyReference(mId)},
			want: &SchemaFieldReference{ModelID: IDFrom(mId)},
		},
		{
			name: "test",
			args: args{tp: tpRichtext},
			want: &SchemaFieldRichText{DefaultValue: nil, MaxLength: nil},
		},
		{
			name: "test",
			args: args{tp: schema.NewFieldTypePropertyAsset(nil)},
			want: &SchemaFieldAsset{DefaultValue: nil},
		},
		{
			name: "test",
			args: args{tp: tpInt},
			want: &SchemaFieldInteger{DefaultValue: nil, Min: nil, Max: nil},
		},
		{
			name: "test",
			args: args{tp: tpURL},
			want: &SchemaFieldURL{DefaultValue: nil},
		},
		{
			name: "test",
			args: args{tp: tpTag},
			want: &SchemaFieldTag{Values: []string{"v1"}, DefaultValue: nil},
		},
		{
			name: "test",
			args: args{tp: tpSelect},
			want: &SchemaFieldSelect{Values: []string{"v1"}, DefaultValue: nil},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, ToSchemaFieldTypeProperty(tt.args.tp))
		})
	}
}
