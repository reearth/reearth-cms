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
	pid := id.NewProjectID()
	sfid := id.NewFieldID()
	fs := []*item.Field{item.NewField(sfid, schema.TypeBool, true)}
	i, _ := item.New().ID(iid).Schema(sid).Project(pid).Fields(fs).Build()
	tests := []struct {
		name  string
		input *item.Item
		want  *Item
	}{
		{
			name:  "should return a gql model item",
			input: i,
			want: &Item{
				ID:        IDFrom(iid),
				ProjectID: IDFrom(pid),
				SchemaID:  IDFrom(sid),
				CreatedAt: i.Timestamp(),
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
		want  *interfaces.ItemFieldParam
	}{
		{
			name: "should return ItemFieldParam",
			input: &ItemFieldInput{
				SchemaFieldID: IDFrom(sfid),
				Type:          SchemaFiledTypeText,
				Value:         "foo",
			},
			want: &interfaces.ItemFieldParam{
				SchemaFieldID: sfid,
				ValueType:     schema.TypeText,
				Value:         "foo",
			},
		},
		{
			name: "nil input",
		},
		{
			name: "invalid schema field ID",
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

func TestToVersionedItem(t *testing.T) {
	iid := id.NewItemID()
	sid := id.NewSchemaID()
	sfid := id.NewFieldID()
	ref := "a"
	fs := []*item.Field{item.NewField(sfid, schema.TypeBool, true)}
	i, _ := item.New().ID(iid).Schema(sid).Project(id.NewProjectID()).Fields(fs).Build()
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
				Version: vv.Version().String(),
				Parents: []string{vy.String()},
				Refs:    []string{ref},
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
