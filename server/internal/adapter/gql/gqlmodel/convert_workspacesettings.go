package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/samber/lo"
)

func ToWorkspaceSettings(ws *workspacesettings.WorkspaceSettings) *WorkspaceSettings {
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

func ToWorkspaceResourceList(tiles *workspacesettings.WorkspaceResourceList) *WorkspaceResourceList {
	if tiles == nil {
		return nil
	}

	r := lo.Map(tiles.Resources(), func(r *workspacesettings.Resource, _ int) *Resource {
		return ToResource(r)
	})
	wr := &WorkspaceResourceList{
		Resources:       r,
		DefaultResource: IDFromRef(tiles.DefaultResource()),
		AllowSwitch:     tiles.AllowSwitch(),
	}
	return wr
}

func ToResource(r *workspacesettings.Resource) *Resource {
	return &Resource{
		ID:    IDFrom(r.ID()),
		Name:  r.Name(),
		URL:   r.URL(),
		Image: r.Image(),
	}
}

func FromWorkspaceResourceList(wr *WorkspaceResourceListInput) *workspacesettings.WorkspaceResourceList {
	if wr == nil {
		return nil
	}
	r := lo.Map(wr.Resources, func(r *ResourceInput, _ int) *workspacesettings.Resource {
		return FromResource(r)
	})
	rid := ToIDRef[id.Resource](wr.DefaultResource)
	return workspacesettings.NewWorkspaceResourceList(r, rid, wr.AllowSwitch)
}

func FromResource(r *ResourceInput) *workspacesettings.Resource {
	if r == nil {
		return nil
	}

	rid, err := ToID[id.Resource](r.ID)
	if err != nil {
		return nil
	}

	return workspacesettings.NewResource(rid, r.Name, r.URL, r.Image)
}
