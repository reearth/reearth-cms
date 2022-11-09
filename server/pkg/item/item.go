package item

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type VersionedItem = version.Value[Item]

type Item struct {
	id        ID
	schema    SchemaID
	model     ModelID
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

func (i *Item) Model() ModelID {
	return i.model
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

func (i *Item) FilterFields(list id.FieldIDList) *Item {
	if i == nil || list == nil {
		return nil
	}

	fields := lo.Filter(i.fields, func(f *Field, i int) bool {
		return list.Has(f.SchemaFieldID())
	})

	return &Item{
		id:        i.id,
		schema:    i.schema,
		project:   i.project,
		fields:    fields,
		timestamp: i.timestamp,
	}
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

func (i *Item) HasField(fid id.FieldID, value any, vt schema.Type) bool {
	res := lo.Map(i.fields, func(f *Field, _ int) bool {
		return f.SchemaFieldID() == fid && f.ValueType() == vt && f.Value() == value
	})
	return len(res) > 0
}
