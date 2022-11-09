package interfaces

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/usecasex"
)

var ErrItemFieldRequired = errors.New("item field required")

type ItemFieldParam struct {
	SchemaFieldID schema.FieldID
	Value         *value.Value
}

type CreateItemParam struct {
	SchemaID schema.ID
	ModelID  model.ID
	Fields   []ItemFieldParam
}

type UpdateItemParam struct {
	ItemID item.ID
	Fields []ItemFieldParam
}

type Item interface {
	FindByID(context.Context, id.ItemID, *usecase.Operator) (*item.Item, error)
	FindByIDs(context.Context, id.ItemIDList, *usecase.Operator) (item.List, error)
	FindByModel(context.Context, id.ModelID, *usecasex.Pagination, *usecase.Operator) (item.List, *usecasex.PageInfo, error)
	FindBySchema(context.Context, id.SchemaID, *usecasex.Pagination, *usecase.Operator) (item.List, *usecasex.PageInfo, error)
	FindByProject(context.Context, id.ProjectID, *usecasex.Pagination, *usecase.Operator) (item.List, *usecasex.PageInfo, error)
	Search(context.Context, *item.Query, *usecasex.Pagination, *usecase.Operator) (item.List, *usecasex.PageInfo, error)
	FindAllVersionsByID(context.Context, id.ItemID, *usecase.Operator) ([]*version.Value[*item.Item], error)
	FindPublicByID(context.Context, id.ItemID, *usecase.Operator) (*item.Item, error)
	FindPublicByModel(context.Context, id.ModelID, *usecasex.Pagination, *usecase.Operator) (item.List, *usecasex.PageInfo, error)
	Create(context.Context, CreateItemParam, *usecase.Operator) (*item.Item, error)
	Update(context.Context, UpdateItemParam, *usecase.Operator) (*item.Item, error)
	Delete(context.Context, id.ItemID, *usecase.Operator) error
}
