package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/samber/lo"
)

func ToItem(i *item.Item) *Item {
	if i == nil {
		return nil
	}

	var fs []*ItemField
	for _, f := range i.Fields() {
		fs = append(fs, &ItemField{
			SchemaFieldID: IDFrom(f.SchemaFieldID()),
			Type:          ToSchemaFieldType(f.ValueType()),
			Value:         f.Value(),
		})
	}

	return &Item{
		ID:       IDFrom(i.ID()),
		SchemaID: IDFrom(i.Schema()),
		Fields:   fs,
	}
}

func ToVersionedItem(v *version.Value[*item.Item]) *VersionedItem {
	if v == nil {
		return nil
	}

	parents := v.Parents()
	refs := v.Refs()
	return &VersionedItem{
		Version: ID(v.Version().String()),
		Parents: ToVersions(&parents),
		Refs:    ToRefs(&refs),
		Value:   ToItem(v.Value()),
	}
}

func ToVersions(versions *version.Versions) []ID {
	if versions == nil {
		return nil
	}

	return lo.Map(versions.Values(), func(v version.Version, _ int) ID {
		return ID(v.String())
	})
}

func ToRefs(refs *version.Refs) []*string {
	if refs == nil {
		return nil
	}

	return lo.Map(refs.Values(), func(v version.Ref, _ int) *string {
		ref := v.String()
		return &ref
	})
}

func ToItemParam(field *ItemFieldInput) (res interfaces.ItemFieldParam) {
	if field == nil {
		return
	}
	fid, err := ToID[id.Field](field.SchemaFieldID)
	if err != nil {
		return
	}

	res = interfaces.ItemFieldParam{
		SchemaFieldID: fid,
		ValueType:     FromSchemaFieldType(field.Type),
		Value:         field.Value,
	}
	return
}
