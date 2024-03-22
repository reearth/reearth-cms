package integrationapi

import (
	"github.com/oapi-codegen/runtime/types"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/samber/lo"
)

func NewVersionedItem(i item.Versioned, sp *schema.Package, cc *ConvertContext) VersionedItem {
	ps := lo.Map(i.Parents().Values(), func(v version.Version, _ int) types.UUID {
		return types.UUID(v)
	})
	rs := lo.Map(i.Refs().Values(), func(r version.Ref, _ int) string {
		return string(r)
	})
	mi := cc.ResolveMetaItem(lo.FromPtr(i.Value().MetadataItem()))

	var mf *[]Field
	if mi != nil && sp.MetaSchema() != nil {
		mf = NewFields(mi.Value(), schema.NewPackage(sp.MetaSchema(), nil, nil, nil), nil)
	}

	ii := NewItem(i.Value(), sp, cc)
	return VersionedItem{
		Id:              ii.Id,
		CreatedAt:       ii.CreatedAt,
		UpdatedAt:       ii.UpdatedAt,
		Fields:          ii.Fields,
		ModelId:         ii.ModelId,
		Parents:         &ps,
		MetadataFields:  mf,
		IsMetadata:      lo.ToPtr(i.Value().IsMetadata()),
		Refs:            &rs,
		Version:         lo.ToPtr(types.UUID(i.Version())),
		ReferencedItems: newReferencedItems(i, sp, cc),
	}
}

func newReferencedItems(i item.Versioned, sp *schema.Package, cc *ConvertContext) *[]VersionedItem {
	if i == nil {
		return nil
	}

	var vi []VersionedItem
	for _, sf := range sp.Schema().FieldsByType(value.TypeReference) {
		f := i.Value().Fields().Field(sf.ID())
		if f == nil {
			continue
		}
		ids := lo.FilterMap(f.Value().Values(), func(v *value.Value, _ int) (id.ItemID, bool) {
			iid, ok := v.Value().(id.ItemID)
			return iid, ok
		})
		if !sf.Multiple() {
			ids = ids[:1]
		}
		for _, id := range ids {
			ri := cc.ResolveReferencedItem(id)
			if ri == nil {
				continue
			}
			vi = append(vi, NewVersionedItem(ri, schema.NewPackage(sp.ReferencedSchema(f.FieldID()), nil, nil, nil), nil))
		}
	}

	return &vi
}

func NewItem(i *item.Item, sp *schema.Package, cc *ConvertContext) Item {
	return Item{
		Id:             i.ID().Ref(),
		ModelId:        i.Model().Ref().StringRef(),
		Fields:         NewFields(i, sp, cc),
		MetadataItemId: i.MetadataItem(),
		OriginalItemId: i.OriginalItem(),
		IsMetadata:     lo.ToPtr(i.IsMetadata()),
		CreatedAt:      lo.ToPtr(i.ID().Timestamp()),
		UpdatedAt:      lo.ToPtr(i.Timestamp()),
	}
}

func NewFields(i *item.Item, sp *schema.Package, cc *ConvertContext) *[]Field {
	f := lo.Map(i.NormalizedFields(sp), func(f *item.Field, _ int) Field {
		sf := sp.Field(f.FieldID())
		return Field{
			Id:    f.FieldID().Ref(),
			Type:  lo.ToPtr(NewValueType(f.Type())),
			Value: lo.ToPtr(NewValues(f.Value(), sf, cc)),
			Key:   lo.ToPtr(sf.Key().String()),
			Group: f.ItemGroup(),
		}
	})
	return &f
}
