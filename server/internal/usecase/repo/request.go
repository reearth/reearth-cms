package repo

import (
	"context"
	"slices"
	"strings"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/usecasex"
)

type RequestFilter struct {
	State     []request.State
	Keyword   *string
	Reviewer  *accountdomain.UserID
	CreatedBy *accountdomain.UserID
}

type Request interface {
	Filtered(ProjectFilter) Request
	FindByProject(context.Context, id.ProjectID, RequestFilter, *usecasex.Sort, *usecasex.Pagination) (request.List, *usecasex.PageInfo, error)
	FindByID(context.Context, id.RequestID) (*request.Request, error)
	FindByIDs(context.Context, id.RequestIDList) (request.List, error)
	FindByItems(context.Context, id.ItemIDList, *RequestFilter) (request.List, error)
	Save(context.Context, *request.Request) error
	SaveAll(context.Context, id.ProjectID, request.List) error
}

// NormalizeRequestSort maps a sort key to a request document field. An
// unknown key sorts by ID, which is also the creation order.
func NormalizeRequestSort(s *usecasex.Sort) *usecasex.Sort {
	if s == nil {
		return nil
	}
	res := &usecasex.Sort{Key: strings.TrimSpace(strings.ToLower(s.Key)), Reverted: s.Reverted}
	switch res.Key {
	case "createdat", "created_at":
		res.Key = "id"
	case "updated_at", "approved_at", "closed_at", "created_by":
		res.Key = strings.ReplaceAll(res.Key, "_", "")
	}
	if !slices.Contains([]string{"id", "workspace", "project", "title", "description", "createdby", "state", "updatedat", "approvedat", "closedat"}, res.Key) {
		res.Key = "id"
	}
	return res
}
