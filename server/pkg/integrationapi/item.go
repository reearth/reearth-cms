package integrationapi

import (
	"github.com/deepmap/oapi-codegen/pkg/types"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

func NewVersionedItem(ver item.Versioned, s *schema.Schema, assets *AssetContext) VersionedItem {
	ps := lo.Map(ver.Parents().Values(), func(v version.Version, _ int) types.UUID {
		return types.UUID(v)
	})
	rs := lo.Map(ver.Refs().Values(), func(r version.Ref, _ int) string {
		return string(r)
	})

	ii := NewItem(ver.Value(), s, assets)
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

func NewItem(i *item.Item, s *schema.Schema, assets *AssetContext) Item {
	fs := lo.FilterMap(i.Fields(), func(f *item.Field, _ int) (Field, bool) {
		if s == nil {
			return Field{}, false
		}
		sf := s.Field(f.FieldID())
		if sf == nil {
			return Field{}, false
		}

		return Field{
			Id:    f.FieldID().Ref(),
			Type:  lo.ToPtr(ToValueType(f.Type())),
			Value: lo.ToPtr(ToValues(f.Value(), sf.Multiple(), assets)),
			Key:   util.ToPtrIfNotEmpty(sf.Key().String()),
		}, true
	})

	return Item{
		Id:        i.ID().Ref(),
		ModelId:   i.Model().Ref().StringRef(),
		Fields:    &fs,
		CreatedAt: lo.ToPtr(i.ID().Timestamp()),
		UpdatedAt: lo.ToPtr(i.Timestamp()),
	}
}

func NewVersionedItemWithPreviousValue(ver item.Versioned, original item.Versioned, s *schema.Schema, assets *AssetContext) VersionedItemWithPreviousValue {
	ps := lo.Map(ver.Parents().Values(), func(v version.Version, _ int) types.UUID {
		return types.UUID(v)
	})
	rs := lo.Map(ver.Refs().Values(), func(r version.Ref, _ int) string {
		return string(r)
	})

	ii := NewItemWithPreviousValue(ver.Value(), original.Value(), s, assets)
	return VersionedItemWithPreviousValue{
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

func NewItemWithPreviousValue(i *item.Item, o *item.Item, s *schema.Schema, assets *AssetContext) ItemWithPreviousValue {
	fs := lo.FilterMap(i.Fields(), func(f *item.Field, _ int) (FieldWithPreviousValue, bool) {
		if s == nil {
			return FieldWithPreviousValue{}, false
		}
		sf := s.Field(f.FieldID())
		if sf == nil {
			return FieldWithPreviousValue{}, false
		}
		ii, _ := lo.Find(o.Fields(), func(field *item.Field) bool {
			return field.FieldID() == f.FieldID() && !field.Value().Equal(f.Value())
		})

		res := FieldWithPreviousValue{
			Id:    f.FieldID().Ref(),
			Type:  lo.ToPtr(ToValueType(f.Type())),
			Value: lo.ToPtr(ToValues(f.Value(), sf.Multiple(), assets)),
			Key:   util.ToPtrIfNotEmpty(sf.Key().String()),
		}

		if ii != nil {
			res.OldValue = lo.ToPtr(ToValues(ii.Value(), sf.Multiple(), assets))
		}
		return res, true
	})

	return ItemWithPreviousValue{
		Id:        i.ID().Ref(),
		ModelId:   i.Model().Ref().StringRef(),
		Fields:    &fs,
		CreatedAt: lo.ToPtr(i.ID().Timestamp()),
		UpdatedAt: lo.ToPtr(i.Timestamp()),
	}
}
