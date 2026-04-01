package item

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestList_Filtered(t *testing.T) {
	sfid1 := id.NewFieldID()
	sfid2 := id.NewFieldID()
	sfid3 := id.NewFieldID()
	sfid4 := id.NewFieldID()
	f1 := &Field{field: sfid1}
	f2 := &Field{field: sfid2}
	f3 := &Field{field: sfid3}
	f4 := &Field{field: sfid4}
	i1 := &Item{
		fields: []*Field{f1, f3},
	}
	i2 := &Item{
		fields: []*Field{f2, f4},
	}
	il := List{i1, i2}
	sfl := id.FieldIDList{sfid1, sfid4}
	want := List{&Item{fields: []*Field{f1}}, &Item{fields: []*Field{f4}}}

	got := il.FilterFields(sfl)
	assert.Equal(t, want, got)
}

func TestList_Item(t *testing.T) {
	sfid1 := id.NewFieldID()
	sfid2 := id.NewFieldID()
	sfid3 := id.NewFieldID()
	sfid4 := id.NewFieldID()
	f1 := &Field{field: sfid1}
	f2 := &Field{field: sfid2}
	f3 := &Field{field: sfid3}
	f4 := &Field{field: sfid4}

	i1Id := id.NewItemID()
	i1 := &Item{
		id:     i1Id,
		fields: []*Field{f1, f3},
	}

	i2Id := id.NewItemID()
	i2 := &Item{
		id:     i2Id,
		fields: []*Field{f2, f4},
	}
	il := List{i1, i2}

	got, ok := il.Item(i1Id)
	assert.True(t, ok)
	assert.Equal(t, i1, got)

	got, ok = il.Item(id.NewItemID())
	assert.False(t, ok)
	assert.Nil(t, got)
}

