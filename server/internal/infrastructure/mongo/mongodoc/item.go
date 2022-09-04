package mongodoc

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"go.mongodb.org/mongo-driver/bson"
)

type ItemDocument struct {
	ID     string
	Schema string
	Fields []ItemFieldDoc
}
type ItemFieldDoc struct {
	SchemaField string
	ValueType   string
	Value       any
}

type ItemConsumer struct {
	Rows item.List
}

func (c *ItemConsumer) Consume(raw bson.Raw) error {
	if raw == nil {
		return nil
	}

	var doc ItemDocument
	if err := bson.Unmarshal(raw, &doc); err != nil {
		return err
	}
	item, err := doc.Model()
	if err != nil {
		return err
	}
	c.Rows = append(c.Rows, item)
	return nil
}

func NewItem(ws *item.Item) (*ItemDocument, string) {
	var fieldDoc []ItemFieldDoc
	for _, f := range ws.Fields() {
		fieldDoc = append(fieldDoc, ItemFieldDoc{
			SchemaField: f.SchemaFieldID().String(),
			ValueType:   string(f.ValueType()),
			Value:       f.Value(),
		})
	}

	id := ws.ID().String()
	sid := ws.Schema().String()
	return &ItemDocument{
		ID:     id,
		Schema: sid,
		Fields: fieldDoc,
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

	var fields []*item.Field
	if d.Fields != nil {
		for _, f := range d.Fields {
			sf, err := schema.FieldIDFrom(f.SchemaField)
			if err != nil {
				return nil, err
			}

			itemField := item.NewField(sf, schema.Type(f.ValueType), f.Value)
			fields = append(fields, itemField)
		}
	}
	return item.New().
		ID(iid).
		Schema(sid).
		Fields(fields).
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
