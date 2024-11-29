package exporters

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
)

const defaultJSONSchemaVersion = "https://json-schema.org/draft/2020-12/schema"

type SchemaJSON struct {
	Id          *string                         `json:"$id,omitempty"`
	Schema      *string                         `json:"$schema,omitempty"`
	Description *string                         `json:"description,omitempty"`
	Properties  map[string]SchemaJSONProperties `json:"properties"`
	Title       *string                         `json:"title,omitempty"`
	Type        string                          `json:"type"`
}

type SchemaJSONProperties struct {
	Description *string     `json:"description,omitempty"`
	Format      *string     `json:"format,omitempty"`
	Items       *SchemaJSON `json:"items,omitempty"`
	MaxLength   *int        `json:"maxLength,omitempty"`
	Maximum     *float64    `json:"maximum,omitempty"`
	Minimum     *float64    `json:"minimum,omitempty"`
	Title       *string     `json:"title,omitempty"`
	Type        string      `json:"type"`
}

func NewSchemaJSON(id, title, description *string, pp map[string]SchemaJSONProperties) SchemaJSON {
	res := SchemaJSON{
		Schema:     lo.ToPtr(defaultJSONSchemaVersion),
		Type:       "object",
		Properties: pp,
	}
	if id != nil && *id != "" {
		res.Id = id
	}
	if title != nil && *title != "" {
		res.Title = title
	}
	if description != nil && *description != "" {
		res.Description = description
	}
	return res
}

func buildPropertiesMap(f schema.FieldList, gsMap map[id.GroupID]*schema.Schema) map[string]SchemaJSONProperties {
	properties := make(map[string]SchemaJSONProperties)
	for _, field := range f {
		fieldType, format := determineTypeAndFormat(field.Type())
		fieldSchema := SchemaJSONProperties{Type: fieldType}
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
						fieldSchema.Items = BuildItems(gs.Fields())
					}
				}
			},
		})

		properties[field.Key().String()] = fieldSchema
	}
	return properties
}

func BuildProperties(f schema.FieldList, gsMap map[id.GroupID]*schema.Schema) map[string]SchemaJSONProperties {
	return buildPropertiesMap(f, gsMap)
}

func BuildItems(f schema.FieldList) *SchemaJSON {
	return &SchemaJSON{
		Type:       "object",
		Properties: buildPropertiesMap(f, nil),
	}
}

func int64ToFloat64(input *int64) *float64 {
	if input == nil {
		return nil
	}
	value := float64(*input)
	return &value
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

func BuildGroupSchemaMap(sp *schema.Package) map[id.GroupID]*schema.Schema {
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
