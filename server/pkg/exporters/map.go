package exporters

import (
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
)

func MapFromItem(itm *item.Item, sp *schema.Package) map[string]any {
	if itm == nil {
		return nil
	}

	m := make(map[string]any)
	m["id"] = itm.ID().String()

	for _, sf := range sp.Schema().Fields() {
		f := itm.Field(sf.ID())
		if sf.IsGeometryField() {
			continue
		}
		m[sf.Key().String()] = f.Value().First().Interface()
	}

	return m
}