func TestList_ItemsByField(t *testing.T) {
	sid := id.NewSchemaID()
	pid := id.NewProjectID()
	mid := id.NewModelID()
	f1 := NewField(id.NewFieldID(), value.TypeText.Value("foo").AsMultiple(), nil)
	f2 := NewField(id.NewFieldID(), value.TypeText.Value("hoge").AsMultiple(), nil)
	f3 := NewField(id.NewFieldID(), value.TypeBool.Value(true).AsMultiple(), nil)
	i1 := New().NewID().Schema(sid).Model(mid).Fields([]*Field{f1, f2}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i2 := New().NewID().Schema(sid).Model(mid).Fields([]*Field{f2, f3}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	i3 := New().NewID().Schema(sid).Model(mid).Fields([]*Field{f1}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
	type args struct {
		fid   id.FieldID
		value any
	}
	tests := []struct {
		name      string
		l         List
		args      args
		wantCount int
	}{
		{
			name: "must find 2",
			l:    List{i1, i2, i3},
			args: args{
				fid:   f1.FieldID(),
				value: f1.Value(),
			},
			wantCount: 2,
		},
		{
			name: "must find 1",
			l:    List{i1, i2, i3},
			args: args{
				fid:   f3.FieldID(),
				value: f3.Value(),
			},
			wantCount: 1,
		},
		{
			name: "must find 0",
			l:    List{i1, i2, i3},
			args: args{
				fid:   id.NewFieldID(),
				value: "xxx",
			},
			wantCount: 0,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.wantCount, len(tt.l.ItemsByField(tt.args.fid, tt.args.value)))
		})
	}
}

func TestVersionedList_FilterFields(t *testing.T) {
	now := time.Now()
	fId := id.NewFieldID()
	i := New().NewID().
		Schema(id.NewSchemaID()).
		Model(id.NewModelID()).
		Project(id.NewProjectID()).
		Thread(id.NewThreadID().Ref()).
		Fields([]*Field{NewField(fId, value.TypeBool.Value(true).AsMultiple(), nil)}).
		MustBuild()
	vl := VersionedList{
		version.MustBeValue(version.New(), nil, version.NewRefs(version.Latest), now, i),
	}

	assert.Equal(t, vl.FilterFields(id.FieldIDList{fId}), vl.FilterFields(id.FieldIDList{fId}))
}

func TestVersionedList_Item(t *testing.T) {
	now := time.Now()
	fId := id.NewFieldID()
	iId := id.NewItemID()
	i := New().ID(iId).
		Schema(id.NewSchemaID()).
		Model(id.NewModelID()).
		Project(id.NewProjectID()).
		Thread(id.NewThreadID().Ref()).
		Fields([]*Field{NewField(fId, value.TypeBool.Value(true).AsMultiple(), nil)}).
		MustBuild()
	v := version.New()
	vl := VersionedList{
		version.MustBeValue(v, nil, version.NewRefs(version.Latest), now, i),
	}

	assert.Equal(t, version.MustBeValue(v, nil, version.NewRefs(version.Latest), now, i), vl.Item(iId))
}

func TestVersionedList_Unwrap(t *testing.T) {
	now := time.Now()
	fId := id.NewFieldID()
	iId := id.NewItemID()
	i := New().ID(iId).
		Schema(id.NewSchemaID()).
		Model(id.NewModelID()).
		Project(id.NewProjectID()).
		Thread(id.NewThreadID().Ref()).
		Fields([]*Field{NewField(fId, value.TypeBool.Value(true).AsMultiple(), nil)}).
		MustBuild()
	v := version.New()
	vl := VersionedList{
		version.MustBeValue(v, nil, version.NewRefs(version.Latest), now, i),
	}

	assert.Equal(t, List{i}, vl.Unwrap())
}

func TestToMap(t *testing.T) {
	now := time.Now()
	fId1 := id.NewFieldID()
	iId1 := id.NewItemID()
	i1 := New().ID(iId1).
		Schema(id.NewSchemaID()).
		Model(id.NewModelID()).
		Project(id.NewProjectID()).
		Thread(id.NewThreadID().Ref()).
		Fields([]*Field{NewField(fId1, value.TypeBool.Value(true).AsMultiple(), nil)}).
		MustBuild()
	vi1 := version.MustBeValue(version.New(), nil, version.NewRefs(version.Latest), now, i1)
	fId2 := id.NewFieldID()
	iId2 := id.NewItemID()
	i2 := New().ID(iId2).
		Schema(id.NewSchemaID()).
		Model(id.NewModelID()).
		Project(id.NewProjectID()).
		Thread(id.NewThreadID().Ref()).
		Fields([]*Field{NewField(fId2, value.TypeBool.Value(true).AsMultiple(), nil)}).
		MustBuild()
	vi2 := version.MustBeValue(version.New(), nil, version.NewRefs(version.Latest), now, i2)
	vl := VersionedList{vi1, vi2}
	m := vl.ToMap()

	assert.Equal(t, 2, len(m))
	assert.Equal(t, vi1, m[iId1])
	assert.Equal(t, vi2, m[iId2])
	assert.Nil(t, m[id.NewItemID()])
}

func TestList_Clone(t *testing.T) {
	fid1 := id.NewFieldID()
	fid2 := id.NewFieldID()
	f1 := &Field{field: fid1}
	f2 := &Field{field: fid2}
	i1 := &Item{
		id:     id.NewItemID(),
		fields: []*Field{f1},
	}
	i2 := &Item{
		id:     id.NewItemID(),
		fields: []*Field{f2},
	}
	tests := []struct {
		name string
		l    List
	}{
		{
			name: "empty list",
			l:    List{},
		},
		{
			name: "single item",
			l:    List{i1},
		},
		{
			name: "multiple items",
			l:    List{i1, i2},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			cloned := tt.l.Clone()
			assert.Equal(t, tt.l, cloned)

			// Ensure it's a deep copy (not the same pointers)
			for i := range tt.l {
				assert.NotSame(t, tt.l[i], cloned[i])
			}

		})
	}
}

