package mongodoc

import (
	"time"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongogit"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type ItemDocument struct {
	ID        string
	Project   string
	Schema    string
	ModelID   string
	Fields    []ItemFieldDocument
	Timestamp time.Time
}

type ItemFieldDocument struct {
	F         string        `bson:"f,omitempty"`
	V         ValueDocument `bson:"v,omitempty"`
	Field     string        `bson:"schemafield,omitempty"` // compat
	ValueType string        `bson:"valuetype,omitempty"`   // compat
	Value     any           `bson:"value,omitempty"`       // compat
}

type ItemConsumer = mongox.SliceFuncConsumer[*ItemDocument, *item.Item]

func NewItemConsumer() *ItemConsumer {
	return NewComsumer[*ItemDocument, *item.Item]()
}

type VersionedItemConsumer = mongox.SliceFuncConsumer[*mongogit.Document[*ItemDocument], *version.Value[*item.Item]]

func NewVersionedItemConsumer() *VersionedItemConsumer {
	return mongox.NewSliceFuncConsumer(func(d *mongogit.Document[*ItemDocument]) (*version.Value[*item.Item], error) {
		item, err := d.Data.Model()
		if err != nil {
			return nil, err
		}

		v := mongogit.ToValue(d.Meta, item)
		return v, nil
	})
}

func NewItem(ws *item.Item) (*ItemDocument, string) {
	id := ws.ID().String()
	return &ItemDocument{
		ID:      id,
		Schema:  ws.Schema().String(),
		ModelID: ws.Model().String(),
		Project: ws.Project().String(),
		Fields: lo.FilterMap(ws.Fields(), func(f *item.Field, _ int) (ItemFieldDocument, bool) {
			v := NewOptionalValue(f.Value())
			if v == nil {
				return ItemFieldDocument{}, false
			}

			return ItemFieldDocument{
				F: f.FieldID().String(),
				V: *v,
			}, true
		}),
		Timestamp: ws.Timestamp(),
	}, id
}

func (d *ItemDocument) Model() (*item.Item, error) {
	iid, err := id.ItemIDFrom(d.ID)
	if err != nil {
		return nil, err
	}

	sid, err := id.SchemaIDFrom(d.Schema)
	if err != nil {
		return nil, err
	}

	mid, err := id.ModelIDFrom(d.ModelID)
	if err != nil {
		return nil, err
	}

	pid, err := id.ProjectIDFrom(d.Project)
	if err != nil {
		return nil, err
	}

	fields, err := util.TryMap(d.Fields, func(f ItemFieldDocument) (*item.Field, error) {
		// compat
		if f.Field != "" {
			f.F = f.Field
		}

		sf, err := item.FieldIDFrom(f.F)
		if err != nil {
			return nil, err
		}

		// compat
		if f.ValueType != "" {
			f.Value = ValueDocument{
				T: f.ValueType,
				V: f.Value,
			}
		}

		return item.NewField(sf, f.V.OptionalValue()), nil
	})
	if err != nil {
		return nil, err
	}

	return item.New().
		ID(iid).
		Project(pid).
		Schema(sid).
		Model(mid).
		Fields(fields).
		Timestamp(d.Timestamp).
		Build()
}

func NewItems(items item.List) ([]*ItemDocument, []string) {
	res := make([]*ItemDocument, 0, len(items))
	ids := make([]string, 0, len(items))
	for _, d := range items {
		if d == nil {
			continue
		}
		r, id := NewItem(d)
		res = append(res, r)
		ids = append(ids, id)
	}
	return res, ids
}
