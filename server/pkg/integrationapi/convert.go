package integrationapi

import (
	"errors"
	"time"

	openapi_types "github.com/deepmap/oapi-codegen/pkg/types"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/item"
)

var (
	ErrUnsupportedEntity = errors.New("unsupported entity")
)

func New(obj any, version string, urlResolver asset.URLResolver) (res any, err error) {
	// note: version is not used currently

	switch o := (obj).(type) {
	case *asset.Asset:
		res, err = NewAsset(o, urlResolver(o))
	case *item.Item:
		break
	// TODO: add later
	// case *schema.Schema:
	// 	break
	// case *project.Project:
	// 	break
	// case *model.Model:
	// 	break
	// case *thread.Thread:
	// 	break
	// case *integration.Integration:
	// 	break
	// case *user.Workspace:
	// 	break
	// case *user.User:
	// 	break
	default:
		return nil, ErrUnsupportedEntity
	}

	return
}

func ToDate(t time.Time) *openapi_types.Date {
	return &openapi_types.Date{
		Time: t,
	}
}
