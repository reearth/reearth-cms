package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/stretchr/testify/assert"
)

func TestToItem(t *testing.T) {
	iid := id.NewItemID()
	sid := id.NewSchemaID()
	mid := id.NewModelID()
	tid := id.NewThreadID()
	pid := id.NewProjectID()
	sfid := id.NewFieldID()
	i := item.New().ID(iid).Schema(sid).Project(pid).Fields(
		[]*item.Field{item.NewField(sfid, value.TypeBool.Value(true).Some())},
	).Model(mid).Thread(tid).MustBuild()

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
				ModelID:   IDFrom(mid),
				SchemaID:  IDFrom(sid),
				ThreadID:  IDFrom(tid),
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
				Field: sfid,
				Type:  value.TypeText,
				Value: "foo",
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
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got := ToItemParam(tc.input)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestToVersionedItem(t *testing.T) {
	iid := id.NewItemID()
	sid := id.NewSchemaID()
	sfid := id.NewFieldID()
	ref := "a"
	fs := []*item.Field{item.NewField(sfid, value.TypeBool.Value(true).Some())}
	i := item.New().ID(iid).Schema(sid).Model(id.NewModelID()).Project(id.NewProjectID()).Fields(fs).Thread(id.NewThreadID()).MustBuild()
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
		t.Run(tc.name, func(t *testing.T) {
			got := ToVersionedItem(tc.args)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestToItemQuery(t *testing.T) {
	pid := id.NewProjectID()
	str := "foo"
	tests := []struct {
		name  string
		input ItemQuery
		want  *item.Query
	}{
		{
			name: "should pass",
			input: ItemQuery{
				Project: IDFrom(pid),
				Q:       &str,
			},
			want: item.NewQuery(pid, str, nil),
		},
		{
			name: "invalid project id",
			input: ItemQuery{
				Q: &str,
			},
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got := ToItemQuery(tc.input)
			assert.Equal(t, tc.want, got)
		})
	}
}
