package integration

import (
	"github.com/deepmap/oapi-codegen/pkg/types"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/samber/lo"
)

func toItem(i *item.Item, ver *version.Value[*item.Item], mId model.ID) integrationapi.Item {
	fs := lo.Map(i.Fields(), func(f *item.Field, _ int) integrationapi.Field {
		return integrationapi.Field{
			Id:    f.SchemaFieldID().Ref(),
			Type:  lo.ToPtr(integrationapi.FieldType(f.ValueType())),
			Value: lo.ToPtr(f.Value()),
		}
	})
	ps := lo.Map(ver.Parents().Values(), func(v version.Version, _ int) types.UUID {
		return types.UUID(v)
	})
	rs := lo.Map(ver.Refs().Values(), func(r version.Ref, _ int) string {
		return string(r)
	})
	return integrationapi.Item{
		Id:        lo.ToPtr(i.ID()),
		ModelId:   lo.ToPtr(mId),
		Archived:  lo.ToPtr(ver.Value() == nil),
		Fields:    &fs,
		CreatedAt: &types.Date{Time: i.Timestamp()},
		UpdatedAt: &types.Date{Time: ver.Value().Timestamp()},
		Parents:   &ps,
		Refs:      &rs,
		Version:   lo.ToPtr(types.UUID(ver.Version())),
	}
}

func toItemFieldParam(f integrationapi.Field) interfaces.ItemFieldParam {
	var v any = f.Value
	if f.Value != nil {
		v = *f.Value
	}
	return interfaces.ItemFieldParam{
		SchemaFieldID: *f.Id,
		Value:         v,
	}
}
