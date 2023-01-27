package interfaces

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

var (
	ErrItemFieldRequired   = rerror.NewE(i18n.T("item field required"))
	ErrInvalidField        = rerror.NewE(i18n.T("invalid field"))
	ErrDuplicatedItemValue = rerror.NewE(i18n.T("duplicated value"))
	ErrFieldValueExist     = rerror.NewE(i18n.T("field value exist"))
)

type ItemFieldParam struct {
	Field *item.FieldID
	Key   *key.Key
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
	FindPublicByID(context.Context, id.ItemID, *usecase.Operator) (item.Versioned, error)
	FindByIDs(context.Context, id.ItemIDList, *usecase.Operator) (item.VersionedList, error)
	ItemStatus(context.Context, id.ItemIDList, *usecase.Operator) (map[id.ItemID]item.Status, error)
	FindBySchema(context.Context, id.SchemaID, *item.Sort, *usecasex.Pagination, *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error)
	FindByModel(context.Context, id.ModelID, *usecasex.Pagination, *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error)
	FindPublicByModel(context.Context, id.ModelID, *usecasex.Pagination, *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error)
	FindByProject(context.Context, id.ProjectID, *usecasex.Pagination, *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error)
	Search(context.Context, *item.Query, *item.Sort, *usecasex.Pagination, *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error)
	FindAllVersionsByID(context.Context, id.ItemID, *usecase.Operator) (item.VersionedList, error)
	Create(context.Context, CreateItemParam, *usecase.Operator) (item.Versioned, error)
	Update(context.Context, UpdateItemParam, *usecase.Operator) (item.Versioned, error)
	Delete(context.Context, id.ItemID, *usecase.Operator) error
}
