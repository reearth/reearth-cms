package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/asset"
)

func ToAsset(a *asset.Asset) *Asset {
	if a == nil {
		return nil
	}

	return &Asset{
		ID:          IDFrom(a.ID()),
		CreatedAt:   a.CreatedAt(),
		TeamID:      IDFrom(a.Team()),
		Name:        a.Name(),
		Size:        a.Size(),
		URL:         a.URL(),
		ContentType: a.ContentType(),
	}
}
