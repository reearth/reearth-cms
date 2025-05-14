package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/usecasex"
)

type Group interface {
	Filtered(ProjectFilter) Group
	FindByID(context.Context, id.GroupID) (*group.Group, error)
	FindByIDs(context.Context, id.GroupIDList) (group.List, error)
	Filter(context.Context, id.ProjectID, *group.Sort, *usecasex.Pagination) (group.List, *usecasex.PageInfo, error)
	FindByProject(context.Context, id.ProjectID) (group.List, error)
	FindByIDOrKey(context.Context, id.ProjectID, group.IDOrKey) (*group.Group, error)
	FindByKey(context.Context, id.ProjectID, string) (*group.Group, error)
	Save(context.Context, *group.Group) error
	SaveAll(context.Context, group.List) error
	Remove(context.Context, id.GroupID) error
}
