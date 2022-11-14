package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/asset"
)

func NewWebhook(obj any, version string, urlResolver asset.URLResolver) (any, error) {
	res, err := New(obj, version, urlResolver)
	if err != nil {
		return nil, err
	}
	return res, nil
}
