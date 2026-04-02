package interactor

import (
	"context"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearth-cms/server/pkg/rbac"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
)

type View struct {
	repos    *repo.Container
	gateways *gateway.Container
}

func NewView(r *repo.Container, g *gateway.Container) interfaces.View {
	return &View{
		repos:    r,
		gateways: g,
	}
}

func (i View) checkPermission(ctx context.Context, operator *usecase.Operator, workspaceID *workspace.ID, caller, action string) error {
	if i.gateways == nil || i.gateways.Authorization == nil {
		return nil
	}
	allowed, authErr := i.gateways.Authorization.CheckPermission(ctx, rbac.ResourceView, action, workspaceID)
	if authErr != nil {
		userID := "unknown"
		if operator.User() != nil {
			userID = operator.User().String()
		}
		log.Errorf("%s: permission check failed for user=%s: %v", caller, userID, authErr)
		return authErr
	}
	if !allowed {
		return interfaces.ErrOperationDenied
	}
	return nil
}

func (i View) workspaceIDForProject(ctx context.Context, projectID id.ProjectID) (*workspace.ID, error) {
	if i.gateways == nil || i.gateways.Authorization == nil {
		return nil, nil
	}
	p, err := i.repos.Project.FindByID(ctx, projectID)
	if err != nil {
		return nil, err
	}
	ws := p.Workspace()
	return &ws, nil
}

func (i View) FindByID(ctx context.Context, ID view.ID, operator *usecase.Operator) (*view.View, error) {
	v, err := i.repos.View.FindByID(ctx, ID)
	if err != nil {
		return nil, err
	}
	wid, err := i.workspaceIDForProject(ctx, v.Project())
	if err != nil {
		return nil, err
	}
	if err := i.checkPermission(ctx, operator, wid, "View.FindByID", rbac.ActionRead); err != nil {
		return nil, err
	}
	return v, nil
}

func (i View) FindByIDs(ctx context.Context, IDs view.IDList, operator *usecase.Operator) (view.List, error) {
	views, err := i.repos.View.FindByIDs(ctx, IDs)
	if err != nil {
		return nil, err
	}
	seen := map[view.ProjectID]bool{}
	for _, v := range views {
		if v == nil || seen[v.Project()] {
			continue
		}
		seen[v.Project()] = true
		wid, err := i.workspaceIDForProject(ctx, v.Project())
		if err != nil {
			return nil, err
		}
		if err := i.checkPermission(ctx, operator, wid, "View.FindByIDs", rbac.ActionRead); err != nil {
			return nil, err
		}
	}
	return views, nil
}

func (i View) FindByModel(ctx context.Context, mID view.ModelID, operator *usecase.Operator) (view.List, error) {
	m, err := i.repos.Model.FindByID(ctx, mID)
	if err != nil {
		if err == rerror.ErrNotFound {
			return nil, nil
		}
		return nil, err
	}
	wid, err := i.workspaceIDForProject(ctx, m.Project())
	if err != nil {
		return nil, err
	}
	if err := i.checkPermission(ctx, operator, wid, "View.FindByModel", rbac.ActionList); err != nil {
		return nil, err
	}
	v, err := i.repos.View.FindByModel(ctx, mID)
	if err != nil {
		return nil, err
	}
	return v.Ordered(), nil
}

func (i View) Create(ctx context.Context, param interfaces.CreateViewParam, op *usecase.Operator) (*view.View, error) {
	if op.AcOperator.User == nil {
		return nil, interfaces.ErrInvalidOperator
	}
	wid, err := i.workspaceIDForProject(ctx, param.Project)
	if err != nil {
		return nil, err
	}
	if err := i.checkPermission(ctx, op, wid, "View.Create", rbac.ActionCreate); err != nil {
		return nil, err
	}
	return Run1(ctx, op, i.repos, Usecase().Transaction(),
		func(ctx context.Context) (_ *view.View, err error) {
			if !op.IsMaintainingProject(param.Project) {
				return nil, interfaces.ErrOperationDenied
			}

			m, err := i.repos.Model.FindByID(ctx, param.Model)
			if err != nil {
				return nil, err
			}

			if m == nil || m.Project() != param.Project {
				return nil, rerror.ErrNotFound
			}

			vb := view.
				New().
				NewID().
				Project(param.Project).
				Model(param.Model).
				Schema(m.Schema()).
				Name(param.Name).
				Sort(param.Sort).
				Filter(param.Filter).
				Columns(param.Columns).
				User(*op.Operator().User())

			views, err := i.repos.View.FindByModel(ctx, param.Model)
			if err != nil {
				return nil, err
			}
			if len(views) > 0 {
				vb = vb.Order(len(views))
			}

			v, err := vb.Build()
			if err != nil {
				return nil, err
			}

			err = i.repos.View.Save(ctx, v)
			if err != nil {
				return nil, err
			}
			return v, nil
		})
}

