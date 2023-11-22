package mongodoc

import (
	"github.com/reearth/reearth-cms/server/pkg/workspace_settings"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
)

type WorkspaceSettingsDocument struct {
	ID          string
	WorkspaceID string
	Avatar      *string
}

type WorkspaceSettingsConsumer = mongox.SliceFuncConsumer[*WorkspaceSettingsDocument, *workspace_settings.WorkspaceSettings]

func NewWorkspaceSettingsConsumer() *WorkspaceSettingsConsumer {
	return NewConsumer[*WorkspaceSettingsDocument, *workspace_settings.WorkspaceSettings]()
}

func NewWorkspaceSettings(ws *workspace_settings.WorkspaceSettings) (*WorkspaceSettingsDocument, string) {
	wsid := ws.ID().String()
	return &WorkspaceSettingsDocument{
		ID:          wsid,
		WorkspaceID: ws.Workspace().String(),
		Avatar:      ws.Avatar(),
	}, wsid
}

func (wsd *WorkspaceSettingsDocument) Model() (*workspace_settings.WorkspaceSettings, error) {
	wid, err := accountdomain.WorkspaceIDFrom(wsd.WorkspaceID)
	if err != nil {
		return nil, err
	}

	return workspace_settings.New().
		NewID().
		Workspace(wid).
		Avatar(wsd.Avatar).
		Build()
}
