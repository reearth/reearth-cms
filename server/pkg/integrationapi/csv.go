package integrationapi

import (
	"encoding/csv"

	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
)

func CSVFromItems(w *csv.Writer, items item.VersionedList, s *schema.Schema) error {
	err := exporters.CSVFromItems(w, items, s)
	if err != nil {
		return err
	}
	return nil
}
