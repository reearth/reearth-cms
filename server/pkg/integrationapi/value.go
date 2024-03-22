package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
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
	case ValueTypeTag:
		return value.TypeTag
	case ValueTypeGroup:
		return value.TypeGroup
	default:
		return value.TypeUnknown
	}
}

func NewValueType(t value.Type) ValueType {
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
	case value.TypeGroup:
		return ValueTypeGroup
	case value.TypeTag:
		return ValueTypeTag
	case value.TypeCheckbox:
		return ValueTypeCheckbox
	default:
		return ""
	}
}

func NewValues(v *value.Multiple, sf *schema.Field, cc *ConvertContext) any {
	if !sf.Multiple() {
		return NewValue(v.First(), sf, cc)
	}
	return lo.Map(v.Values(), func(v *value.Value, _ int) any {
		return NewValue(v, sf, cc)
	})
}

func NewValue(v *value.Value, sf *schema.Field, cc *ConvertContext) any {
	if sf.Type() == value.TypeAsset && cc.ShouldEmbedAsset() {
		if aid, ok := v.ValueAsset(); ok {
			return cc.ResolveAsset(aid)
		}
	}

	if sf.Type() == value.TypeTag {
		var tag *schema.FieldTag
		sf.TypeProperty().Match(schema.TypePropertyMatch{
			Tag: func(f *schema.FieldTag) {
				tag = f
			},
		})
		str, ok := v.ValueString()
		if !ok {
			return nil
		}
		tid, err := id.TagIDFrom(str)
		if err != nil {
			return nil
		}
		res := tag.Tags().FindByID(tid)
		return TagResponse{
			Color: lo.ToPtr(res.Color().String()),
			Id:    res.ID().Ref(),
			Name:  lo.ToPtr(res.Name()),
		}
	}
	return v.Interface()
}
