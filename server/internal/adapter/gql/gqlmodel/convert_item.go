package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/samber/lo"
)

func ToItem(vi item.Versioned, sp *schema.Package) *Item {
	if vi == nil || vi.Value() == nil {
		return nil
	}
	i := vi.Value()
	return &Item{
		ID:                     IDFrom(i.ID()),
		ProjectID:              IDFrom(i.Project()),
		SchemaID:               IDFrom(i.Schema()),
		ModelID:                IDFrom(i.Model()),
		UserID:                 IDFromRef(i.User()),
		IntegrationID:          IDFromRef(i.Integration()),
		ThreadID:               IDFrom(i.Thread()),
		MetadataID:             IDFromRef(i.MetadataItem()),
		IsMetadata:             i.IsMetadata(),
		OriginalID:             IDFromRef(i.MetadataItem()),
		UpdatedByIntegrationID: IDFromRef(i.UpdatedByIntegration()),
		UpdatedByUserID:        IDFromRef(i.UpdatedByUser()),
		CreatedAt:              i.ID().Timestamp(),
		UpdatedAt:              i.Timestamp(),
		Fields:                 toItemFields(i, sp),
		Version:                vi.Version().String(),
		Title:                  i.GetTitle(sp.Schema()),
	}
}
func toItemFields(item *item.Item, sp *schema.Package) []*ItemField {
	var res []*ItemField
	for _, f := range item.NormalizedFields(sp) {
		v := ToValue(f.Value(), sp.Field(f.FieldID()).Multiple())
		res = append(res, &ItemField{
			ItemGroupID:   IDFromRef(f.ItemGroup()),
			SchemaFieldID: IDFrom(f.FieldID()),
			Type:          ToValueType(f.Type()),
			Value:         v,
		})
	}
	return res
}

func ToVersionedItem(v *version.Value[*item.Item], sp *schema.Package) *VersionedItem {
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
		Value:   ToItem(v, sp),
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
		Group: ToIDRef[id.ItemGroup](field.ItemGroupID),
		Field: &fid,
		Type:  FromValueType(field.Type),
		Value: field.Value,
	}
}

func ToItemQuery(inp SearchItemInput) *item.Query {
	q := inp.Query
	pid, err := ToID[id.Project](q.Project)
	if err != nil {
		return nil
	}

	mid, err := ToID[id.Model](q.Model)
	if err != nil {
		return nil
	}

	return item.NewQuery(pid, mid, ToIDRef[id.Schema](q.Schema), lo.FromPtr(q.Q), nil).
		WithSort(inp.Sort.Into()).
		WithFilter(inp.Filter.Into())
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
