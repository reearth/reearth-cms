package mongodoc

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
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

type WorkspaceSettingsConsumer = mongox.SliceFuncConsumer[*WorkspaceSettingsDocument, *workspacesettings.WorkspaceSettings]

func NewWorkspaceSettingsConsumer() *WorkspaceSettingsConsumer {
	return NewConsumer[*WorkspaceSettingsDocument, *workspacesettings.WorkspaceSettings]()
}

func NewWorkspaceSettings(ws *workspacesettings.WorkspaceSettings) (*WorkspaceSettingsDocument, string) {
	wsid := ws.ID().String()
	return &WorkspaceSettingsDocument{
		ID:          wsid,
		WorkspaceID: ws.Workspace().String(),
		Avatar:      ws.Avatar(),
	}, wsid
}

func (wsd *WorkspaceSettingsDocument) Model() (*workspacesettings.WorkspaceSettings, error) {
	wsid, err := id.WorkspaceSettingsIDFrom(wsd.ID)
	if err != nil {
		return nil, err
	}
	wid, err := accountdomain.WorkspaceIDFrom(wsd.WorkspaceID)
	if err != nil {
		return nil, err
	}

	return workspacesettings.New().
		ID(wsid).
		Workspace(wid).
		Avatar(wsd.Avatar).
		Tiles(NewWorkspaceResources(wsd.Tiles)).
		Terrains(NewWorkspaceResources(wsd.Terrains)).
		Build()
}

func NewWorkspaceResources(wr *WorkspaceResourceListDocument) *workspacesettings.WorkspaceResources {
	if wr == nil {
		return nil
	}
	// this doesn't work, need to find a better way
	var res *workspacesettings.WorkspaceResources
	res.SetResources(NewResources(wr.Resources))
	res.SetDefaultResource(id.ResourceIDFromRef(wr.DefaultResource))
	res.SetAllowSwitch(wr.AllowSwitch)
	return res
}

func NewResources(rd []*ResourceDocument) []*workspacesettings.Resource {
	if rd == nil {
		return nil
	}
	return lo.Map(rd, func(r *ResourceDocument, _ int) *workspacesettings.Resource {
		return NewResource(r)
	})
}

func NewResource(r *ResourceDocument) *workspacesettings.Resource {
	if r == nil {
		return nil
	}
	rid, err := id.ResourceIDFrom(r.ID)
	if err != nil {
		return nil
	}
	// this doesn't work, need to find a better way
	var res *workspacesettings.Resource
	res.SetID(rid)
	res.SetName(r.Name)
	res.SetURL(r.URL)
	res.SetImage(r.Image)
	return res
}
