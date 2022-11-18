package item

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type Item struct {
	id        ID
	schema    SchemaID
	model     ModelID
	project   ProjectID
	fields    []*Field
	timestamp time.Time
}

type Versioned = *version.Value[*Item]

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

func (i *Item) Field(f FieldID) *Field {
	ff, _ := lo.Find(i.fields, func(g *Field) bool {
		return g.FieldID() == f
	})
	return ff
}

func (i *Item) UpdateFields(fields []*Field) {
	if fields == nil {
		return
	}

	newFields := lo.Filter(fields, func(field *Field, _ int) bool {
		return i.Field(field.field) == nil
	})

	i.fields = append(lo.FilterMap(i.fields, func(f *Field, _ int) (*Field, bool) {
		ff, found := lo.Find(fields, func(g *Field) bool {
			return g.FieldID() == f.FieldID()
		})

		if !found {
			return f, true
		}

		return ff, true
	}), newFields...)

	i.timestamp = util.Now()
}

func (i *Item) FilterFields(list id.FieldIDList) *Item {
	if i == nil || list == nil {
		return nil
	}

	fields := lo.Filter(i.fields, func(f *Field, i int) bool {
		return list.Has(f.FieldID())
	})

	return &Item{
		id:        i.id,
		schema:    i.schema,
		project:   i.project,
		fields:    fields,
		timestamp: i.timestamp,
	}
}

func (i *Item) SearchField(v string) *Field {
	if i == nil {
		return nil
	}
	for _, f := range i.fields {
		if s, ok := f.value.Value().Cast(value.TypeString).ValueString(); ok {
			if s == v {
				return f
			}
		}
	}
	return nil
}

func (i *Item) HasField(fid id.FieldID, value any) bool {
	for _, field := range i.fields {
		if field.field == fid && field.value == value {
			return true
		}
	}
	return false
}

type ItemAndSchema struct {
	Item   *Item
	Schema *schema.Schema
}
