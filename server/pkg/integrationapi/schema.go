package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/samber/lo"
)

type ItemAndSchema struct {
	Item   Item   `json:"item"`
	Schema Schema `json:"schema"`
}

func NewItemAndSchema(i item.ItemAndSchema) ItemAndSchema {
	return ItemAndSchema{
		Item:   NewItem(i.Item),
		Schema: NewSchema(i.Schema),
	}
}

func NewSchema(i *schema.Schema) Schema {
	fs := lo.Map(i.Fields(), func(f *schema.Field, _ int) SchemaField {
		return SchemaField{
			Id:       f.ID().Ref(),
			Type:     lo.ToPtr(ValueType(f.Type())),
			Key:      lo.ToPtr(f.Key().String()),
			Required: lo.ToPtr(f.Required()),
		}
	})

	return Schema{
		Id:        i.ID().Ref(),
		ProjectId: i.Project().Ref(),
		Fields:    &fs,
		CreatedAt: ToDate(i.ID().Timestamp()),
	}
}
