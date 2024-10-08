package interfaces

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

var (
	ErrAlreadyPublished = rerror.NewE(i18n.T("already published"))
)

type CreateRequestParam struct {
	ProjectID   id.ProjectID
	Title       string
	Description *string
	State       *request.State
	Reviewers   accountdomain.UserIDList
	Items       request.ItemList
}

type UpdateRequestParam struct {
	RequestID   id.RequestID
	Title       *string
	Description *string
	State       *request.State
	Reviewers   accountdomain.UserIDList
	Items       request.ItemList
}

type RequestFilter struct {
	Keyword   *string
	State     []request.State
	Reviewer  *accountdomain.UserID
	CreatedBy *accountdomain.UserID
}

type Request interface {
	FindByID(context.Context, id.RequestID, *usecase.Operator) (*request.Request, error)
	FindByIDs(context.Context, id.RequestIDList, *usecase.Operator) (request.List, error)
	FindByProject(context.Context, id.ProjectID, RequestFilter, *usecasex.Sort, *usecasex.Pagination, *usecase.Operator) (request.List, *usecasex.PageInfo, error)
	FindByItem(context.Context, id.ItemID, *RequestFilter, *usecase.Operator) (request.List, error)
	Create(context.Context, CreateRequestParam, *usecase.Operator) (*request.Request, error)
	Update(context.Context, UpdateRequestParam, *usecase.Operator) (*request.Request, error)
	Approve(context.Context, id.RequestID, *usecase.Operator) (*request.Request, error)
	CloseAll(context.Context, id.ProjectID, id.RequestIDList, *usecase.Operator) error
}
