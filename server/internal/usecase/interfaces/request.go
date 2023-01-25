package interfaces

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearthx/usecasex"
)

var (
	ErrAlreadyPublished = errors.New("already published")
)

type CreateRequestParam struct {
	ProjectID   id.ProjectID
	Title       string
	Description *string
	State       *request.State
	Reviewers   id.UserIDList
	Items       request.ItemList
}

type UpdateRequestParam struct {
	RequestID   id.RequestID
	Title       *string
	Description *string
	State       *request.State
	Reviewers   id.UserIDList
	Items       request.ItemList
}

type RequestFilter struct {
	Keyword   *string
	State     []request.State
	Reviewer  *id.UserID
	CreatedBy *id.UserID
}

type Request interface {
	FindByID(context.Context, id.RequestID, *usecase.Operator) (*request.Request, error)
	FindByIDs(context.Context, id.RequestIDList, *usecase.Operator) (request.List, error)
	FindByItems(context.Context, id.ItemIDList, *usecase.Operator) (map[id.ItemID]request.List, error)
	FindByProject(context.Context, id.ProjectID, RequestFilter, *usecasex.Sort, *usecasex.Pagination, *usecase.Operator) (request.List, *usecasex.PageInfo, error)
	Create(context.Context, CreateRequestParam, *usecase.Operator) (*request.Request, error)
	Update(context.Context, UpdateRequestParam, *usecase.Operator) (*request.Request, error)
	Approve(context.Context, id.RequestID, *usecase.Operator) (*request.Request, error)
	CloseAll(context.Context, id.ProjectID, id.RequestIDList, *usecase.Operator) error
}
