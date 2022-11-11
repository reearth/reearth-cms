package integrationapi

//go:generate go run github.com/deepmap/oapi-codegen/cmd/oapi-codegen --config=types.cfg.yml ../../schemas/integration.yml

import (
	"encoding/json"
	"errors"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearth-cms/server/pkg/user"
)

var (
	ErrUnsupportedEntity = errors.New("unsupported entity")
)

func MarshalJSON(obj any, version string, urlResolver asset.URLResolver) ([]byte, error) {
	var res any
	switch o := (obj).(type) {
	case *asset.Asset:
		res = ToAsset(o, urlResolver)
	case *item.Item:
		// res =
	case *schema.Schema:
		break
	case *project.Project:
		break
	case *model.Model:
		break
	case *thread.Thread:
		break
	case *integration.Integration:
		break
	case *user.Workspace:
		break
	case *user.User:
		break
	default:
		return nil, ErrUnsupportedEntity
	}

	return json.Marshal(res)
}
