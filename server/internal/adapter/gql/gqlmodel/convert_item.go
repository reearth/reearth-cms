package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/samber/lo"
)

func ToItem(i *item.Item) *Item {
	if i == nil {
		return nil
	}

	return &Item{
		ID:        IDFrom(i.ID()),
		ProjectID: IDFrom(i.Project()),
		SchemaID:  IDFrom(i.Schema()),
		ModelID:   IDFrom(i.Model()),
		CreatedAt: i.Timestamp(),
		Fields: lo.Map(i.Fields(), func(f *item.Field, _ int) *ItemField {
			return &ItemField{
				SchemaFieldID: IDFrom(f.SchemaFieldID()),
				Type:          ToValueType(f.Value().Type()),
				Value:         f.Value().Value(),
			}
		}),
	}
}

func ToVersionedItem(v *version.Value[*item.Item]) *VersionedItem {
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
		Value:   ToItem(v.Value()),
	}
}

func ToItemFieldParam(field *ItemFieldInput) (*interfaces.ItemFieldParam, error) {
	if field == nil {
		return nil, nil
	}

	fid, err := ToID[id.Field](field.SchemaFieldID)
	if err != nil {
		return nil, err
	}

	v, err := value.New(FromValueType(field.Type), field.Value)
	if err != nil {
		return nil, err
	}

	return &interfaces.ItemFieldParam{
		SchemaFieldID: fid,
		Value:         v,
	}, nil
}

func ToItemFieldParams(fields []*ItemFieldInput) (res []interfaces.ItemFieldParam, err error) {
	for _, p := range fields {
		f, err := ToItemFieldParam(p)
		if err != nil {
			return nil, err
		}
		if f != nil {
			res = append(res, *f)
		}
	}
	return
}

func ToItemQuery(iq ItemQuery) *item.Query {
	wid, err := ToID[id.Workspace](iq.Workspace)
	if err != nil {
		return nil
	}
	pid, err := ToID[id.Project](iq.Project)
	if err != nil {
		return nil
	}
	return item.NewQuery(wid, pid, *iq.Q)
}
