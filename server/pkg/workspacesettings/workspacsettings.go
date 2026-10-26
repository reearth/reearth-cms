package workspacesettings

import (
	"github.com/reearth/reearthx/util"
)

type WorkspaceSettings struct {
	id       ID
	tiles    *ResourceList
	terrains *ResourceList
}

func (ws *WorkspaceSettings) ID() ID {
	return ws.id
}

func (ws *WorkspaceSettings) Tiles() *ResourceList {
	if ws.tiles == nil {
		return nil
	}
	return ws.tiles
}

func (ws *WorkspaceSettings) SetTiles(wl *ResourceList) {
	ws.tiles = util.CloneRef(wl)
}

func (ws *WorkspaceSettings) Terrains() *ResourceList {
	if ws.terrains == nil {
		return nil
	}
	return ws.terrains
}

func (ws *WorkspaceSettings) SetTerrains(wl *ResourceList) {
	ws.terrains = util.CloneRef(wl)
}

func (ws *WorkspaceSettings) Clone() *WorkspaceSettings {
	if ws == nil {
		return nil
	}

	return &WorkspaceSettings{
		id:       ws.id.Clone(),
		tiles:    ws.tiles.Clone(),
		terrains: ws.terrains.Clone(),
	}
}