func (i View) Update(ctx context.Context, ID view.ID, param interfaces.UpdateViewParam, op *usecase.Operator) (*view.View, error) {
	return Run1(ctx, op, i.repos, Usecase().Transaction(),
		func(ctx context.Context) (_ *view.View, err error) {
			v, err := i.repos.View.FindByID(ctx, ID)
			if err != nil {
				return nil, err
			}

			if !op.IsMaintainingProject(v.Project()) {
				return nil, interfaces.ErrOperationDenied
			}

			wid, err := i.workspaceIDForProject(ctx, v.Project())
			if err != nil {
				return nil, err
			}
			if err := i.checkPermission(ctx, op, wid, "View.Update", rbac.ActionUpdate); err != nil {
				return nil, err
			}

			if param.Name != nil {
				v.SetName(*param.Name)
			}
			v.SetFilter(param.Filter)
			v.SetSort(param.Sort)
			v.SetColumns(param.Columns)
			v.SetUpdatedAt(time.Now())

			if err := i.repos.View.Save(ctx, v); err != nil {
				return nil, err
			}
			return v, nil
		})
}

func (i View) UpdateOrder(ctx context.Context, ids view.IDList, operator *usecase.Operator) (view.List, error) {
	return Run1(ctx, operator, i.repos, Usecase().Transaction(),
		func(ctx context.Context) (_ view.List, err error) {
			if len(ids) == 0 {
				return nil, nil
			}
			v, err := i.repos.View.FindByIDs(ctx, ids)
			if err != nil {
				return nil, err
			}
			if !v.AreViewsInTheSameModel() {
				return nil, interfaces.ErrViewsAreNotInTheSameModel
			}
			if !operator.IsMaintainingProject(v[0].Project()) {
				return nil, interfaces.ErrOperationDenied
			}

			wid, err := i.workspaceIDForProject(ctx, v[0].Project())
			if err != nil {
				return nil, err
			}
			if err := i.checkPermission(ctx, operator, wid, "View.UpdateOrder", rbac.ActionUpdate); err != nil {
				return nil, err
			}

			views, err := i.repos.View.FindByModel(ctx, v[0].Model())
			if err != nil {
				return nil, err
			}
			if len(views) != len(ids) {
				return nil, interfaces.ErrViewsLengthMismatch
			}

			ordered := views.OrderByIDs(ids)
			if err := i.repos.View.SaveAll(ctx, ordered); err != nil {
				return nil, err
			}
			return ordered, nil
		})
}

func (i View) Delete(ctx context.Context, ID view.ID, op *usecase.Operator) error {
	return Run0(ctx, op, i.repos, Usecase().Transaction(),
		func(ctx context.Context) error {
			m, err := i.repos.View.FindByID(ctx, ID)
			if err != nil {
				return err
			}
			if !op.IsMaintainingProject(m.Project()) {
				return interfaces.ErrOperationDenied
			}

			wid, err := i.workspaceIDForProject(ctx, m.Project())
			if err != nil {
				return err
			}
			if err := i.checkPermission(ctx, op, wid, "View.Delete", rbac.ActionDelete); err != nil {
				return err
			}

			views, err := i.repos.View.FindByModel(ctx, m.Model())
			if err != nil {
				return err
			}
			if len(views) <= 1 {
				return interfaces.ErrLastView
			}

			if err := i.repos.View.Remove(ctx, ID); err != nil {
				return err
			}
			return nil
		})
}
