package integrationapi

import "github.com/reearth/reearth-cms/server/pkg/item"

type ItemAndSchema struct {
	Item Item `json:"item"`
	// Schema *Schema `json:"schema"`
}

func NewItemAndSchema(i item.ItemAndSchema) ItemAndSchema {
	return ItemAndSchema{
		Item: NewItem(i.Item),
		// Schema: NewSchema(i.Schema),
	}
}
