package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
)

func ToSchema(s *schema.Schema) *Schema {
	if s == nil {
		return nil
	}

	return &Schema{
		ID:        IDFrom(s.ID()),
		ProjectID: IDFrom(s.Project()),
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
		Type:         ToType(sf.Type()),
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

func ToType(t value.Type) SchemaFiledType {
	switch t {
	case value.TypeText:
		return SchemaFiledTypeText
	case value.TypeTextArea:
		return SchemaFiledTypeTextArea
	case value.TypeRichText:
		return SchemaFiledTypeRichText
	case value.TypeMarkdown:
		return SchemaFiledTypeMarkdownText
	case value.TypeAsset:
		return SchemaFiledTypeAsset
	case value.TypeDateTime:
		return SchemaFiledTypeDate
	case value.TypeBool:
		return SchemaFiledTypeBool
	case value.TypeSelect:
		return SchemaFiledTypeSelect
	case value.TypeInteger:
		return SchemaFiledTypeInteger
	case value.TypeReference:
		return SchemaFiledTypeReference
	case value.TypeURL:
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

func FromSchemaFieldType(t SchemaFiledType) value.Type {
	switch t {
	case SchemaFiledTypeText:
		return value.TypeText
	case SchemaFiledTypeTextArea:
		return value.TypeTextArea
	case SchemaFiledTypeRichText:
		return value.TypeRichText
	case SchemaFiledTypeMarkdownText:
		return value.TypeMarkdown
	case SchemaFiledTypeAsset:
		return value.TypeAsset
	case SchemaFiledTypeDate:
		return value.TypeDateTime
	case SchemaFiledTypeBool:
		return value.TypeBool
	case SchemaFiledTypeSelect:
		return value.TypeSelect
	case SchemaFiledTypeInteger:
		return value.TypeInteger
	case SchemaFiledTypeReference:
		return value.TypeReference
	case SchemaFiledTypeURL:
		return value.TypeURL
	default:
		return ""
	}
}
