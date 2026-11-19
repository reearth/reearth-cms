package interactor

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/rbac"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountusecase/accountinterfaces"
	"github.com/reearth/reearthx/rerror"
)

type WorkspaceDeleter struct {
	repos     *repo.Container
	gateways  *gateway.Container
	workspace accountinterfaces.Workspace
}

func NewWorkspaceDeleter(r *repo.Container, g *gateway.Container, w accountinterfaces.Workspace) interfaces.WorkspaceDeleter {
	return &WorkspaceDeleter{
		repos:     r,
		gateways:  g,
		workspace: w,
	}
}

func (d *WorkspaceDeleter) authz() gateway.Authorization {
	if d.gateways == nil {
		return nil
	}
	return d.gateways.Authorization
}

// Delete deletes a workspace from CMS (used by OSS; on SaaS workspaces are managed by the Dashboard).
//
// The workspace lives in the account DB and its settings in the CMS DB, so the steps cannot share
// one transaction. They are ordered so that a failure never leaves the workspace without its settings:
//  1. reject deletion while the workspace still has projects (deletion does not cascade yet)
//  2. remove the workspace (the account usecase checks permissions and rejects personal workspaces)
//  3. remove the workspace settings; a failure here only leaves orphaned settings behind
func (d *WorkspaceDeleter) Delete(ctx context.Context, wid accountdomain.WorkspaceID, op *usecase.Operator) error {
	if op == nil || op.AcOperator == nil {
		return interfaces.ErrInvalidOperator
	}

	return Run0(ctx, op, d.repos,
		Usecase().
			WithMaintainableWorkspaces(wid).
			WithPermission(d.authz(), rbac.ResourceWorkspaceSettings, rbac.ActionDelete, wid),
		func(ctx context.Context) error {
			count, err := d.repos.Project.CountByWorkspace(ctx, wid)
			if err != nil {
				return err
			}
			if count > 0 {
				return interfaces.ErrWorkspaceHasProjects
			}

			if err := d.workspace.Remove(ctx, wid, op.AcOperator); err != nil {
				return err
			}

			if err := d.repos.WorkspaceSettings.Remove(ctx, wid); err != nil && !errors.Is(err, rerror.ErrNotFound) {
				return err
			}
			return nil
		})
}
