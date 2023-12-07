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
		ID:       IDFrom(ws.ID()),
		Tiles:    ToResourceList(ws.Tiles()),
		Terrains: ToResourceList(ws.Terrains()),
	}
}

func ToResourceList(resource *workspacesettings.ResourceList) *ResourceList {
	if resource == nil {
		return nil
	}

	r := lo.Map(resource.Resources(), func(r *workspacesettings.Resource, _ int) *Resource {
		return ToResource(r)
	})
	wr := &ResourceList{
		Resources:        r,
		SelectedResource: IDFromRef(resource.SelectedResource()),
		Enabled:          resource.Enabled(),
	}
	return wr
}

func ToResource(r *workspacesettings.Resource) *Resource {
	return &Resource{
		ID:                   IDFrom(r.ID()),
		Type:                 r.Type(),
		Name:                 r.Name(),
		URL:                  r.URL(),
		Image:                r.Image(),
		CesiumIonAssetID:     r.CesiumIonAssetID(),
		CesiumIonAccessToken: r.CesiumIonAccessToken(),
	}
}

func FromResourceList(wr *ResourcesListInput) *workspacesettings.ResourceList {
	if wr == nil {
		return nil
	}
	r := lo.Map(wr.Resources, func(r *ResourceInput, _ int) *workspacesettings.Resource {
		return FromResource(r)
	})
	rid := ToIDRef[id.Resource](wr.SelectedResource)
	return workspacesettings.NewResourceList(r, rid, wr.Enabled)
}

func FromResource(r *ResourceInput) *workspacesettings.Resource {
	if r == nil {
		return nil
	}

	rid, err := ToID[id.Resource](r.ID)
	if err != nil {
		return nil
	}

	return workspacesettings.NewResource(rid, r.Type, r.Name, r.URL, r.Image, r.CesiumIonAssetID, r.CesiumIonAccessToken)
}
