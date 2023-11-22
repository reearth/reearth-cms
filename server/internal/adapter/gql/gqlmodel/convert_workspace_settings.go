package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/workspace_settings"
)

func ToWorkspaceSettings(ws *workspace_settings.WorkspaceSettings) *WorkspaceSettings {
	if ws == nil {
		return nil
	}

	return &WorkspaceSettings{
		WorkspaceID: IDFrom(ws.Workspace()),
		Avatar:      ws.Avatar(),
	}
}
