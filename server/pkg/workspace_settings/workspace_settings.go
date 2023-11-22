package workspace_settings

import (
	"slices"

	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/util"
)

type WorkspaceSettings struct {
	id ID
	workspaceId accountdomain.WorkspaceID
	avatar      *string
	tiles       *WorkspaceResources
	terrains    *WorkspaceResources
}

type WorkspaceResources struct {
	resources       []*Resource
	defaultResource *ResourceID
	allowSwitch     bool
}

type Resource struct {
	id    ResourceID
	name  string
	url   string
	image string
}

func (ws *WorkspaceSettings) ID() ID {
	return ws.id
}

func (ws *WorkspaceSettings) Workspace() accountdomain.WorkspaceID {
	return ws.workspaceId
}

func (ws *WorkspaceSettings) Avatar() *string {
	if ws.avatar == nil {
		return nil
	}
	return ws.avatar
}

func (ws *WorkspaceSettings) UpdateAvatar(a *string) {
	ws.avatar = util.CloneRef(a)
}

func (ws *WorkspaceSettings) Tiles() *WorkspaceResources {
	if ws.tiles == nil {
		return nil
	}
	return ws.tiles
}

func (ws *WorkspaceSettings) Terrains() *WorkspaceResources {
	if ws.terrains == nil {
		return nil
	}
	return ws.terrains
}

func (ws *WorkspaceSettings) Clone() *WorkspaceSettings {
	if ws == nil {
		return nil
	}

	return &WorkspaceSettings{
		workspaceId: ws.workspaceId.Clone(),
		avatar:      ws.avatar,
		tiles: &WorkspaceResources{
			resources:       slices.Clone(ws.tiles.resources),
			defaultResource: ws.tiles.defaultResource,
			allowSwitch:     ws.tiles.allowSwitch,
		},
		terrains: &WorkspaceResources{
			resources:       slices.Clone(ws.terrains.resources),
			defaultResource: ws.terrains.defaultResource,
			allowSwitch:     ws.terrains.allowSwitch,
		},
	}
}
