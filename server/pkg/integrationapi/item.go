package integrationapi

import (
	"github.com/oapi-codegen/runtime/types"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

func NewVersionedItem(ver item.Versioned, s *schema.Schema, assets *AssetContext, f *[]VersionedItem, ms *schema.Schema, mi item.Versioned, sgl schema.List) VersionedItem {
	ps := lo.Map(ver.Parents().Values(), func(v version.Version, _ int) types.UUID {
		return types.UUID(v)
	})
	rs := lo.Map(ver.Refs().Values(), func(r version.Ref, _ int) string {
		return string(r)
	})

	i := ver.Value()
	itemFields := fieldsFrom(i.Fields(), s.Fields(), assets)

	var metaFields *[]Field
	if mi != nil && ms != nil {
		metaFields = lo.ToPtr(fieldsFrom(mi.Value().Fields(), ms.Fields(), assets))
	}

	return VersionedItem{
		Id:              i.ID().Ref(),
		ModelId:         i.Model().Ref().StringRef(),
		MetadataItemId:  i.MetadataItem(),
		OriginalItemId:  i.OriginalItem(),
		IsMetadata:      lo.ToPtr(i.IsMetadata()),
		Fields:          &itemFields,
		MetadataFields:  metaFields,
		ReferencedItems: f,
		CreatedAt:       lo.ToPtr(i.ID().Timestamp()),
		UpdatedAt:       lo.ToPtr(i.Timestamp()),

		Version: lo.ToPtr(types.UUID(ver.Version())),
		Parents: &ps,
		Refs:    &rs,
	}
}

func NewItem(i *item.Item, ss schema.List, assets *AssetContext) Item {
	itemFields := fieldsFrom(i.Fields(), ss.Fields(), assets)

	return Item{
		Id:              i.ID().Ref(),
		ModelId:         i.Model().Ref().StringRef(),
		MetadataItemId:  i.MetadataItem(),
		OriginalItemId:  i.OriginalItem(),
		IsMetadata:      lo.ToPtr(i.IsMetadata()),
		Fields:          &itemFields,
		MetadataFields:  nil,
		ReferencedItems: nil,
		CreatedAt:       lo.ToPtr(i.ID().Timestamp()),
		UpdatedAt:       lo.ToPtr(i.Timestamp()),
	}
}

func fieldsFrom(iFields item.Fields, sFields schema.FieldList, assets *AssetContext) []Field {
	fs := lo.FilterMap(sFields, func(sf *schema.Field, _ int) (Field, bool) {
		f := iFields.Field(sf.ID())
		if f == nil {
			return Field{}, false
		}

		return Field{
			Id:    f.FieldID().Ref(),
			Type:  lo.ToPtr(ToValueType(f.Type())),
			Value: lo.ToPtr(ToValues(f.Value(), sf, assets)),
			Key:   util.ToPtrIfNotEmpty(sf.Key().String()),
			Group: f.ItemGroup(),
		}, true
	})
	return fs
}
