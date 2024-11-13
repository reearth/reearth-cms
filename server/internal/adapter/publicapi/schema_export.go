package publicapi

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/rerror"
)

func (c *Controller) GetSchemaJSON(ctx context.Context, pKey, mKey string) (SchemaJSON, error) {
	pr, err := c.checkProject(ctx, pKey)
	if err != nil {
		return SchemaJSON{}, err
	}

	m, err := c.usecases.Model.FindByIDOrKey(ctx, pr.ID(), model.IDOrKey(mKey), nil)
	if err != nil || !m.Public() {
		return SchemaJSON{}, rerror.ErrNotFound
	}

	sp, err := c.usecases.Schema.FindByModel(ctx, m.ID(), nil)
	if err != nil {
		return SchemaJSON{}, rerror.ErrNotFound
	}

	return NewSchemaJSON(m, buildProperties(c.usecases, sp.Schema().Fields(), ctx)), nil
}

func buildProperties(uc *interfaces.Container, f schema.FieldList, ctx context.Context) *map[string]interface{} {
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

		var maxLength *int
		field.TypeProperty().Match(schema.TypePropertyMatch{
			Text: func(f *schema.FieldText) {
				if maxLength = f.MaxLength(); maxLength != nil {
					fieldSchema["maxLength"] = *maxLength
				}
			},
			TextArea: func(f *schema.FieldTextArea) {
				if maxLength = f.MaxLength(); maxLength != nil {
					fieldSchema["maxLength"] = *maxLength
				}
			},
			RichText: func(f *schema.FieldRichText) {
				if maxLength = f.MaxLength(); maxLength != nil {
					fieldSchema["maxLength"] = *maxLength
				}
			},
			Markdown: func(f *schema.FieldMarkdown) {
				if maxLength = f.MaxLength(); maxLength != nil {
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
				gs, _ := uc.Schema.FindByGroup(ctx, f.Group(), nil)
				if gs != nil {
					fieldSchema["items"] = buildProperties(uc, gs.Fields(), ctx)
				}
			},
		})

		properties[field.Key().String()] = fieldSchema
	}
	return &properties
}

func determineTypeAndFormat(t value.Type) (string, string) {
	switch t {
	case "text", "textArea", "richText", "markdown", "select", "tag", "reference":
		return "string", ""
	case "integer":
		return "integer", ""
	case "number":
		return "number", ""
	case "bool", "checkbox":
		return "boolean", ""
	case "date":
		return "string", "date"
	case "url":
		return "string", "uri"
	case "asset":
		return "string", "binary"
	case "group":
		return "array", ""
	case "geometryObject", "geometryEditor":
		return "object", ""
	default:
		return "string", ""
	}
}
