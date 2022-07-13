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
		ProjectID:   IDFrom(a.Project()),
		CreatedAt:   a.CreatedAt(),
		CreatedBy:   IDFrom(a.CreatedBy()),
		FileName:    a.FileName(),
		Size:        int64(a.Size()),
		URL:         a.URL(),
		AssetType:   a.AssetType(),
	}
}

