package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
)

type Model interface {
	Filtered(filter WorkspaceFilter) Model
	FindByIDs(context.Context, id.ModelIDList) (model.List, error)
	FindByID(context.Context, id.ModelID) (*model.Model, error)
	FindByProject(context.Context, id.ProjectID, *usecase.Pagination) (model.List, *usecase.PageInfo, error)
	FindByKey(context.Context, string) (*model.Model, error)
	CountByProject(context.Context, id.ProjectID) (int, error)
	Save(context.Context, *model.Model) error
	Remove(context.Context, id.ModelID) error
}
