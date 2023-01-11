package interfaces

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearthx/usecasex"
)

var ErrDuplicatedKey = errors.New("duplicated key")

type CreateModelParam struct {
	ProjectId   id.ProjectID
	Name        *string
	Description *string
	Key         *string
	Public      *bool
}

type UpdateModelParam struct {
	ModelId     id.ModelID
	Name        *string
	Description *string
	Key         *string
	Public      *bool
}

var (
	ErrModelKey error = errors.New("model key is already used by another model")
)

type Model interface {
	FindByID(context.Context, id.ModelID, *usecase.Operator) (*model.Model, error)
	FindByIDs(context.Context, []id.ModelID, *usecase.Operator) (model.List, error)
	FindByProject(context.Context, id.ProjectID, *usecasex.Pagination, *usecase.Operator) (model.List, *usecasex.PageInfo, error)
	FindByKey(context.Context, id.ProjectID, string, *usecase.Operator) (*model.Model, error)
	FindByIDOrKey(context.Context, id.ProjectID, model.IDOrKey, *usecase.Operator) (*model.Model, error)
	Create(context.Context, CreateModelParam, *usecase.Operator) (*model.Model, error)
	Update(context.Context, UpdateModelParam, *usecase.Operator) (*model.Model, error)
	CheckKey(context.Context, id.ProjectID, string) (bool, error)
	Delete(context.Context, id.ModelID, *usecase.Operator) error
	Publish(context.Context, id.ModelID, bool, *usecase.Operator) (bool, error)
}
