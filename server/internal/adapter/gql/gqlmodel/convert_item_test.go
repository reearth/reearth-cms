package gqlmodel

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestToItem(t *testing.T) {
	iid := id.NewItemID()
	sid := id.NewSchemaID()
	mid := id.NewModelID()
	uid := id.NewUserID()
	nid := id.NewIntegrationID()
	tid := id.NewThreadID()
	pid := id.NewProjectID()
	sf1 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Key(key.Random()).MustBuild()
	sf := []*schema.Field{sf1}
	s := schema.New().ID(sid).Fields(sf).Workspace(id.NewWorkspaceID()).Project(pid).MustBuild()
	i := item.New().
		ID(iid).
		Schema(sid).
		Project(pid).
		Fields([]*item.Field{item.NewField(sf1.ID(), value.TypeBool.Value(true).AsMultiple())}).
		Model(mid).
		Thread(tid).
		User(uid).
		Integration(nid).
		MustBuild()

	tests := []struct {
		name  string
		input *item.Item
		want  *Item
	}{
		{
			name:  "should return a gql model item",
			input: i,
			want: &Item{
				ID:            IDFrom(iid),
				ProjectID:     IDFrom(pid),
				ModelID:       IDFrom(mid),
				SchemaID:      IDFrom(sid),
				ThreadID:      IDFrom(tid),
				UserID:        IDFromRef(uid.Ref()),
				IntegrationID: IDFromRef(nid.Ref()),
				CreatedAt:     i.Timestamp(),
				Fields: []*ItemField{
					{
						SchemaFieldID: IDFrom(sf1.ID()),
						Type:          SchemaFieldTypeBool,
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
			got := ToItem(tc.input, s)
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
				Type:          SchemaFieldTypeText,
				Value:         "foo",
			},
			want: &interfaces.ItemFieldParam{
				Field: &sfid,
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
	pId := id.NewProjectID()
	iid := id.NewItemID()
	sid := id.NewSchemaID()
	ref := "a"
	sf1 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Key(key.Random()).MustBuild()
	sf := []*schema.Field{sf1}
	s := schema.New().ID(sid).Fields(sf).Workspace(id.NewWorkspaceID()).Project(pId).MustBuild()
	fs := []*item.Field{item.NewField(sf1.ID(), value.TypeBool.Value(true).AsMultiple())}
	i := item.New().ID(iid).Schema(sid).Model(id.NewModelID()).Project(pId).Fields(fs).Thread(id.NewThreadID()).MustBuild()
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
				Value:   ToItem(vv.Value(), s),
			},
		},
		{
			name: "nil input",
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := ToVersionedItem(tc.args, s)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestToItemQuery(t *testing.T) {
	pid := id.NewProjectID()
	sid := id.NewSchemaID()
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
				Schema:  IDFromRef(sid.Ref()),
				Q:       &str,
			},
			want: item.NewQuery(pid, sid.Ref(), str, nil),
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

func TestToItemSort(t *testing.T) {
	input1 := &ItemSort{
		SortBy:    ItemSortTypeDate,
		Direction: lo.ToPtr(SortDirectionDesc),
	}
	want1 := &item.Sort{
		Direction: item.DescDirection,
		SortBy:    item.SortTypeDate,
	}
	got1 := ToItemSort(input1)
	assert.Equal(t, want1, got1)
	got2 := ToItemSort(nil)
	var want2 *item.Sort
	assert.Equal(t, want2, got2)
}
