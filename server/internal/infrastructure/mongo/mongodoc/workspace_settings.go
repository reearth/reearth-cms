package mongodoc

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/workspace_settings"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
	"github.com/samber/lo"
)

type WorkspaceSettingsDocument struct {
	ID          string
	WorkspaceID string
	Avatar      *string
	Tiles       *WorkspaceResourceListDocument
	Terrains    *WorkspaceResourceListDocument
}

type WorkspaceResourceListDocument struct {
	Resources       []*ResourceDocument
	DefaultResource *string
	AllowSwitch     bool
}

type ResourceDocument struct {
	ID    string
	Name  string
	URL   string
	Image string
}

type WorkspaceSettingsConsumer = mongox.SliceFuncConsumer[*WorkspaceSettingsDocument, *workspace_settings.WorkspaceSettings]

func NewWorkspaceSettingsConsumer() *WorkspaceSettingsConsumer {
	return NewConsumer[*WorkspaceSettingsDocument, *workspace_settings.WorkspaceSettings]()
}

func NewWorkspaceSettings(ws *workspace_settings.WorkspaceSettings) (*WorkspaceSettingsDocument, string) {
	wsid := ws.ID().String()
	return &WorkspaceSettingsDocument{
		ID:          wsid,
		WorkspaceID: ws.Workspace().String(),
		Avatar:      ws.Avatar(),
	}, wsid
}

func (wsd *WorkspaceSettingsDocument) Model() (*workspace_settings.WorkspaceSettings, error) {
	wsid, err := id.WorkspaceSettingsIDFrom(wsd.ID)
	if err != nil {
		return nil, err
	}
	wid, err := accountdomain.WorkspaceIDFrom(wsd.WorkspaceID)
	if err != nil {
		return nil, err
	}

	return workspace_settings.New().
		ID(wsid).
		Workspace(wid).
		Avatar(wsd.Avatar).
		Tiles(NewWorkspaceResources(wsd.Tiles)).
		Terrains(NewWorkspaceResources(wsd.Terrains)).
		Build()
}

func NewWorkspaceResources(wr *WorkspaceResourceListDocument) *workspace_settings.WorkspaceResources {
	if wr == nil {
		return nil
	}
	// this doesn't work, need to find a better way
	var res *workspace_settings.WorkspaceResources
	res.SetResources(NewResources(wr.Resources))
	res.SetDefaultResource(id.ResourceIDFromRef(wr.DefaultResource))
	res.SetAllowSwitch(wr.AllowSwitch)
	return res
}

func NewResources(rd []*ResourceDocument) []*workspace_settings.Resource {
	if rd == nil {
		return nil
	}
	return lo.Map(rd, func(r *ResourceDocument, _ int) *workspace_settings.Resource {
		return NewResource(r)
	})
}

func NewResource(r *ResourceDocument) *workspace_settings.Resource {
	if r == nil {
		return nil
	}
	rid, err := id.ResourceIDFrom(r.ID)
	if err != nil {
		return nil
	}
	// this doesn't work, need to find a better way
	var res *workspace_settings.Resource
	res.SetID(rid)
	res.SetName(r.Name)
	res.SetURL(r.URL)
	res.SetImage(r.Image)
	return res
}
