package interactor

import (
	"context"
	"errors"
	"fmt"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/request"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
)

type Request struct {
	repos    *repo.Container
	gateways *gateway.Container
}

func NewRequest(r *repo.Container, g *gateway.Container) *Request {
	return &Request{
		repos:    r,
		gateways: g,
	}
}

func (r Request) FindByID(ctx context.Context, id id.RequestID, operator *usecase.Operator) (*request.Request, error) {
	return r.repos.Request.FindByID(ctx, id)
}

func (r Request) FindByIDs(ctx context.Context, list id.RequestIDList, operator *usecase.Operator) (request.List, error) {
	return r.repos.Request.FindByIDs(ctx, list)
}

func (r Request) FindByProject(ctx context.Context, pid id.ProjectID, filter interfaces.RequestFilter, pagination *usecasex.Pagination, operator *usecase.Operator) (request.List, *usecasex.PageInfo, error) {
	return r.repos.Request.FindByProject(ctx, pid, repo.RequestFilter{
		State:   filter.State,
		Keyword: filter.Keyword,
	}, pagination)
}

func (r Request) Create(ctx context.Context, param interfaces.CreateRequestParam, operator *usecase.Operator) (*request.Request, error) {
	if operator.User == nil {
		return nil, interfaces.ErrInvalidOperator
	}

	return Run1(ctx, operator, r.repos, Usecase().Transaction(), func() (*request.Request, error) {
		p, err := r.repos.Project.FindByID(ctx, param.ProjectID)
		if err != nil {
			return nil, err
		}
		ws, err := r.repos.Workspace.FindByID(ctx, p.Workspace())
		if err != nil {
			return nil, err
		}

		repoItems, err := r.repos.Item.FindByIDs(ctx, param.Items.IDs(), version.Public.Ref())
		if err != nil {
			return nil, err
		}

		for _, item := range repoItems {
			if item.Refs().Has(version.Latest) {
				return nil, interfaces.ErrAlreadyPublished
			}
		}

		th, err := thread.New().NewID().Workspace(ws.ID()).Build()

		if err != nil {
			return nil, err
		}
		if err := r.repos.Thread.Save(ctx, th); err != nil {
			return nil, err
		}

		builder := request.New().
			NewID().
			Workspace(ws.ID()).
			Project(param.ProjectID).
			CreatedBy(*operator.User).
			Thread(th.ID()).
			Items(param.Items).
			Title(param.Title)

		if param.State != nil {
			if *param.State == request.StateApproved || *param.State == request.StateClosed {
				return nil, fmt.Errorf("can't create request with state %s", param.State.String())
			}
			builder.State(*param.State)
		}
		if param.Description != nil {
			builder.Description(*param.Description)
		}
		if param.Reviewers != nil && param.Reviewers.Len() > 0 {
			for _, rev := range param.Reviewers {
				if !ws.Members().IsOwnerOrMaintainer(rev) {
					return nil, errors.New("reviewer should be owner or maintainer")
				}
			}
			builder.Reviewers(param.Reviewers)
		}

		req, err := builder.Build()
		if err != nil {
			return nil, err
		}

		if err := r.repos.Request.Save(ctx, req); err != nil {
			return nil, err
		}

		return req, nil
	})
}

func (r Request) Update(ctx context.Context, param interfaces.UpdateRequestParam, operator *usecase.Operator) (*request.Request, error) {
	if operator.User == nil {
		return nil, interfaces.ErrInvalidOperator
	}

	return Run1(ctx, operator, r.repos, Usecase().Transaction(), func() (*request.Request, error) {
		req, err := r.repos.Request.FindByID(ctx, param.RequestID)
		if err != nil {
			return nil, err
		}

		ws, err := r.repos.Workspace.FindByID(ctx, req.Workspace())
		if err != nil {
			return nil, err
		}

		// only owners, maintainers, and the request creator can update requests
		canUpdate := *operator.User == req.CreatedBy() || ws.Members().IsOwnerOrMaintainer(*operator.User)
		if !operator.IsWritableWorkspace(req.Workspace()) && canUpdate {
			return nil, interfaces.ErrOperationDenied
		}

		if param.State != nil {
			if *param.State == request.StateApproved {
				return nil, errors.New("can't update by approve")
			}
			req.SetState(*param.State)
		}

		if param.Description != nil {
			req.SetDescription(*param.Description)
		}

		if param.Reviewers != nil && param.Reviewers.Len() > 0 {
			for _, rev := range param.Reviewers {
				if !ws.Members().IsOwnerOrMaintainer(rev) {
					return nil, errors.New("reviewer should be owner or maintainer")
				}
			}
			req.SetReviewers(param.Reviewers)
		}

		if param.Items != nil {
			repoItems, err := r.repos.Item.FindByIDs(ctx, param.Items.IDs(), version.Public.Ref())
			if err != nil {
				return nil, err
			}

			for _, item := range repoItems {
				if item.Refs().Has(version.Latest) {
					return nil, interfaces.ErrAlreadyPublished
				}
			}
			req.SetItems(param.Items)
		}
		req.SetUpdatedAt(util.Now())
		if err := r.repos.Request.Save(ctx, req); err != nil {
			return nil, err
		}

		return req, nil
	})
}

func (r Request) CloseAll(ctx context.Context, pid id.ProjectID, ids id.RequestIDList, operator *usecase.Operator) error {
	if operator.User == nil {
		return interfaces.ErrInvalidOperator
	}

	reqs, err := r.FindByIDs(ctx, ids, operator)
	if err != nil {
		return err
	}
	reqs.UpdateStatus(request.StateClosed)

	return r.repos.Request.SaveAll(ctx, pid, reqs)
}

func (r Request) Approve(ctx context.Context, requestID id.RequestID, operator *usecase.Operator) (*request.Request, error) {
	if operator.User == nil {
		return nil, interfaces.ErrInvalidOperator
	}

	req, err := r.repos.Request.FindByID(ctx, requestID)
	if err != nil {
		return nil, err
	}
	if !operator.IsOwningWorkspace(req.Workspace()) && !operator.IsMaintainingWorkspace(req.Workspace()) {
		return nil, interfaces.ErrInvalidOperator
	}
	// only reviewers can approve
	if !req.Reviewers().Has(*operator.User) {
		return nil, errors.New("only reviewers can approve")
	}

	if req.State() != request.StateWaiting {
		return nil, errors.New("only requests with status waiting can be approved")
	}
	req.SetState(request.StateApproved)

	if err := r.repos.Request.Save(ctx, req); err != nil {
		return nil, err
	}

	// apply changes to items (publish items)
	for _, item := range req.Items() {
		// publish the approved version
		if err := r.repos.Item.UpdateRef(ctx, item.Item(), version.Public, version.Latest.OrVersion().Ref()); err != nil {
			return nil, err
		}
	}
	return req, nil
}
