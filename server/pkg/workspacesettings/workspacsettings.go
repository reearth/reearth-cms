package workspacesettings

import (
	"slices"

	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/util"
)

type WorkspaceSettings struct {
	id          ID
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

func (wr *WorkspaceResources) Resources() []*Resource {
	return wr.resources
}

func (wr *WorkspaceResources) DefaultResource() *ResourceID {
	return wr.defaultResource
}

func (wr *WorkspaceResources) AllowSwitch() bool {
	return wr.allowSwitch
}

func (wr *WorkspaceResources) SetResources(r []*Resource) {
	wr.resources = r
}

func (wr *WorkspaceResources) SetDefaultResource(rid *ResourceID) {
	wr.defaultResource = rid
}

func (wr *WorkspaceResources) SetAllowSwitch(s bool) {
	wr.allowSwitch = s
}

func (r *Resource) ID() ResourceID {
	return r.id
}

func (r *Resource) Name() string {
	return r.name
}

func (r *Resource) URL() string {
	return r.url
}

func (r *Resource) Image() string {
	return r.image
}

// this is bad, id should be immutable and set from the backend
func (r *Resource) SetID(rid ResourceID) {
	 r.id = rid
}

func (r *Resource) SetName(n string)  {
	r.name = n
}

func (r *Resource) SetURL(u string)  {
	r.url = u
}

func (r *Resource) SetImage(i string)  {
	r.image = i
}