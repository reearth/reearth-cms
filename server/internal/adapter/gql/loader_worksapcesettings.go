package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type WorkspaceSettingsLoader struct {
	usecase interfaces.WorkspaceSettings
}

func NewWorkspaceSettingsLoader(usecase interfaces.WorkspaceSettings) *WorkspaceSettingsLoader {
	return &WorkspaceSettingsLoader{usecase: usecase}
}

func (c *WorkspaceSettingsLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.WorkspaceSettings, []error) {
	wsIDs, err := util.TryMap(ids, gqlmodel.ToID[accountdomain.Workspace])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.Fetch(ctx, wsIDs, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(wsIDs, func(id workspacesettings.ID, _ int) *gqlmodel.WorkspaceSettings {
		ws, ok := lo.Find(res, func(ws *workspacesettings.WorkspaceSettings) bool {
			return ws != nil && ws.ID() == id
		})
		if !ok {
			return nil
		}
		return gqlmodel.ToWorkspaceSettings(ws)
	}), nil
}
