package workspacesettings

import "errors"

var ErrInvalidResource = errors.New("invalid resource")

type ResourceType string

const (
	ResourceTypeTile    ResourceType = "TILE"
	ResourceTypeTerrain ResourceType = "TERRAIN"
)

type Resource struct {
	resourceType ResourceType
	tile         *TileResource
	terrain      *TerrainResource
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

// Validate returns ErrInvalidResource unless the resource holds exactly the tile or terrain its type names,
// with a known type and an ID, as only such resources are read back once stored.
func (r *Resource) Validate() error {
	if r == nil {
		return ErrInvalidResource
	}
	switch r.resourceType {
	case ResourceTypeTile:
		if r.tile != nil && r.terrain == nil && r.tile.rtype.IsValid() && !r.tile.id.IsNil() {
			return nil
		}
	case ResourceTypeTerrain:
		if r.terrain != nil && r.tile == nil && r.terrain.rtype.IsValid() && !r.terrain.id.IsNil() {
			return nil
		}
	}
	return ErrInvalidResource
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

func (r *Resource) Clone() *Resource {
	if r == nil {
		return nil
	}

	return &Resource{
		resourceType: r.resourceType,
		tile:         r.tile,
		terrain:      r.terrain,
	}
}
