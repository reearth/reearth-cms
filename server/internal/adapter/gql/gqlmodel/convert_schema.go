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
		TypeProperty: nil,
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
