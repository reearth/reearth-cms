package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type RequestLoader struct {
	usecase interfaces.Request
}

func NewRequestLoader(usecase interfaces.Request) *RequestLoader {
	return &RequestLoader{usecase: usecase}
}

func (c *RequestLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Request, []error) {
	rIDs, err := util.TryMap(ids, gqlmodel.ToID[id.Request])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.FindByIDs(ctx, rIDs, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(rIDs, func(id request.ID, _ int) *gqlmodel.Request {
		r, ok := lo.Find(res, func(r *request.Request) bool {
			return r != nil && r.ID() == id
		})
		if !ok {
			return nil
		}
		return gqlmodel.ToRequest(r)
	}), nil
}

func (c *RequestLoader) FindByProject(ctx context.Context, projectId gqlmodel.ID, keyword *string, state []gqlmodel.RequestState, createdBy, reviewer *gqlmodel.ID, p *gqlmodel.Pagination, sort *gqlmodel.Sort) (*gqlmodel.RequestConnection, error) {
	pid, err := gqlmodel.ToID[id.Project](projectId)
	if err != nil {
		return nil, err
	}

	f := interfaces.RequestFilter{
		Keyword: keyword,
	}
	if state != nil {
		f.State = lo.Map(state, func(s gqlmodel.RequestState, _ int) request.State {
			return request.StateFrom(s.String())
		})
	}
	f.Reviewer = gqlmodel.ToIDRef[accountdomain.User](reviewer)
	f.CreatedBy = gqlmodel.ToIDRef[accountdomain.User](createdBy)

	requests, pi, err := c.usecase.FindByProject(ctx, pid, f, sort.Into(), p.Into(), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	edges := make([]*gqlmodel.RequestEdge, 0, len(requests))
	nodes := make([]*gqlmodel.Request, 0, len(requests))
	for _, req := range requests {
		request := gqlmodel.ToRequest(req)
		edges = append(edges, &gqlmodel.RequestEdge{
			Node:   request,
			Cursor: usecasex.Cursor(request.ID),
		})
		nodes = append(nodes, request)
	}

	return &gqlmodel.RequestConnection{
		Edges:      edges,
		Nodes:      nodes,
		PageInfo:   gqlmodel.ToPageInfo(pi),
		TotalCount: int(pi.TotalCount),
	}, nil
}

func (c *RequestLoader) FindByItem(ctx context.Context, itemId gqlmodel.ID) ([]*gqlmodel.Request, error) {
	iid, err := gqlmodel.ToID[id.Item](itemId)
	if err != nil {
		return nil, err
	}

	requests, err := c.usecase.FindByItem(ctx, iid, nil, nil)
	if err != nil {
		return nil, err
	}

	return lo.Map(requests, func(r *request.Request, _ int) *gqlmodel.Request {
		return gqlmodel.ToRequest(r)
	}), nil
}
