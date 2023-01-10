package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/samber/lo"
)

func ToItem(i *item.Item, s *schema.Schema) *Item {
	if i == nil {
		return nil
	}

	return &Item{
		ID:            IDFrom(i.ID()),
		ProjectID:     IDFrom(i.Project()),
		SchemaID:      IDFrom(i.Schema()),
		ModelID:       IDFrom(i.Model()),
		UserID:        IDFromRef(i.User()),
		IntegrationID: IDFromRef(i.Integration()),
		ThreadID:      IDFrom(i.Thread()),
		CreatedAt:     i.Timestamp(),
		Fields: lo.Map(i.Fields(), func(f *item.Field, _ int) *ItemField {
			return &ItemField{
				SchemaFieldID: IDFrom(f.FieldID()),
				Type:          ToValueType(f.Type()),
				Value:         ToValue(f.Value(), s.Field(f.FieldID()).Multiple()),
			}
		}),
	}
}

func ToVersionedItem(v *version.Value[*item.Item], s *schema.Schema) *VersionedItem {
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
		Value:   ToItem(v.Value(), s),
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

	return item.NewQuery(pid, ToIDRef[id.Schema](iq.Schema), lo.FromPtr(iq.Q), nil)
}

func ToItemSort(is *ItemSort) *item.Sort {
	return &item.Sort{
		Direction: item.DirectionFrom(is.Direction.String()),
		SortBy:    item.SortTypeFrom(is.SortBy.String()),
	}
}
