package gqlmodel

import "github.com/reearth/reearth-cms/server/pkg/value"

func ToValueType(t value.Type) SchemaFieldType {
	switch t {
	case value.TypeText:
		return SchemaFieldTypeText
	case value.TypeTextArea:
		return SchemaFieldTypeTextArea
	case value.TypeRichText:
		return SchemaFieldTypeRichText
	case value.TypeMarkdown:
		return SchemaFieldTypeMarkdownText
	case value.TypeAsset:
		return SchemaFieldTypeAsset
	case value.TypeDateTime:
		return SchemaFieldTypeDate
	case value.TypeBool:
		return SchemaFieldTypeBool
	case value.TypeCheckbox:
		return SchemaFieldTypeCheckbox
	case value.TypeTag:
		return SchemaFieldTypeTag
	case value.TypeSelect:
		return SchemaFieldTypeSelect
	case value.TypeNumber:
		return SchemaFieldTypeNumber
	case value.TypeInteger:
		return SchemaFieldTypeInteger
	case value.TypeReference:
		return SchemaFieldTypeReference
	case value.TypeURL:
		return SchemaFieldTypeURL
	case value.TypeGroup:
		return SchemaFieldTypeGroup
	case value.TypeGeometryObject:
		return SchemaFieldTypeGeometryObject
	case value.TypeGeometryEditor:
		return SchemaFieldTypeGeometryEditor
	default:
		return ""
	}
}

func FromValueType(t SchemaFieldType) value.Type {
	switch t {
	case SchemaFieldTypeText:
		return value.TypeText
	case SchemaFieldTypeTextArea:
		return value.TypeTextArea
	case SchemaFieldTypeGroup:
		return value.TypeGroup
	case SchemaFieldTypeRichText:
		return value.TypeRichText
	case SchemaFieldTypeMarkdownText:
		return value.TypeMarkdown
	case SchemaFieldTypeAsset:
		return value.TypeAsset
	case SchemaFieldTypeDate:
		return value.TypeDateTime
	case SchemaFieldTypeBool:
		return value.TypeBool
	case SchemaFieldTypeTag:
		return value.TypeTag
	case SchemaFieldTypeSelect:
		return value.TypeSelect
	case SchemaFieldTypeCheckbox:
		return value.TypeCheckbox
	case SchemaFieldTypeInteger:
		return value.TypeInteger
	case SchemaFieldTypeNumber:
		return value.TypeNumber
	case SchemaFieldTypeReference:
		return value.TypeReference
	case SchemaFieldTypeURL:
		return value.TypeURL
	case SchemaFieldTypeGeometryObject:
		return value.TypeGeometryObject
	case SchemaFieldTypeGeometryEditor:
		return value.TypeGeometryEditor
	default:
		return ""
	}
}

func ToValue(v *value.Multiple, multiple bool) any {
	if !multiple {
		return v.First().Interface()
	}
	return v.Interface()
}

func FromValue(t SchemaFieldType, v any) *value.Value {
	return FromValueType(t).Value(v)
}
