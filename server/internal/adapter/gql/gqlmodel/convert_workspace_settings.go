package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/workspace_settings"
	"github.com/samber/lo"
)

func ToWorkspaceSettings(ws *workspace_settings.WorkspaceSettings) *WorkspaceSettings {
	if ws == nil {
		return nil
	}

	return &WorkspaceSettings{
		ID:          IDFrom(ws.ID()),
		WorkspaceID: IDFrom(ws.Workspace()),
		Avatar:      ws.Avatar(),
		Tiles:       ToWorkspaceResourceList(ws.Tiles()),
		Terrains:    ToWorkspaceResourceList(ws.Terrains()),
	}
}

func ToWorkspaceResourceList(tiles *workspace_settings.WorkspaceResources) *WorkspaceResourceList {
	if tiles == nil {
		return nil
	}

	r := lo.Map(tiles.Resources(), func(r *workspace_settings.Resource, _ int) *Resource {
		return ToResource(r)
	})
	wr := &WorkspaceResourceList{
		Resources : r,
		DefaultResource: IDFromRef(tiles.DefaultResource()),
		AllowSwitch	: tiles.AllowSwitch(),	
	}
	return wr
}

func ToResource(r *workspace_settings.Resource) *Resource {
	return &Resource{
		ID:    IDFrom(r.ID()),
		Name:  r.Name(),
		URL:   r.URL(),
		Image: r.Image(),
	}
}

func FromWorkspaceResourceList(wr *WorkspaceResourceListInput) *workspace_settings.WorkspaceResources {
	if wr == nil {
		return nil
	}
	r := lo.Map(wr.Resources, func(r *ResourceInput, _ int) *workspace_settings.Resource {
		return FromResource(r)
	})
	// this doesn't work, need to find a better way
	var res *workspace_settings.WorkspaceResources
	res.SetResources(r)
	res.SetDefaultResource(ToIDRef[id.Resource](wr.DefaultResource))
	res.SetAllowSwitch(wr.AllowSwitch)
	return res
}

func FromResource(r *ResourceInput) *workspace_settings.Resource {
	if r == nil {
		return nil
	}
	// this doesn't work, need to find a better way
	var res *workspace_settings.Resource
	rid, err := ToID[id.Resource](r.ID)
	if err != nil {
		return nil
	}
	res.SetID(rid)
	res.SetName(r.Name)
	res.SetURL(r.URL)
	res.SetImage(r.Image)
	return res
}
