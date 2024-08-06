package integrationapi

import (
	"io"

	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
)

func CSVFromItems(pw *io.PipeWriter, items item.VersionedList, s *schema.Schema) error {
	err := exporters.CSVFromItems(pw, items, s)
	if err != nil {
		return err
	}
	return nil
}
