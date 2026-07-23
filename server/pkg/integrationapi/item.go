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
	itemFields := fieldsFrom(i.Fields(), append(sgl, s).Fields(), assets)

	var metaFields *[]Field
	if mi != nil && ms != nil {
		metaFields = new(fieldsFrom(mi.Value().Fields(), ms.Fields(), assets))
	}

	return VersionedItem{
		Id:              i.ID().Ref(),
		ModelId:         i.Model().Ref().StringRef(),
		MetadataItemId:  i.MetadataItem(),
		OriginalItemId:  i.OriginalItem(),
		IsMetadata:      new(i.IsMetadata()),
		Fields:          &itemFields,
		MetadataFields:  metaFields,
		ReferencedItems: f,
		CreatedAt:       new(i.ID().Timestamp()),
		UpdatedAt:       new(i.Timestamp()),

		Version: new(types.UUID(ver.Version())),
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
		IsMetadata:      new(i.IsMetadata()),
		Fields:          &itemFields,
		MetadataFields:  nil,
		ReferencedItems: nil,
		CreatedAt:       new(i.ID().Timestamp()),
		UpdatedAt:       new(i.Timestamp()),
	}
}

func fieldsFrom(iFields item.Fields, sFields schema.FieldList, assets *AssetContext) []Field {
	fs := lo.FilterMap(iFields, func(f *item.Field, _ int) (Field, bool) {
		sf := sFields.Find(f.FieldID())
		if sf == nil {
			return Field{}, false
		}

		return Field{
			Id:    f.FieldID().Ref(),
			Type:  new(ToValueType(f.Type())),
			Value: new(ToValues(f.Value(), sf, assets)),
			Key:   util.ToPtrIfNotEmpty(sf.Key().String()),
			Group: f.ItemGroup(),
		}, true
	})
	return fs
}
