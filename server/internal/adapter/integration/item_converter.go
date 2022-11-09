package integration

import (
	"github.com/deepmap/oapi-codegen/pkg/types"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
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
	return interfaces.ItemFieldParam{
		SchemaFieldID: *f.Id,
		ValueType:     fromSchemaFieldType(f.Type),
		Value:         f.Value,
	}
}

func fromSchemaFieldType(t *integrationapi.FieldType) schema.Type {
	if t == nil {
		return ""
	}
	switch *t {
	case integrationapi.FieldTypeText:
		return schema.TypeText
	case integrationapi.FieldTypeTextArea:
		return schema.TypeTextArea
	case integrationapi.FieldTypeRichText:
		return schema.TypeRichText
	case integrationapi.FieldTypeMarkdown:
		return schema.TypeMarkdown
	case integrationapi.FieldTypeAsset:
		return schema.TypeAsset
	case integrationapi.FieldTypeDate:
		return schema.TypeDate
	case integrationapi.FieldTypeBool:
		return schema.TypeBool
	case integrationapi.FieldTypeSelect:
		return schema.TypeSelect
	case integrationapi.FieldTypeTag:
		return schema.TypeTag
	case integrationapi.FieldTypeInteger:
		return schema.TypeInteger
	case integrationapi.FieldTypeReference:
		return schema.TypeReference
	case integrationapi.FieldTypeUrl:
		return schema.TypeURL
	default:
		return ""
	}
}