func TestList_AssetIDs(t *testing.T) {
	t.Parallel()

	aid1, aid2, aid3, aid4 := id.NewAssetID(), id.NewAssetID(), id.NewAssetID(), id.NewAssetID()
	assetFieldID := id.NewFieldID()
	textFieldID := id.NewFieldID()
	groupAssetFieldID := id.NewFieldID()

	// Create schema with asset and text fields
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	assetField := schema.NewField(schema.NewAsset().TypeProperty()).ID(assetFieldID).Key(id.RandomKey()).MustBuild()
	textField := schema.NewField(schema.NewText(nil).TypeProperty()).ID(textFieldID).Key(id.RandomKey()).MustBuild()
	s := schema.New().NewID().Workspace(wid).Project(pid).Fields([]*schema.Field{assetField, textField}).MustBuild()

	// Create group schema with asset field
	groupAssetField := schema.NewField(schema.NewAsset().TypeProperty()).ID(groupAssetFieldID).Key(id.RandomKey()).MustBuild()
	gs := schema.New().NewID().Workspace(wid).Project(pid).Fields([]*schema.Field{groupAssetField}).MustBuild()
	gid := id.NewGroupID()
	groupSchemas := map[id.GroupID]*schema.Schema{gid: gs}

	tests := []struct {
		name     string
		list     List
		pkg      schema.Package
		expected AssetIDList
	}{
		{
			name:     "nil list",
			list:     nil,
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: nil,
		},
		{
			name:     "empty list",
			list:     List{},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: AssetIDList{},
		},
		{
			name: "single item with asset",
			list: List{
				&Item{
					fields: []*Field{
						{field: assetFieldID, value: value.New(value.TypeAsset, aid1).AsMultiple()},
					},
				},
			},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: AssetIDList{aid1},
		},
		{
			name: "multiple items with unique assets",
			list: List{
				&Item{
					fields: []*Field{
						{field: assetFieldID, value: value.New(value.TypeAsset, aid1).AsMultiple()},
					},
				},
				&Item{
					fields: []*Field{
						{field: assetFieldID, value: value.New(value.TypeAsset, aid2).AsMultiple()},
					},
				},
			},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: AssetIDList{aid1, aid2},
		},
		{
			name: "multiple items with duplicate assets (AddUniq)",
			list: List{
				&Item{
					fields: []*Field{
						{field: assetFieldID, value: value.New(value.TypeAsset, aid1).AsMultiple()},
					},
				},
				&Item{
					fields: []*Field{
						{field: assetFieldID, value: value.New(value.TypeAsset, aid1).AsMultiple()},
					},
				},
				&Item{
					fields: []*Field{
						{field: assetFieldID, value: value.New(value.TypeAsset, aid2).AsMultiple()},
					},
				},
			},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: AssetIDList{aid1, aid2},
		},
		{
			name: "items without asset fields",
			list: List{
				&Item{
					fields: []*Field{
						{field: textFieldID, value: value.New(value.TypeText, "test").AsMultiple()},
					},
				},
			},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: AssetIDList{},
		},
		{
			name: "mixed items",
			list: List{
				&Item{
					fields: []*Field{
						{field: assetFieldID, value: value.New(value.TypeAsset, aid1).AsMultiple()},
						{field: textFieldID, value: value.New(value.TypeText, "test1").AsMultiple()},
					},
				},
				&Item{
					fields: []*Field{
						{field: textFieldID, value: value.New(value.TypeText, "test2").AsMultiple()},
					},
				},
				&Item{
					fields: []*Field{
						{field: assetFieldID, value: value.New(value.TypeAsset, aid2).AsMultiple()},
						{field: assetFieldID, value: value.New(value.TypeAsset, aid3).AsMultiple()},
					},
				},
			},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: AssetIDList{aid1, aid2, aid3},
		},
		{
			name: "asset from group schema only",
			list: List{
				&Item{
					fields: []*Field{
						{field: groupAssetFieldID, value: value.New(value.TypeAsset, aid1).AsMultiple()},
					},
				},
			},
			pkg:      *schema.NewPackage(s, nil, groupSchemas, nil),
			expected: AssetIDList{aid1},
		},
		{
			name: "assets from both schema and group schema",
			list: List{
				&Item{
					fields: []*Field{
						{field: assetFieldID, value: value.New(value.TypeAsset, aid1).AsMultiple()},
						{field: groupAssetFieldID, value: value.New(value.TypeAsset, aid2).AsMultiple()},
					},
				},
			},
			pkg:      *schema.NewPackage(s, nil, groupSchemas, nil),
			expected: AssetIDList{aid1, aid2},
		},
		{
			name: "multiple items with assets from schema and group schema",
			list: List{
				&Item{
					fields: []*Field{
						{field: assetFieldID, value: value.New(value.TypeAsset, aid1).AsMultiple()},
					},
				},
				&Item{
					fields: []*Field{
						{field: groupAssetFieldID, value: value.New(value.TypeAsset, aid2).AsMultiple()},
					},
				},
				&Item{
					fields: []*Field{
						{field: assetFieldID, value: value.New(value.TypeAsset, aid3).AsMultiple()},
						{field: groupAssetFieldID, value: value.New(value.TypeAsset, aid4).AsMultiple()},
					},
				},
			},
			pkg:      *schema.NewPackage(s, nil, groupSchemas, nil),
			expected: AssetIDList{aid1, aid2, aid3, aid4},
		},
		{
			name: "duplicate assets across schema and group schema (AddUniq)",
			list: List{
				&Item{
					fields: []*Field{
						{field: assetFieldID, value: value.New(value.TypeAsset, aid1).AsMultiple()},
					},
				},
				&Item{
					fields: []*Field{
						{field: groupAssetFieldID, value: value.New(value.TypeAsset, aid1).AsMultiple()},
					},
				},
			},
			pkg:      *schema.NewPackage(s, nil, groupSchemas, nil),
			expected: AssetIDList{aid1},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := tt.list.AssetIDs(tt.pkg)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestList_RefItemsIDs(t *testing.T) {
	t.Parallel()

	refID1, refID2, refID3 := id.NewItemID(), id.NewItemID(), id.NewItemID()
	refFieldID := id.NewFieldID()
	multiRefFieldID := id.NewFieldID()
	textFieldID := id.NewFieldID()

	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	refField := schema.NewField(schema.NewReference(id.NewModelID(), id.NewSchemaID(), nil, nil).TypeProperty()).ID(refFieldID).Key(id.RandomKey()).MustBuild()
	multiRefField := schema.NewField(schema.NewReference(id.NewModelID(), id.NewSchemaID(), nil, nil).TypeProperty()).ID(multiRefFieldID).Key(id.RandomKey()).Multiple(true).MustBuild()
	textField := schema.NewField(schema.NewText(nil).TypeProperty()).ID(textFieldID).Key(id.RandomKey()).MustBuild()
	s := schema.New().NewID().Workspace(wid).Project(pid).Fields([]*schema.Field{refField, multiRefField, textField}).MustBuild()

	tests := []struct {
		name     string
		list     List
		pkg      schema.Package
		expected IDList
	}{
		{
			name:     "nil list",
			list:     nil,
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: nil,
		},
		{
			name:     "empty list",
			list:     List{},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: IDList{},
		},
		{
			name: "single item",
			list: List{
				&Item{
					fields: []*Field{
						{field: refFieldID, value: value.TypeReference.Value(refID1).AsMultiple()},
					},
				},
			},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: IDList{refID1},
		},
		{
			name: "multiple items",
			list: List{
				&Item{
					fields: []*Field{
						{field: refFieldID, value: value.TypeReference.Value(refID1).AsMultiple()},
						{field: multiRefFieldID, value: value.NewMultiple(value.TypeReference, []any{refID2})},
					},
				},
				&Item{
					fields: []*Field{
						{field: refFieldID, value: value.TypeReference.Value(refID1).AsMultiple()},
						{field: multiRefFieldID, value: value.NewMultiple(value.TypeReference, []any{refID3})},
					},
				},
			},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: IDList{refID1, refID2, refID3},
		},
		{
			name: "multiple items with dedupe",
			list: List{
				&Item{
					fields: []*Field{
						{field: refFieldID, value: value.TypeReference.Value(refID1).AsMultiple()},
						{field: multiRefFieldID, value: value.NewMultiple(value.TypeReference, []any{refID2, refID3})},
					},
				},
				&Item{
					fields: []*Field{
						{field: refFieldID, value: value.TypeReference.Value(refID1).AsMultiple()},
						{field: multiRefFieldID, value: value.NewMultiple(value.TypeReference, []any{refID3})},
					},
				},
			},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: IDList{refID1, refID2, refID3},
		},
		{
			name: "non-multiple field keeps first value only",
			list: List{
				&Item{
					fields: []*Field{
						{field: refFieldID, value: value.NewMultiple(value.TypeReference, []any{refID1, refID2})},
					},
				},
			},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: IDList{refID1},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.expected, tt.list.RefItemsIDs(tt.pkg))
		})
	}
}

func TestList_RefItemIDsByModels(t *testing.T) {
	t.Parallel()

	refID1 := id.NewItemID()
	refID2 := id.NewItemID()
	refID3 := id.NewItemID()

	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	sid := id.NewSchemaID()
	mid := id.NewModelID()

	// Two reference fields pointing to different models
	allowedModelID := id.NewModelID()
	otherModelID := id.NewModelID()
	allowedRefFieldID := id.NewFieldID()
	otherRefFieldID := id.NewFieldID()

	allowedRefField := schema.NewField(schema.NewReference(allowedModelID, id.NewSchemaID(), nil, nil).TypeProperty()).
		ID(allowedRefFieldID).Key(id.RandomKey()).Multiple(true).MustBuild()
	otherRefField := schema.NewField(schema.NewReference(otherModelID, id.NewSchemaID(), nil, nil).TypeProperty()).
		ID(otherRefFieldID).Key(id.RandomKey()).Multiple(true).MustBuild()

	s := schema.New().ID(sid).Workspace(wid).Project(pid).Fields([]*schema.Field{allowedRefField, otherRefField}).MustBuild()
	sp := *schema.NewPackage(s, nil, nil, nil)

	tests := []struct {
		name     string
		list     List
		models   id.ModelIDList
		expected IDList
	}{
		{
			name:     "nil list",
			list:     nil,
			models:   id.ModelIDList{allowedModelID},
			expected: nil,
		},
		{
			name:     "empty models list",
			list:     List{New().NewID().Schema(sid).Model(mid).Project(pid).MustBuild()},
			models:   id.ModelIDList{},
			expected: nil,
		},
		{
			name: "returns only refs from allowed model",
			list: List{
				New().NewID().Schema(sid).Model(mid).Project(pid).Fields([]*Field{
					NewField(allowedRefFieldID, value.TypeReference.Value(refID1).AsMultiple(), nil),
					NewField(otherRefFieldID, value.TypeReference.Value(refID2).AsMultiple(), nil),
				}).MustBuild(),
			},
			models:   id.ModelIDList{allowedModelID},
			expected: IDList{refID1},
		},
		{
			name: "no refs match allowed models",
			list: List{
				New().NewID().Schema(sid).Model(mid).Project(pid).Fields([]*Field{
					NewField(otherRefFieldID, value.TypeReference.Value(refID1).AsMultiple(), nil),
				}).MustBuild(),
			},
			models:   id.ModelIDList{allowedModelID},
			expected: IDList{},
		},
		{
			name: "multiple items with refs deduplicated",
			list: List{
				New().NewID().Schema(sid).Model(mid).Project(pid).Fields([]*Field{
					NewField(allowedRefFieldID, value.TypeReference.Value(refID1).AsMultiple(), nil),
				}).MustBuild(),
				New().NewID().Schema(sid).Model(mid).Project(pid).Fields([]*Field{
					NewField(allowedRefFieldID, value.TypeReference.Value(refID1).AsMultiple(), nil),
				}).MustBuild(),
				New().NewID().Schema(sid).Model(mid).Project(pid).Fields([]*Field{
					NewField(allowedRefFieldID, value.TypeReference.Value(refID2).AsMultiple(), nil),
				}).MustBuild(),
			},
			models:   id.ModelIDList{allowedModelID},
			expected: IDList{refID1, refID2},
		},
		{
			name: "multiple allowed models",
			list: List{
				New().NewID().Schema(sid).Model(mid).Project(pid).Fields([]*Field{
					NewField(allowedRefFieldID, value.TypeReference.Value(refID1).AsMultiple(), nil),
					NewField(otherRefFieldID, value.TypeReference.Value(refID2).AsMultiple(), nil),
				}).MustBuild(),
			},
			models:   id.ModelIDList{allowedModelID, otherModelID},
			expected: IDList{refID1, refID2},
		},
		{
			name: "multiple items mixed refs across models",
			list: List{
				New().NewID().Schema(sid).Model(mid).Project(pid).Fields([]*Field{
					NewField(allowedRefFieldID, value.NewMultiple(value.TypeReference, []any{refID1, refID2}), nil),
					NewField(otherRefFieldID, value.TypeReference.Value(refID3).AsMultiple(), nil),
				}).MustBuild(),
			},
			models:   id.ModelIDList{allowedModelID},
			expected: IDList{refID1, refID2},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := tt.list.RefItemsIDsByModels(sp, tt.models)

			if tt.expected == nil {
				assert.Nil(t, got)
			} else {
				assert.ElementsMatch(t, tt.expected, got)
			}
		})
	}
}

