package interfaces

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
)

type CreateItemParam struct {
	ItemID   id.ItemID
	SchemaID schema.ID
	Fields   []*item.Field
}

type ItemFieldParam struct {
	ItemID        id.ItemID
	SchemaFieldID schema.FieldID
	ValueType     schema.Type
	Value         any
}
type Item interface {
	FindByIDs(context.Context, []id.ItemID, *usecase.Operator) (item.List, error)
	FindByID(context.Context, id.ItemID, *usecase.Operator) (*item.Item, error)
	Create(context.Context, CreateItemParam, *usecase.Operator) (*item.Item, error)
	AddField(context.Context, ItemFieldParam, *usecase.Operator) (*item.Item, error)
	RemoveField(context.Context, ItemFieldParam, *usecase.Operator) (*item.Item, error)
	Delete(context.Context, id.ItemID, *usecase.Operator) error
}
