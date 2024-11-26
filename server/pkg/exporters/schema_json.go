package exporters

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
)

const defaultJSONSchemaVersion = "https://json-schema.org/draft/2020-12/schema"

type SchemaJSON struct {
	Schema      string                 `json:"schema"`
	Id          string                 `json:"id"`
	Title       *string                `json:"title,omitempty"`
	Description *string                `json:"description,omitempty"`
	Type        string                 `json:"type"`
	Properties  map[string]interface{} `json:"properties"`
}

func NewSchemaJSON(id string, title, description *string, pp map[string]interface{}) SchemaJSON {
	return SchemaJSON{
		Schema:      defaultJSONSchemaVersion,
		Id:          id,
		Title:       title,
		Description: description,
		Type:        "object",
		Properties:  pp,
	}
}

func BuildProperties(f schema.FieldList, gsMap map[id.GroupID]*schema.Schema) map[string]interface{} {
	properties := make(map[string]interface{})
	for _, field := range f {
		fieldType, format := determineTypeAndFormat(field.Type())
		fieldSchema := map[string]interface{}{
			"type":        fieldType,
			"title":       field.Name(),
			"description": field.Description(),
		}
		if format != "" {
			fieldSchema["format"] = format
		}

		field.TypeProperty().Match(schema.TypePropertyMatch{
			Text: func(f *schema.FieldText) {
				if maxLength := f.MaxLength(); maxLength != nil {
					fieldSchema["maxLength"] = *maxLength
				}
			},
			TextArea: func(f *schema.FieldTextArea) {
				if maxLength := f.MaxLength(); maxLength != nil {
					fieldSchema["maxLength"] = *maxLength
				}
			},
			RichText: func(f *schema.FieldRichText) {
				if maxLength := f.MaxLength(); maxLength != nil {
					fieldSchema["maxLength"] = *maxLength
				}
			},
			Markdown: func(f *schema.FieldMarkdown) {
				if maxLength := f.MaxLength(); maxLength != nil {
					fieldSchema["maxLength"] = *maxLength
				}
			},
			Integer: func(f *schema.FieldInteger) {
				if min := f.Min(); min != nil {
					fieldSchema["minimum"] = *min
				}
				if max := f.Max(); max != nil {
					fieldSchema["maximum"] = *max
				}
			},
			Number: func(f *schema.FieldNumber) {
				if min := f.Min(); min != nil {
					fieldSchema["minimum"] = *min
				}
				if max := f.Max(); max != nil {
					fieldSchema["maximum"] = *max
				}
			},
			Group: func(f *schema.FieldGroup) {
				if gsMap != nil {
					gs := gsMap[f.Group()]
					if gs != nil {
						fieldSchema["items"] = BuildProperties(gs.Fields(), nil)
					}
				}
			},
		})

		properties[field.Key().String()] = fieldSchema
	}
	return properties
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
