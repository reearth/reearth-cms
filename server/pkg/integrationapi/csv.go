package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
)

func BuildCSVHeaders(s *schema.Schema) []string {
	return exporters.BuildCSVHeaders(s)
}

func RowFromItem(itm *item.Item, nonGeoFields []*schema.Field) ([]string, bool) {
	return exporters.RowFromItem(itm, nonGeoFields)
}