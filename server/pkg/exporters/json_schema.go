package exporters

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/types"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
)

const defaultJSONSchemaVersion = "https://json-schema.org/draft/2020-12/schema"

type JSONSchemaExportTarget string

const (
	JSONSchemaExportTargetSchema         JSONSchemaExportTarget = "schema"
	JSONSchemaExportTargetMetadataSchema JSONSchemaExportTarget = "metadataSchema"
)

func NewJSONSchema(m *model.Model, sp *schema.Package, t JSONSchemaExportTarget) types.JSONSchema {
	if m == nil || sp == nil {
		return types.JSONSchema{}
	}
	return types.JSONSchema{
		Id:          targetId(sp, t),
		Title:       lo.EmptyableToPtr(m.Name()),
		Description: lo.EmptyableToPtr(m.Description()),
		Schema:      lo.ToPtr(defaultJSONSchemaVersion),
		Type:        "object",
		Properties:  buildPropertiesMap(targetFields(sp, t), buildGroupSchemaMap(sp)),
	}
}

func targetFields(sp *schema.Package, t JSONSchemaExportTarget) schema.FieldList {
	if t == JSONSchemaExportTargetMetadataSchema {
		return sp.MetaSchema().Fields()
	}
	if t == JSONSchemaExportTargetSchema {
		return sp.Schema().Fields()
	}
	return nil
}

func targetId(sp *schema.Package, t JSONSchemaExportTarget) *string {
	if t == JSONSchemaExportTargetMetadataSchema {
		return sp.MetaSchema().ID().Ref().StringRef()
	}
	if t == JSONSchemaExportTargetSchema {
		return sp.Schema().ID().Ref().StringRef()
	}
	return nil
}

func buildPropertiesMap(f schema.FieldList, gsMap map[id.GroupID]*schema.Schema) map[string]types.JSONSchema {
	properties := make(map[string]types.JSONSchema)
	for _, field := range f {
		fieldType, format := determineTypeAndFormat(field.Type())
		fieldSchema := types.JSONSchema{Type: fieldType}
		if field.Name() != "" {
			fieldSchema.Title = lo.ToPtr(field.Name())
		}
		if field.Description() != "" {
			fieldSchema.Description = lo.ToPtr(field.Description())
		}
		if format != "" {
			fieldSchema.Format = lo.ToPtr(format)
		}

		field.TypeProperty().Match(schema.TypePropertyMatch{
			Text: func(f *schema.FieldText) {
				if maxLength := f.MaxLength(); maxLength != nil {
					fieldSchema.MaxLength = maxLength
					properties[field.Key().String()] = fieldSchema
				}
			},
			TextArea: func(f *schema.FieldTextArea) {
				if maxLength := f.MaxLength(); maxLength != nil {
					fieldSchema.MaxLength = maxLength
				}
			},
			RichText: func(f *schema.FieldRichText) {
				if maxLength := f.MaxLength(); maxLength != nil {
					fieldSchema.MaxLength = maxLength
				}
			},
			Markdown: func(f *schema.FieldMarkdown) {
				if maxLength := f.MaxLength(); maxLength != nil {
					fieldSchema.MaxLength = maxLength
				}
			},
			Integer: func(f *schema.FieldInteger) {
				if min := f.Min(); min != nil {
					fieldSchema.Minimum = int64ToFloat64(min)
				}
				if max := f.Max(); max != nil {
					fieldSchema.Maximum = int64ToFloat64(max)
				}
			},
			Number: func(f *schema.FieldNumber) {
				if min := f.Min(); min != nil {
					fieldSchema.Minimum = min
				}
				if max := f.Max(); max != nil {
					fieldSchema.Maximum = max
				}
			},
			Group: func(f *schema.FieldGroup) {
				if gsMap != nil {
					gs := gsMap[f.Group()]
					if gs != nil {
						fieldSchema.Items = buildItems(gs.Fields())
					}
				}
			},
		})

		properties[field.Key().String()] = fieldSchema
	}
	return properties
}

func buildItems(f schema.FieldList) *types.JSONSchema {
	return &types.JSONSchema{
		Type:       "object",
		Properties: buildPropertiesMap(f, nil),
	}
}

func int64ToFloat64(input *int64) *float64 {
	if input == nil {
		return nil
	}
	return lo.ToPtr(float64(*input))
}

func determineTypeAndFormat(t value.Type) (string, string) {
	switch t {
	case value.TypeText, value.TypeTextArea, value.TypeRichText, value.TypeMarkdown, value.TypeSelect, value.TypeTag, value.TypeReference:
		return "string", ""
	case value.TypeInteger:
		return "integer", ""
	case value.TypeNumber:
		return "number", ""
	case value.TypeBool, value.TypeCheckbox:
		return "boolean", ""
	case value.TypeDateTime:
		return "string", "date-time"
	case value.TypeURL:
		return "string", "uri"
	case value.TypeAsset:
		return "string", "binary"
	case value.TypeGroup:
		return "array", ""
	case value.TypeGeometryObject, value.TypeGeometryEditor:
		return "object", ""
	default:
		return "string", ""
	}
}

func buildGroupSchemaMap(sp *schema.Package) map[id.GroupID]*schema.Schema {
	groupSchemaMap := make(map[id.GroupID]*schema.Schema)
	for _, field := range sp.Schema().Fields() {
		field.TypeProperty().Match(schema.TypePropertyMatch{
			Group: func(fg *schema.FieldGroup) {
				groupSchema := sp.GroupSchema(fg.Group())
				if groupSchema != nil {
					groupSchemaMap[fg.Group()] = groupSchema
				}
			},
		})
	}
	return groupSchemaMap
}
