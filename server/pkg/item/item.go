package item

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type VersionedItem = version.Value[Item]

type Item struct {
	id       ID
	schemaID schema.ID
	fields   []*Field
}

func (i *Item) ID() ID {
	return i.id
}

func (i *Item) Fields() []*Field {
	return slices.Clone(i.fields)
}

func (i *Item) Schema() schema.ID {
	return i.schemaID
}

func (i *Item) UpdateFields(fields []*Field) {
	if fields == nil {
		return
	}
	i.fields = slices.Clone(fields)
}

func (i *Item) Filtered(list id.FieldIDList) *Item {
	if i == nil || list == nil {
		return nil
	}

	var res []*Field
	for _, f := range i.fields {
		_, ok := lo.Find(list, func(fid schema.FieldID) bool {
			return f.schemaFieldID == fid
		})
		if ok {
			res = append(res, f)
		}
	}

	return &Item{
		id:       i.id.Clone(),
		schemaID: i.schemaID.Clone(),
		fields:   res,
	}
}
