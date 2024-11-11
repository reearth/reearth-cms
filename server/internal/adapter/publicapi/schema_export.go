package publicapi

import (
	"context"

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
	if err != nil {
		return SchemaJSON{}, err
	}

	if !m.Public() {
		return SchemaJSON{}, rerror.ErrNotFound
	}

	sp, err := c.usecases.Schema.FindByModel(ctx, m.ID(), nil)
	if err != nil {
		return SchemaJSON{}, err
	}

	return NewSchemaJSON(m, sp.Schema()), nil
}

func toSchemaJSONProperties(f schema.FieldList) *map[string]interface{} {
	properties := make(map[string]interface{})
	for _, field := range f {
		fieldType, format := toSchemaJSONTypeAndFormat(field.Type())
		fieldSchema := map[string]interface{}{
			"type":        fieldType,
			"title":       field.Name(),
			"description": field.Description(),
		}
		if format != "" {
			fieldSchema["format"] = format
		}
		properties[field.Key().String()] = fieldSchema
	}
	return &properties
}

func toSchemaJSONTypeAndFormat(t value.Type) (string, string) {
	switch t {
	case "text", "textArea", "richText", "markdown", "select", "tag", "asset", "reference":
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
	case "group":
		return "array", ""
	case "geometryObject", "geometryEditor":
		return "object", ""
	default:
		return "string", ""
	}
}
