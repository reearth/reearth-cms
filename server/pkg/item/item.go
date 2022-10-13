package item

import (
	"github.com/reearth/reearth-cms/server/pkg/version"
	"golang.org/x/exp/slices"
)

type VersionedItem = version.Value[Item]

type Item struct {
	id      ID
	schema  SchemaID
	project ProjectID
	fields  []*Field
}

func (i *Item) ID() ID {
	return i.id
}

func (i *Item) Fields() []*Field {
	return slices.Clone(i.fields)
}

func (i *Item) Project() ProjectID {
	return i.project
}

func (i *Item) Schema() SchemaID {
	return i.schema
}

func (i *Item) UpdateFields(fields []*Field) {
	if fields == nil {
		return
	}
	i.fields = slices.Clone(fields)
}
