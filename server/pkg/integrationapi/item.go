package integrationapi

import (
	"github.com/deepmap/oapi-codegen/pkg/types"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/samber/lo"
)

func NewVersionedItem(ver item.Versioned) Item {
	ps := lo.Map(ver.Parents().Values(), func(v version.Version, _ int) types.UUID {
		return types.UUID(v)
	})
	rs := lo.Map(ver.Refs().Values(), func(r version.Ref, _ int) string {
		return string(r)
	})

	i := NewItem(ver.Value())
	i.Parents = &ps
	i.Refs = &rs
	i.Version = lo.ToPtr(types.UUID(ver.Version()))
	return i
}

func NewItem(i *item.Item) Item {
	fs := lo.Map(i.Fields(), func(f *item.Field, _ int) Field {
		return Field{
			Id:    f.SchemaFieldID().Ref(),
			Type:  lo.ToPtr(FieldType(f.ValueType())),
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

func FromSchemaFieldType(t *FieldType) schema.Type {
	if t == nil {
		return ""
	}
	switch *t {
	case FieldTypeText:
		return schema.TypeText
	case FieldTypeTextArea:
		return schema.TypeTextArea
	case FieldTypeRichText:
		return schema.TypeRichText
	case FieldTypeMarkdown:
		return schema.TypeMarkdown
	case FieldTypeAsset:
		return schema.TypeAsset
	case FieldTypeDate:
		return schema.TypeDate
	case FieldTypeBool:
		return schema.TypeBool
	case FieldTypeSelect:
		return schema.TypeSelect
	case FieldTypeTag:
		return schema.TypeTag
	case FieldTypeInteger:
		return schema.TypeInteger
	case FieldTypeReference:
		return schema.TypeReference
	case FieldTypeUrl:
		return schema.TypeURL
	default:
		return ""
	}
}
