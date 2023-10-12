package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

func ToItem(vi item.Versioned, s *schema.Schema, gsList schema.List) *Item {
	if vi == nil || vi.Value() == nil {
		return nil
	}

	i := vi.Value()
	itemFields := toItemFields(i.Fields(), s)
	var groupFields []*ItemField
	for _, s2 := range gsList {
		groupFields = append(groupFields, toItemFields(i.Fields(), s2)...)
	}
	return &Item{
		ID:                     IDFrom(i.ID()),
		ProjectID:              IDFrom(i.Project()),
		SchemaID:               IDFrom(i.Schema()),
		ModelID:                IDFrom(i.Model()),
		UserID:                 IDFromRef(i.User()),
		IntegrationID:          IDFromRef(i.Integration()),
		ThreadID:               IDFrom(i.Thread()),
		MetadataID:             IDFromRef(i.MetadataItem()),
		UpdatedByIntegrationID: IDFromRef(i.UpdatedByIntegration()),
		UpdatedByUserID:        IDFromRef(i.UpdatedByUser()),
		CreatedAt:              i.ID().Timestamp(),
		UpdatedAt:              i.Timestamp(),
		Fields:                 append(itemFields, groupFields...),
		Version:                vi.Version().String(),
		Title:                  i.GetTitle(s),
	}
}
func toItemFields(fields item.Fields, s *schema.Schema) []*ItemField {
	return lo.Map(s.Fields(), func(sf *schema.Field, _ int) *ItemField {
		f := fields.Field(sf.ID())
		var v any = nil
		if f != nil {
			v = ToValue(f.Value(), sf.Multiple())
		}
		return &ItemField{
			ItemGroupID:   IDFromRef(f.ItemGroup()),
			SchemaFieldID: IDFrom(sf.ID()),
			Type:          ToValueType(sf.Type()),
			Value:         v,
		}
	})
}

func ToVersionedItem(v *version.Value[*item.Item], s *schema.Schema, gsList schema.List) *VersionedItem {
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
		Value:   ToItem(v, s, gsList),
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
		ItemGroup: ToIDRef[id.ItemGroup](field.ItemGroupID),
		Field:     &fid,
		Type:      FromValueType(field.Type),
		Value:     field.Value,
	}
}

func ToItemQuery(iq ItemQuery) *item.Query {
	pid, err := ToID[id.Project](iq.Project)
	if err != nil {
		return nil
	}

	return item.NewQuery(pid, ToIDRef[id.Schema](iq.Schema), lo.FromPtr(iq.Q), nil)
}

func (s *ItemSort) Into() *usecasex.Sort {
	if s == nil {
		return nil
	}
	key := ""
	switch s.SortBy {
	case ItemSortTypeCreationDate:
		key = "id"
	case ItemSortTypeModificationDate:
		key = "timestamp"
	}
	if key == "" {
		return nil
	}
	return &usecasex.Sort{
		Key:      key,
		Reverted: s.Direction != nil && *s.Direction == SortDirectionDesc,
	}
}

func ToItemStatus(in item.Status) ItemStatus {
	switch in {
	case item.StatusPublic:
		return ItemStatusPublic
	case item.StatusDraft:
		return ItemStatusDraft
	case item.StatusReview:
		return ItemStatusReview
	case item.StatusPublicDraft:
		return ItemStatusPublicDraft
	case item.StatusPublicReview:
		return ItemStatusPublicReview
	}
	return ""
}
