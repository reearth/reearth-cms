package workspacesettings

import (
	"slices"

	"github.com/reearth/reearthx/util"
)

type WorkspaceSettings struct {
	id          ID
	tiles       *WorkspaceResourceList
	terrains    *WorkspaceResourceList
}

type WorkspaceResourceList struct {
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

func (ws *WorkspaceSettings) Tiles() *WorkspaceResourceList {
	if ws.tiles == nil {
		return nil
	}
	return ws.tiles
}

func (ws *WorkspaceSettings) SetTiles(wl *WorkspaceResourceList) {
	ws.tiles = util.CloneRef(wl)
}

func (ws *WorkspaceSettings) Terrains() *WorkspaceResourceList {
	if ws.terrains == nil {
		return nil
	}
	return ws.terrains
}

func (ws *WorkspaceSettings) SetTerrains(wl *WorkspaceResourceList) {
	ws.terrains = util.CloneRef(wl)
}

func (ws *WorkspaceSettings) Clone() *WorkspaceSettings {
	if ws == nil {
		return nil
	}

	res := &WorkspaceSettings{
		id:          ws.id.Clone(),
	}
	if ws.tiles != nil {
		res.tiles = &WorkspaceResourceList{
			resources:       slices.Clone(ws.tiles.resources),
			defaultResource: ws.tiles.defaultResource.CloneRef(),
			allowSwitch:     ws.tiles.allowSwitch,
		}
	}
	if ws.terrains != nil {
		res.terrains = &WorkspaceResourceList{
			resources:       slices.Clone(ws.terrains.resources),
			defaultResource: ws.terrains.defaultResource.CloneRef(),
			allowSwitch:     ws.terrains.allowSwitch,
		}
	}

	return res
}

func (wr *WorkspaceResourceList) Resources() []*Resource {
	return slices.Clone(wr.resources)
}

func (wr *WorkspaceResourceList) DefaultResource() *ResourceID {
	return wr.defaultResource
}

func (wr *WorkspaceResourceList) AllowSwitch() bool {
	return wr.allowSwitch
}

func (wr *WorkspaceResourceList) SetResources(r []*Resource) {
	wr.resources = slices.Clone(r)
}

func (wr *WorkspaceResourceList) SetDefaultResource(rid *ResourceID) {
	wr.defaultResource = rid
}

func (wr *WorkspaceResourceList) SetAllowSwitch(s bool) {
	wr.allowSwitch = s
}

func NewWorkspaceResourceList(resources []*Resource, defaultResource *ResourceID, allowSwitch bool) *WorkspaceResourceList {
	return &WorkspaceResourceList{
		resources:       slices.Clone(resources),
		defaultResource: defaultResource,
		allowSwitch:     allowSwitch,
	}
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

func NewResource(id ResourceID, name string, url string, image string) *Resource {
	return &Resource{
		id:    id,
		name:  name,
		url:   url,
		image: image,
	}
}

func (r *Resource) SetName(n string) {
	r.name = n
}

func (r *Resource) SetURL(u string) {
	r.url = u
}

func (r *Resource) SetImage(i string) {
	r.image = i
}
