package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
)

func CSVFromItems(items item.VersionedList, s *schema.Schema) (string, error) {
	csv, err := exporters.CSVFromItems(items, s)
	if err != nil {
		return "", err
	}
	return csv, nil
}
