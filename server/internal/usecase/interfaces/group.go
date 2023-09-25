package interfaces

import (
	"context"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/usecasex"
)

type CreateGroupParam struct {
	ProjectId   id.ProjectID
	Name        string
	Key         string
	Description *string
}

type UpdateGroupParam struct {
	GroupID     id.GroupID
	Name        *string
	Description *string
	Key         *string
}

type Group interface {
	FindByID(context.Context, id.GroupID, *usecase.Operator) (*group.Group, error)
	FindByIDs(context.Context, id.GroupIDList, *usecase.Operator) (group.List, error)
	FindByProject(context.Context, id.ProjectID, *usecasex.Pagination, *usecase.Operator) (group.List, *usecasex.PageInfo, error)
	FindByKey(context.Context, id.ProjectID, string, *usecase.Operator) (*group.Group, error)
	Create(context.Context, CreateGroupParam, *usecase.Operator) (*group.Group, error)
	Update(context.Context, UpdateGroupParam, *usecase.Operator) (*group.Group, error)
	CheckKey(context.Context, id.ProjectID, string) (bool, error)
	Delete(context.Context, id.GroupID, *usecase.Operator) error
}
