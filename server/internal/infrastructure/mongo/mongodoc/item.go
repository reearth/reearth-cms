package mongodoc

import (
	"time"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongogit"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type ItemDocument struct {
	ID                   string
	Project              string
	Schema               string
	Thread               string
	ModelID              string
	Fields               []ItemFieldDocument
	Timestamp            time.Time
	User                 *string
	Integration          *string
	Assets               []string `bson:"assets,omitempty"`
	MetadataItem         *string
	IsMetadata           bool
	OriginalItem         *string
	UpdatedByUser        *string
	UpdatedByIntegration *string
}

type ItemFieldDocument struct {
	F         string        `bson:"f,omitempty"`
	V         ValueDocument `bson:"v,omitempty"`
	Field     string        `bson:"schemafield,omitempty"` // compat
	ValueType string        `bson:"valuetype,omitempty"`   // compat
	Value     any           `bson:"value,omitempty"`       // compat
	ItemGroup *string
}

type ItemConsumer = mongox.SliceFuncConsumer[*ItemDocument, *item.Item]

func NewItemConsumer() *ItemConsumer {
	return NewConsumer[*ItemDocument, *item.Item]()
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
	d := ItemDocument{
		ID:           itmId,
		Schema:       i.Schema().String(),
		ModelID:      i.Model().String(),
		Project:      i.Project().String(),
		MetadataItem: i.MetadataItem().StringRef(),
		OriginalItem: i.OriginalItem().StringRef(),
		Fields: lo.FilterMap(i.Fields(), func(f *item.Field, _ int) (ItemFieldDocument, bool) {
			v := NewMultipleValue(f.Value())
			if v == nil {
				return ItemFieldDocument{}, false
			}

			return ItemFieldDocument{
				ItemGroup: f.ItemGroup().StringRef(),
				F:         f.FieldID().String(),
				V:         *v,
			}, true
		}),
		Timestamp:            i.Timestamp(),
		User:                 i.User().StringRef(),
		UpdatedByUser:        i.UpdatedByUser().StringRef(),
		UpdatedByIntegration: i.UpdatedByIntegration().StringRef(),
		Integration:          i.Integration().StringRef(),
		Assets:               i.AssetIDs().Strings(),
		IsMetadata:           i.IsMetadata(),
	}
	if !i.Thread().IsEmpty() {
		d.Thread = i.Thread().String()
	}
	return &d, itmId
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
		ig := id.ItemGroupIDFromRef(f.ItemGroup)
		return item.NewField(sf, f.V.MultipleValue(), ig), nil
	})
	if err != nil {
		return nil, err
	}

	ib := item.New().
		ID(itmId).
		Project(pid).
		Schema(sid).
		UpdatedByUser(accountdomain.UserIDFromRef(d.UpdatedByUser)).
		UpdatedByIntegration(id.IntegrationIDFromRef(d.UpdatedByIntegration)).
		Model(mid).
		MetadataItem(id.ItemIDFromRef(d.MetadataItem)).
		OriginalItem(id.ItemIDFromRef(d.OriginalItem)).
		IsMetadata(d.IsMetadata).
		Fields(fields).
		Timestamp(d.Timestamp)

	if d.Thread != "" {
		tid, err := id.ThreadIDFrom(d.Thread)
		if err != nil {
			return nil, err
		}
		ib.Thread(tid)
	}

	if uId := accountdomain.UserIDFromRef(d.User); uId != nil {
		ib = ib.User(*uId)
	}

	if iId := id.IntegrationIDFromRef(d.Integration); iId != nil {
		ib = ib.Integration(*iId)
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
