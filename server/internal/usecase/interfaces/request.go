package interfaces

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearthx/usecasex"
)

type CreateRequestParam struct {
	ProjectID   id.ProjectID
	Title       string
	Description *string
	State       *request.State
	Reviewers   id.UserIDList
	Items       []*request.Item
}

type UpdateRequestParam struct {
	RequestID   id.RequestID
	Title       *string
	Description *string
	State       *request.State
	Reviewers   id.UserIDList
	Items       []*request.Item
}

type RequestFilter struct {
	Keyword *string
	State   *request.State
}

type Request interface {
	FindByID(context.Context, id.RequestID, *usecase.Operator) (*request.Request, error)
	FindByIDs(context.Context, id.RequestIDList, *usecase.Operator) ([]*request.Request, error)
	FindByProject(context.Context, id.ProjectID, RequestFilter, *usecasex.Pagination, *usecase.Operator) ([]*request.Request, *usecasex.PageInfo, error)
	Create(context.Context, CreateRequestParam, *usecase.Operator) (*request.Request, error)
	Update(context.Context, UpdateRequestParam, *usecase.Operator) (*request.Request, error)
	Approve(context.Context, id.RequestID, *usecase.Operator) (*request.Request, error)
	DeleteMany(context.Context, id.RequestIDList, *usecase.Operator) error
}
