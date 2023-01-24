//go:generate go run github.com/deepmap/oapi-codegen/cmd/oapi-codegen --config=types.cfg.yml ../../schemas/integration.yml

package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

var (
	ErrUnsupportedEntity = rerror.NewE(i18n.T("unsupported entity"))
)

func New(obj any, v string, urlResolver asset.URLResolver) (res any, err error) {
	// note: version (v) is not used currently

	switch o := obj.(type) {
	case *event.Event[any]:
		res, err = NewEvent(o, v, urlResolver)
	case *asset.Asset:
		res, err = NewAsset(o, urlResolver(o))
	case *item.Item:
		res = NewItem(o, nil)
	case item.Versioned:
		res = NewVersionedItem(o, nil)
	case item.ItemModelSchema:
		res = NewItemModelSchema(o)
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
