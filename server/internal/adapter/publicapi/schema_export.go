package publicapi

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
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

	gsMap := buildGroupSchemaMap(ctx, sp.Schema(), c.usecases)
	return NewSchemaJSON(m, buildProperties(sp.Schema().Fields(), gsMap)), nil
}

func buildProperties(fields schema.FieldList, gsMap map[id.GroupID]*schema.Schema) *map[string]interface{} {
	properties := make(map[string]interface{})
	for _, field := range fields {
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
			Text:     func(f *schema.FieldText) { addMaxLength(fieldSchema, f.MaxLength()) },
			TextArea: func(f *schema.FieldTextArea) { addMaxLength(fieldSchema, f.MaxLength()) },
			RichText: func(f *schema.FieldRichText) { addMaxLength(fieldSchema, f.MaxLength()) },
			Markdown: func(f *schema.FieldMarkdown) { addMaxLength(fieldSchema, f.MaxLength()) },
			Integer:  func(f *schema.FieldInteger) { addMinMax(fieldSchema, f.Min(), f.Max()) },
			Number:   func(f *schema.FieldNumber) { addMinMax(fieldSchema, f.Min(), f.Max()) },
			Group:    func(f *schema.FieldGroup) { addGroupItems(fieldSchema, gsMap[f.Group()]) },
		})
		properties[field.Key().String()] = fieldSchema
	}
	return &properties
}

func addMaxLength(schemaMap map[string]interface{}, maxLength *int) {
	if maxLength != nil {
		schemaMap["maxLength"] = *maxLength
	}
}

func addMinMax(schemaMap map[string]interface{}, min, max interface{}) {
	switch minVal := min.(type) {
	case *int64:
		if minVal != nil {
			schemaMap["minimum"] = *minVal
		}
	case *float64:
		if minVal != nil {
			schemaMap["minimum"] = *minVal
		}
	}
	switch maxVal := max.(type) {
	case *int64:
		if maxVal != nil {
			schemaMap["maximum"] = *maxVal
		}
	case *float64:
		if maxVal != nil {
			schemaMap["maximum"] = *maxVal
		}
	}
}

func addGroupItems(fieldSchema map[string]interface{}, gs *schema.Schema) {
	if gs != nil {
		fieldSchema["items"] = buildProperties(gs.Fields(), nil)
	}
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

func buildGroupSchemaMap(ctx context.Context, sch *schema.Schema, uc *interfaces.Container) map[id.GroupID]*schema.Schema {
	groupSchemaMap := make(map[id.GroupID]*schema.Schema)
	for _, field := range sch.Fields() {
		field.TypeProperty().Match(schema.TypePropertyMatch{
			Group: func(fg *schema.FieldGroup) {
				groupSchema, err := uc.Schema.FindByGroup(ctx, fg.Group(), nil)
				if err == nil {
					groupSchemaMap[fg.Group()] = groupSchema
				}
			},
		})
	}
	return groupSchemaMap
}
