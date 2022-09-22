package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/samber/lo"
)

func ToSchema(s *schema.Schema) *Schema {
	if s == nil {
		return nil
	}

	return &Schema{
		ID: IDFrom(s.ID()),
		// ProjectID: nil,
		Fields: lo.Map(s.Fields(), func(sf *schema.Field, _ int) *SchemaField {
			return ToSchemaField(sf)
		}),
	}
}

func ToSchemaField(sf *schema.Field) *SchemaField {
	if sf == nil {
		return nil
	}

	return &SchemaField{
		ID:           IDFrom(sf.ID()),
		Type:         ToSchemaFieldType(sf.Type()),
		TypeProperty: ToSchemaFieldTypeProperty(sf.TypeProperty()),
		Key:          sf.Key().String(),
		Title:        sf.Name(),
		Description:  lo.ToPtr(sf.Description()),
		MultiValue:   sf.MultiValue(),
		Unique:       sf.Unique(),
		Required:     sf.Required(),
		CreatedAt:    sf.CreatedAt(),
		UpdatedAt:    sf.UpdatedAt(),
	}
}

func ToSchemaFieldType(t schema.Type) SchemaFiledType {
	switch t {
	case schema.TypeText:
		return SchemaFiledTypeText
	case schema.TypeTextArea:
		return SchemaFiledTypeTextArea
	case schema.TypeRichText:
		return SchemaFiledTypeRichText
	case schema.TypeMarkdown:
		return SchemaFiledTypeMarkdownText
	case schema.TypeAsset:
		return SchemaFiledTypeAsset
	case schema.TypeDate:
		return SchemaFiledTypeDate
	case schema.TypeBool:
		return SchemaFiledTypeBool
	case schema.TypeSelect:
		return SchemaFiledTypeSelect
	case schema.TypeTag:
		return SchemaFiledTypeTag
	case schema.TypeInteger:
		return SchemaFiledTypeInteger
	case schema.TypeReference:
		return SchemaFiledTypeReference
	case schema.TypeURL:
		return SchemaFiledTypeURL
	default:
		return ""
	}
}

func ToSchemaFieldTypeProperty(tp *schema.TypeProperty) (res SchemaFieldTypeProperty) {
	tp.Match(schema.TypePropertyMatch{
		Text: func(f *schema.FieldText) {
			res = &SchemaFieldText{
				DefaultValue: f.DefaultValue(),
				MaxLength:    f.MaxLength(),
			}
		},
		TextArea: func(f *schema.FieldTextArea) {
			res = &SchemaFieldTextArea{
				DefaultValue: f.DefaultValue(),
				MaxLength:    f.MaxLength(),
			}
		},
		RichText: func(f *schema.FieldRichText) {
			res = &SchemaFieldRichText{
				DefaultValue: f.DefaultValue(),
				MaxLength:    f.MaxLength(),
			}
		},
		Markdown: func(f *schema.FieldMarkdown) {
			res = &SchemaFieldMarkdown{
				DefaultValue: f.DefaultValue(),
				MaxLength:    f.MaxLength(),
			}
		},
		Asset: func(f *schema.FieldAsset) {
			res = &SchemaFieldAsset{
				DefaultValue: IDFromRef(f.DefaultValue()),
			}
		},
		Date: func(f *schema.FieldDate) {
			res = &SchemaFieldDate{
				DefaultValue: f.DefaultValue(),
			}
		},
		Bool: func(f *schema.FieldBool) {
			res = &SchemaFieldBool{
				DefaultValue: f.DefaultValue(),
			}
		},
		Select: func(f *schema.FieldSelect) {
			res = &SchemaFieldSelect{
				DefaultValue: f.DefaultValue(),
				Values:       f.Values(),
			}
		},
		Tag: func(f *schema.FieldTag) {
			res = &SchemaFieldTag{
				DefaultValue: f.DefaultValue(),
				Values:       f.Values(),
			}
		},
		Integer: func(f *schema.FieldInteger) {
			res = &SchemaFieldInteger{
				DefaultValue: f.DefaultValue(),
				Min:          f.Min(),
				Max:          f.Max(),
			}
		},
		Reference: func(f *schema.FieldReference) {
			res = &SchemaFieldReference{
				ModelID: IDFrom(f.ModelID()),
			}
		},
		URL: func(f *schema.FieldURL) {
			res = &SchemaFieldURL{
				DefaultValue: f.DefaultValue(),
			}
		},
	})
	return
}

func FromSchemaFieldType(t SchemaFiledType) schema.Type {
	switch t {
	case SchemaFiledTypeText:
		return schema.TypeText
	case SchemaFiledTypeTextArea:
		return schema.TypeTextArea
	case SchemaFiledTypeRichText:
		return schema.TypeRichText
	case SchemaFiledTypeMarkdownText:
		return schema.TypeMarkdown
	case SchemaFiledTypeAsset:
		return schema.TypeAsset
	case SchemaFiledTypeDate:
		return schema.TypeDate
	case SchemaFiledTypeBool:
		return schema.TypeBool
	case SchemaFiledTypeSelect:
		return schema.TypeSelect
	case SchemaFiledTypeTag:
		return schema.TypeTag
	case SchemaFiledTypeInteger:
		return schema.TypeInteger
	case SchemaFiledTypeReference:
		return schema.TypeReference
	case SchemaFiledTypeURL:
		return schema.TypeURL
	default:
		return ""
	}
}
