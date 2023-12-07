package workspacesettings

import (
	"slices"

	"github.com/reearth/reearthx/util"
)

type PropsType string

const (
	PropsTypeURL    PropsType = "URL"
	PropsTypeCesium PropsType = "CESIUM"
)

type WorkspaceSettings struct {
	id       ID
	tiles    *ResourceList
	terrains *ResourceList
}

type ResourceList struct {
	resources        []*Resource
	selectedResource *ResourceID
	enabled          *bool
}

type Resource struct {
	id    ResourceID
	rtype string
	props ResourceProps
}

type ResourceProps struct {
	PropsType           PropsType
	UrlResourceProps    *UrlResourceProps
	CesiumResourceProps *CesiumResourceProps
}

type UrlResourceProps struct {
	name  string
	url   string
	image string
}

type CesiumResourceProps struct {
	name                 string
	url                  string
	image                string
	cesiumIonAssetId     string
	cesiumIonAccessToken string
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

	res := &WorkspaceSettings{
		id: ws.id.Clone(),
	}
	if ws.tiles != nil {
		res.tiles = &ResourceList{
			resources:        slices.Clone(ws.tiles.resources),
			selectedResource: ws.tiles.selectedResource.CloneRef(),
			enabled:          util.CloneRef(ws.tiles.enabled),
		}
	}
	if ws.terrains != nil {
		res.terrains = &ResourceList{
			resources:        slices.Clone(ws.terrains.resources),
			selectedResource: ws.terrains.selectedResource.CloneRef(),
			enabled:          util.CloneRef(ws.terrains.enabled),
		}
	}

	return res
}

func (wr *ResourceList) Resources() []*Resource {
	return slices.Clone(wr.resources)
}

func (wr *ResourceList) SelectedResource() *ResourceID {
	return wr.selectedResource
}

func (wr *ResourceList) Enabled() *bool {
	return wr.enabled
}

func (wr *ResourceList) SetResources(r []*Resource) {
	wr.resources = slices.Clone(r)
}

func (wr *ResourceList) SetSelectedResource(rid *ResourceID) {
	wr.selectedResource = rid.CloneRef()
}

func (wr *ResourceList) SetEnabled(s *bool) {
	wr.enabled = util.CloneRef(s)
}

func NewResourceList(resources []*Resource, selectedResource *ResourceID, enabled *bool) *ResourceList {
	return &ResourceList{
		resources:        slices.Clone(resources),
		selectedResource: util.CloneRef(selectedResource),
		enabled:          util.CloneRef(enabled),
	}
}

func (r *Resource) ID() ResourceID {
	return r.id
}

func (r *Resource) Type() string {
	return r.rtype
}

func (r *Resource) Props() ResourceProps {
	return r.props
}

func NewResource(id ResourceID, rtype string, props ResourceProps) *Resource {
	return &Resource{
		id:                   id,
		rtype:                rtype,
		props:                props,
	}
}

func (r *Resource) SetType(n string) {
	r.rtype = n
}

func (r *Resource) SetProps(n ResourceProps) {
	r.props = n
}
