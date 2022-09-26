package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/stretchr/testify/assert"
)

func TestToItem(t *testing.T) {
	iid := id.NewItemID()
	sid := id.NewSchemaID()
	sfid := id.NewFieldID()
	fs := []*item.Field{item.NewField(sfid, schema.TypeBool, true)}
	i, _ := item.New().ID(iid).Schema(sid).Fields(fs).Build()
	tests := []struct {
		name  string
		input *item.Item
		want  *Item
	}{
		{
			name:  "should return a gql model item",
			input: i,
			want: &Item{
				ID:       IDFrom(iid),
				SchemaID: IDFrom(sid),
				Fields: []*ItemField{
					{
						SchemaFieldID: IDFrom(sfid),
						Type:          SchemaFiledTypeBool,
						Value:         true,
					},
				},
			},
		},
		{
			name: "should return nil",
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			got := ToItem(tc.input)
			assert.Equal(tt, tc.want, got)
		})
	}
}

func TestToItemParam(t *testing.T) {
	sfid := id.NewFieldID()
	tests := []struct {
		name  string
		input *ItemFieldInput
		want  interfaces.ItemFieldParam
	}{
		{
			name: "should return ItemFieldParam",
			input: &ItemFieldInput{
				SchemaFieldID: IDFrom(sfid),
				Type:          SchemaFiledTypeText,
				Value:         "foo",
			},
			want: interfaces.ItemFieldParam{
				SchemaFieldID: sfid,
				ValueType:     schema.TypeText,
				Value:         "foo",
			},
		},
		{
			name: "nil input",
		},
		{
			name:  "invalid schema field ID",
			input: &ItemFieldInput{},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			got := ToItemParam(tc.input)
			assert.Equal(tt, tc.want, got)
		})
	}
}

func TestToRefs(t *testing.T) {
	ref := "xxx"
	refs := version.NewRefs("xxx")
	tests := []struct {
		name string
		args *version.Refs
		want []*string
	}{
		{
			name: "success",
			args: &refs,
			want: []*string{&ref},
		},
		{
			name: "should return nil",
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			got := ToRefs(tc.args)
			assert.Equal(tt, tc.want, got)
		})
	}
}

func TestToVersionedItem(t *testing.T) {
	iid := id.NewItemID()
	sid := id.NewSchemaID()
	sfid := id.NewFieldID()
	ref := "a"
	fs := []*item.Field{item.NewField(sfid, schema.TypeBool, true)}
	i, _ := item.New().ID(iid).Schema(sid).Fields(fs).Build()
	vx, vy := version.New(), version.New()
	vv := *version.NewValue(vx, version.NewVersions(vy), version.NewRefs("a"), i)
	tests := []struct {
		name string
		args *version.Value[*item.Item]
		want *VersionedItem
	}{
		{
			name: "success",
			args: &vv,
			want: &VersionedItem{
				Version: ID(vv.Version().String()),
				Parents: []ID{ID(vy.String())},
				Refs:    []*string{&ref},
				Value:   ToItem(vv.Value()),
			},
		},
		{
			name: "nil input",
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(tt *testing.T) {
			got := ToVersionedItem(tc.args)
			assert.Equal(tt, tc.want, got)
		})
	}
}

func TestToVersions(t *testing.T) {
	vx, vy := version.New(), version.New()
	vs := version.NewVersions(vy, vx)
	tests := []struct {
		name string
		args *version.Versions
		want []ID
	}{
		{
			name: "success",
			args: &vs,
			want: []ID{ID(vy.String()), ID(vx.String())},
		},
		{
			name: "should return nil",
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			got := ToVersions(tc.args)
			assert.Equal(tt, tc.want, got)
		})
	}
}
