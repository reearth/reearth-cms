package integration

import (
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
)

func featureCollectionFromItems(ver item.VersionedList, s *schema.Schema) (*integrationapi.FeatureCollection, error) {
	return integrationapi.FeatureCollectionFromItems(ver, s)
}
