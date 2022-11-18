package mongodoc

import (
	"time"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongogit"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type ItemDocument struct {
	ID          string
	Project     string
	Schema      string
	ModelID     string
	Fields      []ItemFieldDoc
	Timestamp   time.Time
	User        string
	Integration string
}

type ItemFieldDoc struct {
	SchemaField string
	ValueType   string
	Value       any
}

type ItemConsumer = mongox.SliceFuncConsumer[*ItemDocument, *item.Item]

func NewItemConsumer() *ItemConsumer {
	return NewComsumer[*ItemDocument, *item.Item]()
}

type VersionedItemConsumer = mongox.SliceFuncConsumer[*mongogit.Document[*ItemDocument], *version.Value[*item.Item]]

func NewVersionedItemConsumer() *VersionedItemConsumer {
	return mongox.NewSliceFuncConsumer(func(d *mongogit.Document[*ItemDocument]) (*version.Value[*item.Item], error) {
		itm, err := d.Data.Model()
		if err != nil {
			return nil, err
		}

		v := mongogit.ToValue(d.Meta, itm)
		return v, nil
	})
}

func NewItem(i *item.Item) (*ItemDocument, string) {
	itmId := i.ID().String()
	return &ItemDocument{
		ID:      itmId,
		Schema:  i.Schema().String(),
		ModelID: i.Model().String(),
		Project: i.Project().String(),
		Fields: lo.Map(i.Fields(), func(f *item.Field, _ int) ItemFieldDoc {
			return ItemFieldDoc{
				SchemaField: f.SchemaFieldID().String(),
				ValueType:   string(f.ValueType()),
				Value:       f.Value(),
			}
		}),
		Timestamp:   i.Timestamp(),
		User:        i.User().String(),
		Integration: i.Integration().String(),
	}, itmId
}

func (d *ItemDocument) Model() (*item.Item, error) {
	itmId, err := id.ItemIDFrom(d.ID)
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

	fields, err := util.TryMap(d.Fields, func(f ItemFieldDoc) (*item.Field, error) {
		sf, err := schema.FieldIDFrom(f.SchemaField)
		if err != nil {
			return nil, err
		}
		return item.NewField(sf, schema.Type(f.ValueType), f.Value), nil
	})
	if err != nil {
		return nil, err
	}

	ib := item.New().
		ID(itmId).
		Project(pid).
		Schema(sid).
		Model(mid).
		Fields(fields).
		Timestamp(d.Timestamp)

	if len(d.User) != 0 {
		uId, err := id.UserIDFrom(d.User)
		if err != nil {
			return nil, err
		}
		ib = ib.User(uId)
	}

	if len(d.Integration) != 0 {
		iId, err := id.IntegrationIDFrom(d.Integration)
		if err != nil {
			return nil, err
		}
		ib = ib.Integration(iId)
	}

	return ib.Build()
}

func NewItems(items item.List) ([]*ItemDocument, []string) {
	res := make([]*ItemDocument, 0, len(items))
	ids := make([]string, 0, len(items))
	for _, d := range items {
		if d == nil {
			continue
		}
		r, itmId := NewItem(d)
		res = append(res, r)
		ids = append(ids, itmId)
	}
	return res, ids
}
