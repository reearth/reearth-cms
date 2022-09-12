package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
)

func ToItem(i *item.Item) *Item {
	if i == nil {
		return nil
	}

	var fs []*ItemField
	for _, f := range i.Fields() {
		fs = append(fs, &ItemField{
			SchemaFieldID: IDFrom(f.SchemaFieldID()),
			Type:          ToSchemaFieldType(f.ValueType()),
			Value:         f.Value(),
		})
	}

	return &Item{
		ID:       IDFrom(i.ID()),
		SchemaID: IDFrom(i.Schema()),
		Fields:   fs,
	}
}

func ToItemParam(field *ItemFieldInput) (res interfaces.ItemFieldParam) {
	if field == nil {
		return
	}
	fid, err := ToID[id.Field](field.SchemaFieldID)
	if err != nil {
		return
	}

	res = interfaces.ItemFieldParam{
		SchemaFieldID: fid,
		ValueType:     FromSchemaFieldType(field.Type),
		Value:         field.Value,
	}
	return
}
