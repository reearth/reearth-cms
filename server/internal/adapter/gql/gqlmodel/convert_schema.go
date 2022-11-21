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
		Type:         ToValueType(sf.Type()),
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
