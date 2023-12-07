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
	Tiles    *ResourceListDocument
	Terrains *ResourceListDocument
}

type ResourceListDocument struct {
	Resources        []*ResourceDocument
	SelectedResource *string
	Enabled          *bool // only in terrains
}

type ResourceDocument struct {
	ID                   string
	Type                 string
	Name                 string
	URL                  string
	Image                string
	CesiumIonAssetID     *string // only in terrains
	CesiumIonAccessToken *string // only in terrains
}

type WorkspaceSettingsConsumer = mongox.SliceFuncConsumer[*WorkspaceSettingsDocument, *workspacesettings.WorkspaceSettings]

func NewWorkspaceSettingsConsumer() *WorkspaceSettingsConsumer {
	return NewConsumer[*WorkspaceSettingsDocument, *workspacesettings.WorkspaceSettings]()
}

func NewWorkspaceSettings(ws *workspacesettings.WorkspaceSettings) (*WorkspaceSettingsDocument, string) {
	wsid := ws.ID().String()
	return &WorkspaceSettingsDocument{
		ID:       wsid,
		Tiles:    ToResourceListDocument(ws.Tiles()),
		Terrains: ToResourceListDocument(ws.Terrains()),
	}, wsid
}

func (wsd *WorkspaceSettingsDocument) Model() (*workspacesettings.WorkspaceSettings, error) {
	wid, err := accountdomain.WorkspaceIDFrom(wsd.ID)
	if err != nil {
		return nil, err
	}

	return workspacesettings.New().
		ID(wid).
		Tiles(FromResourceListDocument(wsd.Tiles)).
		Terrains(FromResourceListDocument(wsd.Terrains)).
		Build()
}

func FromResourceListDocument(wr *ResourceListDocument) *workspacesettings.ResourceList {
	if wr == nil {
		return nil
	}

	return workspacesettings.NewResourceList(FromResources(wr.Resources), id.ResourceIDFromRef(wr.SelectedResource), wr.Enabled)
}

func FromResources(rd []*ResourceDocument) []*workspacesettings.Resource {
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

	return workspacesettings.NewResource(rid, r.Type, r.Name, r.URL, r.Image, r.CesiumIonAssetID, r.CesiumIonAccessToken)
}

func ToResourceListDocument(wr *workspacesettings.ResourceList) *ResourceListDocument {
	if wr == nil {
		return nil
	}

	return &ResourceListDocument{
		Resources:        ToResources(wr.Resources()),
		SelectedResource: wr.SelectedResource().StringRef(),
		Enabled:          wr.Enabled(),
	}
}

func ToResources(rs []*workspacesettings.Resource) []*ResourceDocument {
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
		ID:                   r.ID().String(),
		Type:                 r.Type(),
		Name:                 r.Name(),
		URL:                  r.URL(),
		Image:                r.Image(),
		CesiumIonAssetID:     r.CesiumIonAssetID(),
		CesiumIonAccessToken: r.CesiumIonAccessToken(),
	}
}
