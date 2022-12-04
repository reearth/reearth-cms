package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/samber/lo"
)

// TODO: fix callers and get the multiple value from the schema
func ToItem(i *item.Item, multiple bool) *Item {
	if i == nil {
		return nil
	}

	return &Item{
		ID:        IDFrom(i.ID()),
		ProjectID: IDFrom(i.Project()),
		SchemaID:  IDFrom(i.Schema()),
		ModelID:   IDFrom(i.Model()),
		ThreadID:  IDFrom(i.Thread()),
		CreatedAt: i.Timestamp(),
		Fields: lo.Map(i.Fields(), func(f *item.Field, _ int) *ItemField {
			return &ItemField{
				SchemaFieldID: IDFrom(f.FieldID()),
				Type:          ToValueType(f.Type()),
				Value:         ToValue(f.Value(), multiple),
			}
		}),
	}
}

// TODO: fix callers and get the multiple value from the schema
func ToVersionedItem(v *version.Value[*item.Item], multiple bool) *VersionedItem {
	if v == nil {
		return nil
	}

	parents := lo.Map(v.Parents().Values(), func(v version.Version, _ int) string {
		return v.String()
	})
	refs := lo.Map(v.Refs().Values(), func(v version.Ref, _ int) string {
		return v.String()
	})
	return &VersionedItem{
		Version: v.Version().String(),
		Parents: parents,
		Refs:    refs,
		Value:   ToItem(v.Value(), multiple),
	}
}

func ToItemParam(field *ItemFieldInput) *interfaces.ItemFieldParam {
	if field == nil {
		return nil
	}

	fid, err := ToID[id.Field](field.SchemaFieldID)
	if err != nil {
		return nil
	}

	return &interfaces.ItemFieldParam{
		Field: fid,
		Type:  FromValueType(field.Type),
		Value: field.Value,
	}
}

func ToItemQuery(iq ItemQuery) *item.Query {
	pid, err := ToID[id.Project](iq.Project)
	if err != nil {
		return nil
	}
	return item.NewQuery(pid, lo.FromPtr(iq.Q), nil)
}
