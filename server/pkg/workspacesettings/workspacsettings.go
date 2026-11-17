package workspacesettings

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

func (ws *WorkspaceSettings) SetTiles(wl *ResourceList) error {
	if err := wl.Validate(); err != nil {
		return err
	}
	ws.tiles = wl.Clone()
	return nil
}

func (ws *WorkspaceSettings) Terrains() *ResourceList {
	if ws.terrains == nil {
		return nil
	}
	return ws.terrains
}

func (ws *WorkspaceSettings) SetTerrains(wl *ResourceList) error {
	if err := wl.Validate(); err != nil {
		return err
	}
	ws.terrains = wl.Clone()
	return nil
}

func (ws *WorkspaceSettings) Validate() error {
	if ws.id.IsNil() {
		return ErrInvalidID
	}
	if err := ws.tiles.Validate(); err != nil {
		return err
	}
	return ws.terrains.Validate()
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
