package mongodoc

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/log"
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
	ResourceType string
	Tile         *TileResourceDocument
	Terrain      *TerrainResourceDocument
}

type TileResourceDocument struct {
	ID    string
	Type  string
	Props UrlResourcePropsDocument
}

type TerrainResourceDocument struct {
	ID    string
	Type  string
	Props CesiumResourcePropsDocument
}

type UrlResourcePropsDocument struct {
	Name  string
	URL   string
	Image string
}

type CesiumResourcePropsDocument struct {
	Name                 string
	URL                  string
	Image                string
	CesiumIonAssetID     string
	CesiumIonAccessToken string
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
		Tiles(FromResourceListDocument(wsd.Tiles, workspacesettings.ResourceTypeTile)).
		Terrains(FromResourceListDocument(wsd.Terrains, workspacesettings.ResourceTypeTerrain)).
		Build()
}

// FromResourceListDocument reads a list that holds resources of type t. Like
// resources of an unknown type, resources of another type are skipped, as
// settings stored before this was checked would otherwise fail to load and
// could not be fixed.
func FromResourceListDocument(wr *ResourceListDocument, t workspacesettings.ResourceType) *workspacesettings.ResourceList {
	if wr == nil {
		return nil
	}

	return workspacesettings.NewResourceList(FromResources(wr.Resources, t), id.ResourceIDFromRef(wr.SelectedResource), wr.Enabled)
}

func FromResources(rd []*ResourceDocument, t workspacesettings.ResourceType) []*workspacesettings.Resource {
	if rd == nil {
		return nil
	}
	return lo.FilterMap(rd, func(r *ResourceDocument, _ int) (*workspacesettings.Resource, bool) {
		res := FromResourceDocument(r)
		if res != nil && res.ResourceType() != t {
			log.Warnf("mongo workspace settings: skipping a %s resource stored with the %s resources", res.ResourceType(), t)
			return nil, false
		}
		return res, res != nil
	})
}

func FromResourceDocument(r *ResourceDocument) *workspacesettings.Resource {
	if r == nil {
		return nil
	}

	if r.Tile != nil {
		tileType := workspacesettings.TileType(r.Tile.Type)
		if !tileType.IsValid() {
			return nil
		}
		rid, err := id.ResourceIDFrom(r.Tile.ID)
		if err != nil {
			return nil
		}
		tile := workspacesettings.NewTileResource(rid, tileType, FromUrlResourcePropsDocument(r.Tile.Props))
		return workspacesettings.NewResource(workspacesettings.ResourceTypeTile, tile, nil)
	}

	if r.Terrain != nil {
		terrainType := workspacesettings.TerrainType(r.Terrain.Type)
		if !terrainType.IsValid() {
			return nil
		}
		rid, err := id.ResourceIDFrom(r.Terrain.ID)
		if err != nil {
			return nil
		}
		terrain := workspacesettings.NewTerrainResource(rid, terrainType, FromCesiumResourcePropsDocument(r.Terrain.Props))
		return workspacesettings.NewResource(workspacesettings.ResourceTypeTerrain, nil, terrain)
	}

	return nil
}

func FromUrlResourcePropsDocument(r UrlResourcePropsDocument) workspacesettings.UrlResourceProps {
	return workspacesettings.NewURLResourceProps(r.Name, r.URL, r.Image)
}

func FromCesiumResourcePropsDocument(r CesiumResourcePropsDocument) workspacesettings.CesiumResourceProps {
	return workspacesettings.NewCesiumResourceProps(r.Name, r.URL, r.Image, r.CesiumIonAssetID, r.CesiumIonAccessToken)
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
		ResourceType: string(r.ResourceType()),
		Tile:         ToTileResourceDocument(r.Tile()),
		Terrain:      ToTerrainResourceDocument(r.Terrain()),
	}
}

func ToTileResourceDocument(r *workspacesettings.TileResource) *TileResourceDocument {
	if r == nil {
		return nil
	}

	return &TileResourceDocument{
		ID:    r.ID().String(),
		Type:  string(r.Type()),
		Props: ToUrlResourcePropsDocument(r.Props()),
	}
}

func ToTerrainResourceDocument(r *workspacesettings.TerrainResource) *TerrainResourceDocument {
	if r == nil {
		return nil
	}

	return &TerrainResourceDocument{
		ID:    r.ID().String(),
		Type:  string(r.Type()),
		Props: ToCesiumResourcePropsDocument(r.Props()),
	}
}

func ToUrlResourcePropsDocument(r workspacesettings.UrlResourceProps) UrlResourcePropsDocument {
	return UrlResourcePropsDocument{
		Name:  r.Name(),
		URL:   r.URL(),
		Image: r.Image(),
	}
}

func ToCesiumResourcePropsDocument(r workspacesettings.CesiumResourceProps) CesiumResourcePropsDocument {
	return CesiumResourcePropsDocument{
		Name:                 r.Name(),
		URL:                  r.URL(),
		Image:                r.Image(),
		CesiumIonAssetID:     r.CesiumIonAssetID(),
		CesiumIonAccessToken: r.CesiumIonAccessToken(),
	}
}
