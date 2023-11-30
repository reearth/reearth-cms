package mongodoc

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
	"github.com/samber/lo"
)

type WorkspaceSettingsDocument struct {
	ID       string
	Tiles    *WorkspaceResourceListDocument
	Terrains *WorkspaceResourceListDocument
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
		ID:       wsid,
		Tiles:    ToWorkspaceResourceListDocument(ws.Tiles()),
		Terrains: ToWorkspaceResourceListDocument(ws.Terrains()),
	}, wsid
}

func (wsd *WorkspaceSettingsDocument) Model() (*workspacesettings.WorkspaceSettings, error) {
	wid, err := accountdomain.WorkspaceIDFrom(wsd.ID)
	if err != nil {
		return nil, err
	}

	return workspacesettings.New().
		ID(wid).
		Tiles(FromWorkspaceResourceListDocument(wsd.Tiles)).
		Terrains(FromWorkspaceResourceListDocument(wsd.Terrains)).
		Build()
}

func FromWorkspaceResourceListDocument(wr *WorkspaceResourceListDocument) *workspacesettings.WorkspaceResourceList {
	if wr == nil {
		return nil
	}

	return workspacesettings.NewWorkspaceResourceList(FromResourceListDocument(wr.Resources), id.ResourceIDFromRef(wr.DefaultResource), wr.AllowSwitch)
}

func FromResourceListDocument(rd []*ResourceDocument) []*workspacesettings.Resource {
	if rd == nil {
		return nil
	}
	return lo.Map(rd, func(r *ResourceDocument, _ int) *workspacesettings.Resource {
		return FromResourceDocument(r)
	})
}

func FromResourceDocument(r *ResourceDocument) *workspacesettings.Resource {
	if r == nil {
		return nil
	}
	rid, err := id.ResourceIDFrom(r.ID)
	if err != nil {
		return nil
	}

	return workspacesettings.NewResource(rid, r.Name, r.URL, r.Image)
}

func ToWorkspaceResourceListDocument(wr *workspacesettings.WorkspaceResourceList) *WorkspaceResourceListDocument {
	if wr == nil {
		return nil
	}

	return &WorkspaceResourceListDocument{
		Resources:       ToResourceDocumentList(wr.Resources()),
		DefaultResource: wr.DefaultResource().StringRef(),
		AllowSwitch:     wr.AllowSwitch(),
	}
}

func ToResourceDocumentList(rs []*workspacesettings.Resource) []*ResourceDocument {
	if rs == nil {
		return nil
	}

	res := make([]*ResourceDocument, 0, len(rs))
	for _, r := range rs {
		res = append(res, ToResourceDocument(r))
	}
	return res
}

func ToResourceDocument(r *workspacesettings.Resource) *ResourceDocument {
	if r == nil {
		return nil
	}

	return &ResourceDocument{
		ID:    r.ID().String(),
		Name:  r.Name(),
		URL:   r.URL(),
		Image: r.Image(),
	}
}
