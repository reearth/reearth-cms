package gqlmodel

import "github.com/reearth/reearth-cms/server/pkg/value"

func ToValueType(t value.Type) SchemaFiledType {
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

func FromValueType(t SchemaFiledType) value.Type {
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

func ToValue(v *value.Optional) any {
	return v.Value().Interface()
}
