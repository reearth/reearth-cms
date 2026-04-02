package interactor

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/rbac"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
)

type WorkspaceSettings struct {
	repos    *repo.Container
	gateways *gateway.Container
}

func NewWorkspaceSettings(r *repo.Container, g *gateway.Container) interfaces.WorkspaceSettings {
	return &WorkspaceSettings{
		repos:    r,
		gateways: g,
	}
}

func (ws *WorkspaceSettings) checkPermission(ctx context.Context, operator *usecase.Operator, workspaceID *workspace.ID, caller, action string) error {
	if ws.gateways == nil || ws.gateways.Authorization == nil {
		return nil
	}
	allowed, authErr := ws.gateways.Authorization.CheckPermission(ctx, rbac.ResourceWorkspaceSettings, action, workspaceID)
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

func (ws *WorkspaceSettings) Fetch(ctx context.Context, wid accountdomain.WorkspaceIDList, op *usecase.Operator) (result workspacesettings.List, err error) {
	for _, w := range wid {
		wPtr := w
		if err := ws.checkPermission(ctx, op, &wPtr, "WorkspaceSettings.Fetch", rbac.ActionRead); err != nil {
			return nil, err
		}
	}
	return ws.repos.WorkspaceSettings.FindByIDs(ctx, wid)
}

func (ws *WorkspaceSettings) UpdateOrCreate(ctx context.Context, inp interfaces.UpdateOrCreateWorkspaceSettingsParam, op *usecase.Operator) (result *workspacesettings.WorkspaceSettings, err error) {
	wid := inp.ID
	if err := ws.checkPermission(ctx, op, &wid, "WorkspaceSettings.UpdateOrCreate", rbac.ActionUpdate); err != nil {
		return nil, err
	}

	wss, err := ws.repos.WorkspaceSettings.FindByID(ctx, inp.ID)
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return nil, err
	}

	return Run1(ctx, op, ws.repos, Usecase().WithMaintainableWorkspaces(inp.ID).Transaction(),
		func(ctx context.Context) (_ *workspacesettings.WorkspaceSettings, err error) {
			if wss == nil {
				wsb := workspacesettings.New().
					ID(inp.ID)

				wss, err = wsb.Build()
				if err != nil {
					return nil, err
				}
			}
			if inp.Tiles != nil {
				wss.SetTiles(inp.Tiles)
			}
			if inp.Terrains != nil {
				wss.SetTerrains(inp.Terrains)
			}
			if err := ws.repos.WorkspaceSettings.Save(ctx, wss); err != nil {
				return nil, err
			}
			return wss, nil
		})
}

func (ws *WorkspaceSettings) Delete(ctx context.Context, inp interfaces.DeleteWorkspaceSettingsParam, op *usecase.Operator) error {
	wid := inp.ID
	if err := ws.checkPermission(ctx, op, &wid, "WorkspaceSettings.Delete", rbac.ActionDelete); err != nil {
		return err
	}
	return Run0(ctx, op, ws.repos, Usecase().WithMaintainableWorkspaces(inp.ID).Transaction(),
		func(ctx context.Context) error {
			return ws.repos.WorkspaceSettings.Remove(ctx, inp.ID)
		})
}
