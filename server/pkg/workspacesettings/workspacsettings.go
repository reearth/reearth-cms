package workspacesettings

import (
	"github.com/reearth/reearthx/util"
	"golang.org/x/exp/slices"
)

type ResourceType string

const (
	ResourceTypeTile    ResourceType = "TILE"
	ResourceTypeTerrain ResourceType = "TERRAIN"
)

type TileType string

const (
	TileTypeDefault             TileType = "DEFAULT"
	TileTypeLabelled            TileType = "LABELLED"
	TileTypeRoadMap             TileType = "ROAD_MAP"
	TileTypeStamenWaterColor    TileType = "STAMEN_WATERCOLOR"
	TileTypeStamenToner         TileType = "STAMEN_TONER"
	TileTypeOpenStreetMap       TileType = "OPEN_STREET_MAP"
	TileTypeESRITopography      TileType = "ESRI_TOPOGRAPHY"
	TileTypeEarthAtNight        TileType = "EARTH_AT_NIGHT"
	TileTypeJapanGISStandardMap TileType = "JAPAN_GSI_STANDARD_MAP"
	TileTypeURL                 TileType = "URL"
)

type TerrainType string

const (
	TerrainTypeCesiumWorldTerrain TerrainType = "CESIUM_WORLD_TERRAIN"
	TerrainTypeArcGISTerrain      TerrainType = "ARC_GIS_TERRAIN"
	TerrainTypeCesiumIon          TerrainType = "CESIUM_ION"
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
	resourceType ResourceType
	tile         *TileResource
	terrain      *TerrainResource
}

type TileResource struct {
	id    ResourceID
	rtype TileType
	props UrlResourceProps
}

type TerrainResource struct {
	id    ResourceID
	rtype TerrainType
	props CesiumResourceProps
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

func (r *Resource) ResourceType() ResourceType {
	return r.resourceType
}

func (r *Resource) Tile() *TileResource {
	return r.tile
}

func (r *Resource) Terrain() *TerrainResource {
	return r.terrain
}

func NewResource(resourceType ResourceType, tile *TileResource, terrain *TerrainResource) *Resource {
	return &Resource{
		resourceType: resourceType,
		tile:         tile,
		terrain:      terrain,
	}
}

func (r *Resource) SetResourceType(n ResourceType) {
	r.resourceType = n
}

func (r *Resource) SetTile(n *TileResource) {
	r.tile = n
}

func (r *Resource) SetTerrain(n *TerrainResource) {
	r.terrain = n
}

func NewTileResource(id ResourceID, rtype TileType, props UrlResourceProps) *TileResource {
	return &TileResource{
		id:    id.Clone(),
		rtype: rtype,
		props: props,
	}
}

func NewTerrainResource(id ResourceID, rtype TerrainType, props CesiumResourceProps) *TerrainResource {
	return &TerrainResource{
		id:    id.Clone(),
		rtype: rtype,
		props: props,
	}
}

func NewURLResourceProps(name, url, image string) UrlResourceProps {
	return UrlResourceProps{
		name:  name,
		url:   url,
		image: image,
	}
}

func NewCesiumResourceProps(name, url, image, cesiumIonAssetId, cesiumIonAccessToken string) CesiumResourceProps {
	return CesiumResourceProps{
		name:                 name,
		url:                  url,
		image:                image,
		cesiumIonAssetId:     cesiumIonAssetId,
		cesiumIonAccessToken: cesiumIonAccessToken,
	}
}
