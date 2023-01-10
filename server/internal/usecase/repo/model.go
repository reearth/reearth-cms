package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearthx/usecasex"
)

type Model interface {
	Filtered(ProjectFilter) Model
	FindByID(context.Context, id.ModelID) (*model.Model, error)
	FindByIDs(context.Context, id.ModelIDList) (model.List, error)
	FindByProject(context.Context, id.ProjectID, *usecasex.Pagination) (model.List, *usecasex.PageInfo, error)
	FindByKey(context.Context, id.ProjectID, string) (*model.Model, error)
	FindByIDOrKey(context.Context, *id.ModelID, *key.Key, id.ProjectIDList) (*model.Model, error)
	CountByProject(context.Context, id.ProjectID) (int, error)
	Save(context.Context, *model.Model) error
	Remove(context.Context, id.ModelID) error
}
