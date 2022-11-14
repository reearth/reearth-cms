package integrationapi

import (
	"github.com/deepmap/oapi-codegen/pkg/types"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/samber/lo"
)

func NewVersionedItem(ver item.Versioned) VersionedItem {
	ps := lo.Map(ver.Parents().Values(), func(v version.Version, _ int) types.UUID {
		return types.UUID(v)
	})
	rs := lo.Map(ver.Refs().Values(), func(r version.Ref, _ int) string {
		return string(r)
	})

	ii := NewItem(ver.Value())
	return VersionedItem{
		Id:        ii.Id,
		CreatedAt: ii.CreatedAt,
		UpdatedAt: ii.UpdatedAt,
		Fields:    ii.Fields,
		ModelId:   ii.ModelId,
		Parents:   &ps,
		Refs:      &rs,
		Version:   lo.ToPtr(types.UUID(ver.Version())),
	}
}

func NewItem(i *item.Item) Item {
	fs := lo.Map(i.Fields(), func(f *item.Field, _ int) Field {
		return Field{
			Id:    f.SchemaFieldID().Ref(),
			Type:  lo.ToPtr(ValueType(f.ValueType())),
			Value: lo.ToPtr(f.Value()),
		}
	})

	return Item{
		Id:        i.ID().Ref(),
		ModelId:   i.Model().Ref(),
		Fields:    &fs,
		CreatedAt: ToDate(i.ID().Timestamp()),
		UpdatedAt: ToDate(i.Timestamp()),
	}
}

func FromSchemaFieldType(t *ValueType) schema.Type {
	if t == nil {
		return ""
	}
	switch *t {
	case ValueTypeText:
		return schema.TypeText
	case ValueTypeTextArea:
		return schema.TypeTextArea
	case ValueTypeRichText:
		return schema.TypeRichText
	case ValueTypeMarkdown:
		return schema.TypeMarkdown
	case ValueTypeAsset:
		return schema.TypeAsset
	case ValueTypeDate:
		return schema.TypeDate
	case ValueTypeBool:
		return schema.TypeBool
	case ValueTypeSelect:
		return schema.TypeSelect
	case ValueTypeTag:
		return schema.TypeTag
	case ValueTypeInteger:
		return schema.TypeInteger
	case ValueTypeReference:
		return schema.TypeReference
	case ValueTypeUrl:
		return schema.TypeURL
	default:
		return ""
	}
}
