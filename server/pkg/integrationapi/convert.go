package integrationapi

import (
	"errors"
	"time"

	openapi_types "github.com/deepmap/oapi-codegen/pkg/types"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/version"
)

var (
	ErrUnsupportedEntity = errors.New("unsupported entity")
)

func New(obj any, v string, urlResolver asset.URLResolver) (res any, err error) {
	// note: version is not used currently

	switch o := obj.(type) {
	case *asset.Asset:
		res, err = NewAsset(o, urlResolver(o))
	case *item.Item:
		res = NewItem(o)
	case *version.Value[*item.Item]:
		res = NewVersionedItem(o)
	// TODO: add later
	// case *schema.Schema:
	// case *project.Project:
	// case *model.Model:
	// case *thread.Thread:
	// case *integration.Integration:
	// case *user.Workspace:
	// case *user.User:
	default:
		err = ErrUnsupportedEntity
	}

	return
}

func ToDate(t time.Time) *openapi_types.Date {
	return &openapi_types.Date{
		Time: t,
	}
}
