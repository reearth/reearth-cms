package workspacesettings

import (
	"errors"

	"github.com/reearth/reearthx/rerror"
)

var ErrInvalidResource = errors.New("invalid resource")

func (t TileType) IsValid() bool {
	switch t {
	case TileTypeDefault, TileTypeRoadMap, TileTypeOpenStreetMap, TileTypeEarthAtNight,
		TileTypeJapanGSIStandardMap, TileTypeURL:
		return true
	default:
		return false
	}
}

func (t TerrainType) IsValid() bool {
	switch t {
	case TerrainTypeReearthTerrain, TerrainTypeCesiumIon:
		return true
	default:
		return false
	}
}

// Validate returns ErrInvalidResource unless the resource holds exactly one
// tile or terrain, matching its resource type, with an ID and a known type.
func (r *Resource) Validate() error {
	if r == nil {
		return ErrInvalidResource
	}
	switch {
	case r.resourceType == ResourceTypeTile && r.tile != nil && r.terrain == nil:
		if r.tile.id.IsNil() || !r.tile.rtype.IsValid() {
			return ErrInvalidResource
		}
	case r.resourceType == ResourceTypeTerrain && r.terrain != nil && r.tile == nil:
		if r.terrain.id.IsNil() || !r.terrain.rtype.IsValid() {
			return ErrInvalidResource
		}
	default:
		return ErrInvalidResource
	}
	return nil
}

// Validate returns an error when the settings can not be stored: every
// resource of the tiles and the terrains must be valid.
func (ws *WorkspaceSettings) Validate() error {
	if ws == nil {
		return rerror.ErrInvalidParams
	}
	for _, l := range []*ResourceList{ws.tiles, ws.terrains} {
		if l == nil {
			continue
		}
		for _, r := range l.resources {
			if err := r.Validate(); err != nil {
				return err
			}
		}
	}
	return nil
}
