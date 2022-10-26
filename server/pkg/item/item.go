package item

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/util"
	"golang.org/x/exp/slices"
)

type VersionedItem = version.Value[Item]

type Item struct {
	id        ID
	schema    SchemaID
	project   ProjectID
	fields    []*Field
	timestamp time.Time
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

func (i *Item) Timestamp() time.Time {
	return i.timestamp
}

func (i *Item) UpdateFields(fields []*Field) {
	if fields == nil {
		return
	}
	i.fields = slices.Clone(fields)
	i.timestamp = util.Now()
}

func (i *Item) FindFieldByValue(v any) bool {
	if i == nil {
		return false
	}
	for _, f := range i.fields {
		if f.value == v {
			return true
		}
	}
	return false
}