func TestVersionedList_AssetIDs(t *testing.T) {
	t.Parallel()

	now := time.Now()
	aid1, aid2, aid3 := id.NewAssetID(), id.NewAssetID(), id.NewAssetID()
	assetFieldID := id.NewFieldID()

	assetField := schema.NewField(schema.NewAsset().TypeProperty()).ID(assetFieldID).Key(id.RandomKey()).Multiple(true).MustBuild()
	s := schema.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(id.NewProjectID()).
		Fields([]*schema.Field{assetField}).MustBuild()
	sp := *schema.NewPackage(s, nil, nil, nil)

	newVersioned := func(i *Item) Versioned {
		return version.MustBeValue(version.New(), nil, version.NewRefs(version.Latest), now, i)
	}
	newItem := func(aids ...id.AssetID) *Item {
		vals := make([]any, len(aids))
		for i, a := range aids {
			vals[i] = a
		}
		return New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(id.NewProjectID()).
			Thread(id.NewThreadID().Ref()).
			Fields([]*Field{NewField(assetFieldID, value.NewMultiple(value.TypeAsset, vals), nil)}).
			MustBuild()
	}

	tests := []struct {
		name     string
		list     VersionedList
		expected AssetIDList
	}{
		{
			name:     "nil list",
			list:     nil,
			expected: nil,
		},
		{
			name:     "empty list",
			list:     VersionedList{},
			expected: nil,
		},
		{
			name:     "single item single asset",
			list:     VersionedList{newVersioned(newItem(aid1))},
			expected: AssetIDList{aid1},
		},
		{
			name:     "single item multiple assets",
			list:     VersionedList{newVersioned(newItem(aid1, aid2))},
			expected: AssetIDList{aid1, aid2},
		},
		{
			name: "multiple items unique assets",
			list: VersionedList{
				newVersioned(newItem(aid1)),
				newVersioned(newItem(aid2)),
			},
			expected: AssetIDList{aid1, aid2},
		},
		{
			name: "multiple items with duplicates deduplicated",
			list: VersionedList{
				newVersioned(newItem(aid1)),
				newVersioned(newItem(aid1)),
				newVersioned(newItem(aid2)),
			},
			expected: AssetIDList{aid1, aid2},
		},
		{
			name: "multiple items all assets",
			list: VersionedList{
				newVersioned(newItem(aid1, aid2)),
				newVersioned(newItem(aid2, aid3)),
			},
			expected: AssetIDList{aid1, aid2, aid3},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := tt.list.AssetIDs(sp)

			if tt.expected == nil {
				assert.Nil(t, got)
			} else {
				assert.ElementsMatch(t, tt.expected, got)
			}
		})
	}
}
