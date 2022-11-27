package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearthx/usecasex"
)

type RequestFilter struct {
	State      *request.State
	Keyword    *string
	Pagination *usecasex.Pagination
}

type Request interface {
	Filtered(ProjectFilter) Request
	FindByProject(context.Context, id.ProjectID, RequestFilter) ([]*request.Request, *usecasex.PageInfo, error)
	FindByID(context.Context, id.RequestID) (*request.Request, error)
	FindByIDs(context.Context, id.RequestIDList) ([]*request.Request, error)
	Save(context.Context, *request.Request) error
	Remove(context.Context, id.RequestID) error
}
