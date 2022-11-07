package gqlmodel

import "github.com/reearth/reearth-cms/server/pkg/value"

func FromValueType(t ValueType) value.Type {
	switch t {
	case ValueTypeText:
		return value.TypeText
	case ValueTypeTextArea:
		return value.TypeTextArea
	case ValueTypeRichText:
		return value.TypeRichText
	case ValueTypeMarkdownText:
		return value.TypeMarkdown
	case ValueTypeAsset:
		return value.TypeAsset
	case ValueTypeDate:
		return value.TypeDate
	case ValueTypeBool:
		return value.TypeBool
	case ValueTypeSelect:
		return value.TypeSelect
	case ValueTypeTag:
		return value.TypeTag
	case ValueTypeInteger:
		return value.TypeInteger
	case ValueTypeReference:
		return value.TypeReference
	case ValueTypeURL:
		return value.TypeURL
	default:
		return ""
	}
}

func ToValueType(t value.Type) ValueType {
	switch t {
	case value.TypeText:
		return ValueTypeText
	case value.TypeTextArea:
		return ValueTypeTextArea
	case value.TypeRichText:
		return ValueTypeRichText
	case value.TypeMarkdown:
		return ValueTypeMarkdownText
	case value.TypeAsset:
		return ValueTypeAsset
	case value.TypeDate:
		return ValueTypeDate
	case value.TypeBool:
		return ValueTypeBool
	case value.TypeSelect:
		return ValueTypeSelect
	case value.TypeTag:
		return ValueTypeTag
	case value.TypeInteger:
		return ValueTypeInteger
	case value.TypeReference:
		return ValueTypeReference
	case value.TypeURL:
		return ValueTypeURL
	default:
		return ""
	}
}
