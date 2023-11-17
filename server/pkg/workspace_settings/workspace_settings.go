package workspace_settings

type WorkspaceSettings struct {
	workspaceId ID
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
	return ws.workspaceId
}

func (ws *WorkspaceSettings) Avatar() *string {
	return ws.avatar
}

func (ws *WorkspaceSettings) Tiles() *WorkspaceResources {
	return ws.tiles
}

func (ws *WorkspaceSettings) Terrains() *WorkspaceResources {
	return ws.terrains
}

func (ws *WorkspaceSettings) Clone() *WorkspaceSettings {
	if ws == nil {
		return nil
	}

	return &WorkspaceSettings{
		workspaceId: ws.workspaceId.Clone(),
		avatar:      ws.avatar,
		tiles:       ws.tiles,
		terrains:    ws.terrains,
	}
}
