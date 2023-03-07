package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
)

func FromValueType(t *ValueType) value.Type {
	if t == nil {
		return ""
	}
	switch *t {
	case ValueTypeText:
		return value.TypeText
	case ValueTypeTextArea:
		return value.TypeTextArea
	case ValueTypeRichText:
		return value.TypeRichText
	case ValueTypeMarkdown:
		return value.TypeMarkdown
	case ValueTypeAsset:
		return value.TypeAsset
	case ValueTypeDate:
		return value.TypeDateTime
	case ValueTypeBool:
		return value.TypeBool
	case ValueTypeSelect:
		return value.TypeSelect
	case ValueTypeInteger:
		return value.TypeInteger
	case ValueTypeReference:
		return value.TypeReference
	case ValueTypeUrl:
		return value.TypeURL
	default:
		return value.TypeUnknown
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
		return ValueTypeMarkdown
	case value.TypeAsset:
		return ValueTypeAsset
	case value.TypeDateTime:
		return ValueTypeDate
	case value.TypeBool:
		return ValueTypeBool
	case value.TypeSelect:
		return ValueTypeSelect
	case value.TypeInteger:
		return ValueTypeInteger
	case value.TypeReference:
		return ValueTypeReference
	case value.TypeURL:
		return ValueTypeUrl
	default:
		return ""
	}
}

func ToValues(v *value.Multiple, multiple bool, assets asset.Map) any {
	if !multiple {
		return ToValue(v.First(), assets)
	}
	return lo.Map(v.Values(), func(v *value.Value, _ int) any {
		return ToValue(v, assets)
	})
}

func ToValue(v *value.Value, assets asset.Map) any {
	if assets != nil {
		if aid, ok := v.ValueAsset(); ok {
			if a, ok := assets[aid]; ok {
				return a
			}
		}
	}

	return v.Interface()
}
