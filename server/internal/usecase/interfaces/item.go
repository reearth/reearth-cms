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
	"github.com/reearth/reearthx/usecasex"
)

var (
	ErrItemFieldRequired = errors.New("item field required")
	ErrFieldValueExist   = errors.New("field value exist")
)

type ItemFieldParam struct {
	Field item.FieldID
	Type  value.Type
	Value any
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
	FindByID(context.Context, id.ItemID, *usecase.Operator) (item.Versioned, error)
	FindByIDs(context.Context, id.ItemIDList, *usecase.Operator) (item.VersionedList, error)
	FindBySchema(context.Context, id.SchemaID, *usecasex.Pagination, *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error)
	FindByProject(context.Context, id.ProjectID, *usecasex.Pagination, *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error)
	Search(context.Context, *item.Query, *usecasex.Pagination, *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error)
	FindAllVersionsByID(context.Context, id.ItemID, *usecase.Operator) (item.VersionedList, error)
	Create(context.Context, CreateItemParam, *usecase.Operator) (item.Versioned, error)
	Update(context.Context, UpdateItemParam, *usecase.Operator) (item.Versioned, error)
	Delete(context.Context, id.ItemID, *usecase.Operator) error
}
