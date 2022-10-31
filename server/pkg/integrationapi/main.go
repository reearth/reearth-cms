package integration

import "github.com/reearth/reearth-cms/server/pkg/asset"

func MarshalJSON(obj any, version string) ([]byte, error) {
	switch (obj).(type) {
	case *asset.Asset:
		break
	default:
		//TODO: return error
		break
	}
	return nil, nil
}
