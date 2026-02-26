package gqlmodel

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestToItem(t *testing.T) {
	iid := id.NewItemID()
	sid := id.NewSchemaID()
	mid := id.NewModelID()
	uid := accountdomain.NewUserID()
	nid := id.NewIntegrationID()
	tid := id.NewThreadID()
	pid := id.NewProjectID()
	sf1 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	sf := []*schema.Field{sf1}
	s := schema.New().ID(sid).Fields(sf).Workspace(accountdomain.NewWorkspaceID()).TitleField(sf1.ID().Ref()).Project(pid).MustBuild()
	i := item.New().
		ID(iid).
		Schema(sid).
		Project(pid).
		Fields([]*item.Field{item.NewField(sf1.ID(), value.TypeText.Value("test").AsMultiple(), nil)}).
		Model(mid).
		Thread(tid.Ref()).
		User(uid).
		Integration(nid).
		MustBuild()
	v := version.New()

	vi := version.MustBeValue(v, nil, version.NewRefs(version.Latest), util.Now(), i)
	tests := []struct {
		name  string
		input item.Versioned
		want  *Item
	}{
		{
			name:  "should return a gql model item",
			input: vi,
			want: &Item{
				ID:            IDFrom(iid),
				ProjectID:     IDFrom(pid),
				ModelID:       IDFrom(mid),
				SchemaID:      IDFrom(sid),
				ThreadID:      IDFromRef(tid.Ref()),
				UserID:        IDFromRef(uid.Ref()),
				IntegrationID: IDFromRef(nid.Ref()),
				CreatedAt:     i.ID().Timestamp(),
				UpdatedAt:     i.Timestamp(),
				Fields: []*ItemField{
					{
						SchemaFieldID: IDFrom(sf1.ID()),
						Type:          SchemaFieldTypeText,
						Value:         "test",
					},
				},
				Version: v.String(),
				Title:   lo.ToPtr("test"),
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
			got := ToItem(tc.input, s, nil)
			assert.Equal(tt, tc.want, got)
		})
	}
}

