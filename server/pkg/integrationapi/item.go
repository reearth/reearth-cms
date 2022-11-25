package integrationapi

import (
	"github.com/deepmap/oapi-codegen/pkg/types"
	"github.com/reearth/reearth-cms/server/pkg/item"
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
			Id:    f.FieldID().Ref(),
			Type:  lo.ToPtr(ToValueType(f.Type())),
			Value: lo.ToPtr(ToValue(f.Value())),
		}
	})

	return Item{
		Id:        i.ID().Ref(),
		ModelId:   i.Model().Ref().StringRef(),
		Fields:    &fs,
		CreatedAt: lo.ToPtr(i.ID().Timestamp()),
		UpdatedAt: lo.ToPtr(i.Timestamp()),
	}
}
