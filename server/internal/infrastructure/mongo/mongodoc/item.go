package mongodoc

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"go.mongodb.org/mongo-driver/bson"
)

type ItemDocument struct {
	ID            string
	SchemaModel   string
	CreatedAt     time.Time
	UpdatedAt     time.Time
	PublicVersion string
	LatestVersion *ItemVersionDoc
	Versions      []ItemVersionDoc
}
type ItemVersionDoc struct {
	Version string
	Parent  []string
	Ref     []string
	Fields  []string
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
	var versionsDoc []ItemVersionDoc
	for _, v := range ws.Versions() {
		versionsDoc = append(versionsDoc, ItemVersionDoc{
			Version: v.Version(),
			Parent:  v.Parent(),
			Ref:     v.Ref(),
			Fields:  v.Fields().Strings(),
		})
	}
	vDoc := &ItemVersionDoc{
		Version: ws.LatestVersion().Version(),
		Parent:  ws.LatestVersion().Parent(),
		Ref:     ws.LatestVersion().Ref(),
		Fields:  ws.LatestVersion().Fields().Strings(),
	}
	id := ws.ID().String()
	return &ItemDocument{
		ID:            id,
		SchemaModel:   ws.ModelId().String(),
		CreatedAt:     ws.CreatedAt(),
		UpdatedAt:     ws.UpdatedAt(),
		PublicVersion: ws.PublicVersion(),
		LatestVersion: vDoc,
		Versions:      versionsDoc,
	}, id
}

func (d *ItemDocument) Model() (*item.Item, error) {
	iid, err := id.ItemIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	mid, err := id.ModelIDFrom(d.SchemaModel)
	if err != nil {
		return nil, err
	}

	var versions []*item.Version
	if d.Versions != nil {
		for _, v := range d.Versions {
			fids, err := id.FieldIDListFrom(v.Fields)
			if err != nil {
				return nil, err
			}
			iv := item.NewVersion(&v.Version, v.Parent, v.Ref, fids)
			versions = append(versions, iv)
		}
	}
	lvd := d.LatestVersion
	fl, err := id.FieldIDListFrom(lvd.Fields)
	if err != nil {
		return nil, err
	}
	lv := item.NewVersion(&lvd.Version, lvd.Parent, lvd.Ref, fl)
	return item.New().
		ID(iid).
		ModelID(mid).
		CreatedAt(d.CreatedAt).
		UpdatedAt(d.UpdatedAt).
		PublicVersion(d.PublicVersion).
		LatestVersion(lv).
		Versions(versions).
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