func TestToItem_GroupFields(t *testing.T) {
	pid := id.NewProjectID()
	iid := id.NewItemID()
	sid := id.NewSchemaID()
	mid := id.NewModelID()
	uid := accountdomain.NewUserID()
	tid := id.NewThreadID()

	// group schema with two fields: "data" (asset) and "key" (text)
	gsid := id.NewSchemaID()
	sfData := schema.NewField(schema.NewAsset().TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	sfKey := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	gs := schema.New().ID(gsid).Fields([]*schema.Field{sfData, sfKey}).Workspace(accountdomain.NewWorkspaceID()).Project(pid).MustBuild()

	// main schema with a group field
	gid := id.NewGroupID()
	sfGroup := schema.NewField(schema.NewGroup(gid).TypeProperty()).NewID().Key(id.RandomKey()).Multiple(true).MustBuild()
	s := schema.New().ID(sid).Fields([]*schema.Field{sfGroup}).Workspace(accountdomain.NewWorkspaceID()).Project(pid).MustBuild()

	// create 3 groups
	gid1, gid2, gid3 := id.NewItemGroupID(), id.NewItemGroupID(), id.NewItemGroupID()

	aid1, aid2, aid3 := id.NewAssetID(), id.NewAssetID(), id.NewAssetID()

	// item fields: group field + 3 data fields + 3 key fields
	fields := []*item.Field{
		item.NewField(sfGroup.ID(), value.NewMultiple(value.TypeGroup, []any{gid1, gid2, gid3}), nil),
		item.NewField(sfData.ID(), value.TypeAsset.Value(aid1).AsMultiple(), &gid1),
		item.NewField(sfData.ID(), value.TypeAsset.Value(aid2).AsMultiple(), &gid2),
		item.NewField(sfData.ID(), value.TypeAsset.Value(aid3).AsMultiple(), &gid3),
		item.NewField(sfKey.ID(), value.TypeText.Value("key1").AsMultiple(), &gid1),
		item.NewField(sfKey.ID(), value.TypeText.Value("key2").AsMultiple(), &gid2),
		item.NewField(sfKey.ID(), value.TypeText.Value("key3").AsMultiple(), &gid3),
	}

	i := item.New().
		ID(iid).Schema(sid).Project(pid).Model(mid).
		Fields(fields).Thread(tid.Ref()).User(uid).
		MustBuild()

	v := version.New()
	vi := version.MustBeValue(v, nil, version.NewRefs(version.Latest), util.Now(), i)

	got := ToItem(vi, s, schema.List{gs})

	// count fields by schema field ID
	dataFields := lo.Filter(got.Fields, func(f *ItemField, _ int) bool {
		return f.SchemaFieldID == IDFrom(sfData.ID())
	})
	keyFields := lo.Filter(got.Fields, func(f *ItemField, _ int) bool {
		return f.SchemaFieldID == IDFrom(sfKey.ID())
	})
	groupFields := lo.Filter(got.Fields, func(f *ItemField, _ int) bool {
		return f.SchemaFieldID == IDFrom(sfGroup.ID())
	})

	// all 3 data fields should be returned
	assert.Len(t, dataFields, 3, "should return all 3 data (asset) fields")
	// all 3 key fields should be returned
	assert.Len(t, keyFields, 3, "should return all 3 key (text) fields")
	// 1 group field from main schema
	assert.Len(t, groupFields, 1, "should return 1 group field")

	// verify data fields have correct group IDs
	dataGroupIDs := lo.Map(dataFields, func(f *ItemField, _ int) ID {
		return lo.FromPtr(f.ItemGroupID)
	})
	assert.ElementsMatch(t, []ID{IDFrom(gid1), IDFrom(gid2), IDFrom(gid3)}, dataGroupIDs)

	// verify key fields have correct group IDs
	keyGroupIDs := lo.Map(keyFields, func(f *ItemField, _ int) ID {
		return lo.FromPtr(f.ItemGroupID)
	})
	assert.ElementsMatch(t, []ID{IDFrom(gid1), IDFrom(gid2), IDFrom(gid3)}, keyGroupIDs)

	// group field should have no item group ID
	assert.Nil(t, groupFields[0].ItemGroupID)
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
				// Type:  value.TypeText,
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
	sf1 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	sf := []*schema.Field{sf1}
	s := schema.New().ID(sid).Fields(sf).Workspace(accountdomain.NewWorkspaceID()).Project(pId).MustBuild()
	fs := []*item.Field{item.NewField(sf1.ID(), value.TypeBool.Value(true).AsMultiple(), nil)}
	i := item.New().ID(iid).Schema(sid).Model(id.NewModelID()).Project(pId).Fields(fs).Thread(id.NewThreadID().Ref()).MustBuild()
	vx, vy := version.New(), version.New()
	vv := *version.NewValue(vx, version.NewVersions(vy), version.NewRefs("a"), time.Time{}, i)
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
				Value:   ToItem(&vv, s, nil),
			},
		},
		{
			name: "nil input",
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := ToVersionedItem(tc.args, s, nil)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestToItemQuery(t *testing.T) {
	pid := id.NewProjectID()
	mid := id.NewModelID()
	sid := id.NewSchemaID()
	str := "foo"
	tests := []struct {
		name  string
		input SearchItemInput
		want  *item.Query
	}{
		{
			name: "should pass",
			input: SearchItemInput{
				Query: &ItemQueryInput{
					Project: IDFrom(pid),
					Model:   IDFrom(mid),
					Schema:  IDFromRef(sid.Ref()),
					Q:       &str,
				},
			},
			want: item.NewQuery(pid, mid, sid.Ref(), str, nil),
		},
		{
			name: "invalid project id",
			input: SearchItemInput{
				Query: &ItemQueryInput{
					Q:     &str,
					Model: IDFrom(mid),
				},
			},
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			tc := tc
			t.Parallel()
			got := ToItemQuery(tc.input)
			assert.Equal(t, tc.want, got)
		})
	}
}
