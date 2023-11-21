package workspace_settings

import "github.com/reearth/reearthx/account/accountdomain"

type Builder struct {
	ws *WorkspaceSettings
}

func New() *Builder {
	return &Builder{ws: &WorkspaceSettings{}}
}

func (b *Builder) Build() (*WorkspaceSettings, error) {
	if b.ws.workspaceId.IsNil() {
		return nil, ErrInvalidID
	}

	return b.ws, nil
}

func (b *Builder) MustBuild() *WorkspaceSettings {
	ws, err := b.Build()
	if err != nil {
		panic(err)
	}
	return ws
}

func (b *Builder) Workspace(wid accountdomain.WorkspaceID) *Builder {
	b.ws.workspaceId = wid
	return b
}

func (b *Builder) Avatar(a *string) *Builder {
	b.ws.avatar = a
	return b
}

func (b *Builder) Tiles(wr *WorkspaceResources) *Builder {
	b.ws.tiles = wr
	return b
}

func (b *Builder) Terrains(wr *WorkspaceResources) *Builder {
	b.ws.terrains = wr
	return b
}