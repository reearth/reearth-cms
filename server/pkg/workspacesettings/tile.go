package workspacesettings

type TileType string

const (
	TileTypeDefault             TileType = "DEFAULT"
	TileTypeRoadMap             TileType = "ROAD_MAP"
	TileTypeOpenStreetMap       TileType = "OPEN_STREET_MAP"
	TileTypeEarthAtNight        TileType = "EARTH_AT_NIGHT"
	TileTypeJapanGSIStandardMap TileType = "JAPAN_GSI_STANDARD_MAP"
	TileTypeURL                 TileType = "URL"
)

func (t TileType) IsValid() bool {
	switch t {
	case TileTypeDefault, TileTypeRoadMap, TileTypeOpenStreetMap, TileTypeEarthAtNight, TileTypeJapanGSIStandardMap, TileTypeURL:
		return true
	}
	return false
}

type TileResource struct {
	id    ResourceID
	rtype TileType
	props UrlResourceProps
}

func NewTileResource(id ResourceID, rtype TileType, props UrlResourceProps) *TileResource {
	return &TileResource{
		id:    id.Clone(),
		rtype: rtype,
		props: props,
	}
}

func (r *TileResource) ID() ResourceID {
	return r.id
}

func (r *TileResource) Type() TileType {
	return r.rtype
}

func (r *TileResource) Props() UrlResourceProps {
	return r.props
}
