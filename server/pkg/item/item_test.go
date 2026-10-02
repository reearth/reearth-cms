package item

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestItem_updateFields(t *testing.T) {
	now := time.Now()
	defer util.MockNow(now)()
	f := NewField(id.NewFieldID(), value.TypeText.Value("test").AsMultiple(), nil)
	fid, fid2, fid3 := id.NewFieldID(), id.NewFieldID(), id.NewFieldID()

	tests := []struct {
		name   string
		target *Item
		input  []*Field
		want   *Item
	}{
		{
			name:   "should update fields",
			input:  []*Field{f},
			target: &Item{},
			want: &Item{
				fields:    []*Field{f},
				timestamp: now,
			},
		},
		{
			name: "should update fields",
			input: []*Field{
				NewField(fid, value.TypeText.Value("test2").AsMultiple(), nil),
				NewField(fid3, value.TypeText.Value("test!!").AsMultiple(), nil),
			},
			target: &Item{
				fields: []*Field{
					NewField(fid, value.TypeText.Value("test").AsMultiple(), nil),
					NewField(fid2, value.TypeText.Value("test!").AsMultiple(), nil),
				},
			},
			want: &Item{
				fields: []*Field{
					NewField(fid, value.TypeText.Value("test2").AsMultiple(), nil),
					NewField(fid2, value.TypeText.Value("test!").AsMultiple(), nil),
					NewField(fid3, value.TypeText.Value("test!!").AsMultiple(), nil),
				},
				timestamp: now,
			},
		},
		{
			name:   "nil fields",
			input:  nil,
			target: &Item{},
			want:   &Item{},
		},
		func() struct {
			name   string
			target *Item
			input  []*Field
			want   *Item
		} {
			gid1, gid2 := id.NewItemGroupID(), id.NewItemGroupID()
			groupField := NewField(id.NewFieldID(), value.NewMultiple(value.TypeGroup, []any{gid1, gid2}), nil)
			fg1old := NewField(fid, value.TypeText.Value("group1_old").AsMultiple(), &gid1)
			fg1new := NewField(fid, value.TypeText.Value("group1_new").AsMultiple(), &gid1)
			fg2new := NewField(fid, value.TypeText.Value("group2_new").AsMultiple(), &gid2)
			return struct {
				name   string
				target *Item
				input  []*Field
				want   *Item
			}{
				name:  "should update fields in different groups with same field ID",
				input: []*Field{fg1new, fg2new, groupField},
				target: &Item{
					fields: []*Field{fg1old, groupField},
				},
				want: &Item{
					fields:    []*Field{fg1new, groupField, fg2new},
					timestamp: now,
				},
			}
		}(),
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.target.updateFields(tt.input)
			assert.Equal(t, tt.want, tt.target)
		})
	}
}

func TestItem_AttachDefault(t *testing.T) {
	type fixture struct {
		pkg                *schema.Package
		groupField         *schema.Field
		titleField         *schema.Field
		subtitleField      *schema.Field
		bodyField          *schema.Field
		groupSubtitleField *schema.Field
		groupBodyField     *schema.Field
		metadataField      *schema.Field
	}

	newFixture := func(withGroupSchema bool) fixture {
		groupID := id.NewGroupID()
		titleField := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(id.NewKey("title")).DefaultValue(value.TypeText.Value("untitled").AsMultiple()).MustBuild()
		groupField := schema.NewField(schema.NewGroup(groupID).TypeProperty()).NewID().Key(id.NewKey("sections")).Multiple(true).MustBuild()
		groupSubtitleField := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(id.NewKey("subtitle")).DefaultValue(value.TypeText.Value("default subtitle").AsMultiple()).MustBuild()
		groupBodyField := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(id.NewKey("body")).DefaultValue(value.TypeText.Value("default body").AsMultiple()).MustBuild()
		metadataField := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(id.NewKey("metadata title")).DefaultValue(value.TypeText.Value("metadata default").AsMultiple()).MustBuild()

		groupSchemas := map[id.GroupID]*schema.Schema(nil)
		if withGroupSchema {
			groupSchemas = map[id.GroupID]*schema.Schema{groupID: buildValidationTestSchema(groupSubtitleField, groupBodyField)}
		}

		return fixture{
			pkg:                schema.NewPackage(buildValidationTestSchema(groupField, titleField), buildValidationTestSchema(metadataField), groupSchemas, nil),
			groupField:         groupField,
			titleField:         titleField,
			groupSubtitleField: groupSubtitleField,
			groupBodyField:     groupBodyField,
			metadataField:      metadataField,
		}
	}

	tests := []struct {
		name  string
		setup func() (*Item, *schema.Package, Fields)
	}{
		// TODO: re-enable this test when group default attachment is implemented
		//{
		//	name: "attaches missing top-level and group defaults for every instance",
		//	setup: func() (*Item, *schema.Package, Fields) {
		//		f := newFixture(true)
		//		first, second := id.NewItemGroupID(), id.NewItemGroupID()
		//		group := NewField(f.groupField.ID(), value.NewMultiple(value.TypeGroup, []any{first, second}), nil)
		//		customBody := NewField(f.bodyField.ID(), value.TypeText.Value("custom body").AsMultiple(), &first)
		//		return &Item{fields: []*Field{group, customBody}}, f.pkg, Fields{
		//			group,
		//			customBody,
		//			NewField(f.titleField.ID(), f.titleField.DefaultValue(), nil),
		//			NewField(f.subtitleField.ID(), f.subtitleField.DefaultValue(), &first),
		//			NewField(f.subtitleField.ID(), f.subtitleField.DefaultValue(), &second),
		//			NewField(f.bodyField.ID(), f.bodyField.DefaultValue(), &second),
		//		}
		//	},
		//},
		{
			name: "preserves an existing top-level value",
			setup: func() (*Item, *schema.Package, Fields) {
				f := newFixture(true)
				title := NewField(f.titleField.ID(), value.TypeText.Value("custom title").AsMultiple(), nil)
				return &Item{fields: []*Field{title}}, f.pkg, Fields{title}
			},
		},
		{
			name: "does not attach group defaults when the group field is absent",
			setup: func() (*Item, *schema.Package, Fields) {
				f := newFixture(true)
				return &Item{}, f.pkg, Fields{NewField(f.titleField.ID(), f.titleField.DefaultValue(), nil)}
			},
		},
		{
			name: "does not attach group defaults for an invalid group value",
			setup: func() (*Item, *schema.Package, Fields) {
				f := newFixture(true)
				group := NewField(f.groupField.ID(), value.TypeText.Value("not a group").AsMultiple(), nil)
				return &Item{fields: []*Field{group}}, f.pkg, Fields{group, NewField(f.titleField.ID(), f.titleField.DefaultValue(), nil)}
			},
		},
		{
			name: "does not attach group defaults without a matching group schema",
			setup: func() (*Item, *schema.Package, Fields) {
				f := newFixture(false)
				instance := id.NewItemGroupID()
				group := NewField(f.groupField.ID(), value.NewMultiple(value.TypeGroup, []any{instance}), nil)
				return &Item{fields: []*Field{group}}, f.pkg, Fields{group, NewField(f.titleField.ID(), f.titleField.DefaultValue(), nil)}
			},
		},
		{
			name: "attaches metadata defaults without main or group defaults",
			setup: func() (*Item, *schema.Package, Fields) {
				f := newFixture(true)
				return &Item{isMetadata: true}, f.pkg, Fields{NewField(f.metadataField.ID(), f.metadataField.DefaultValue(), nil)}
			},
		},
		{
			name: "does nothing for a nil schema package",
			setup: func() (*Item, *schema.Package, Fields) {
				field := NewField(id.NewFieldID(), value.TypeText.Value("value").AsMultiple(), nil)
				return &Item{fields: []*Field{field}}, nil, Fields{field}
			},
		},
		{
			name: "does nothing for a nil item",
			setup: func() (*Item, *schema.Package, Fields) {
				return nil, newFixture(true).pkg, nil
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			item, pkg, want := tt.setup()
			item.AttachDefault(pkg)
			if item != nil {
				assert.Equal(t, want, item.Fields())
			}
		})
	}
}

func TestItem_ClearField(t *testing.T) {
	now := time.Now()
	defer util.MockNow(now)()

	fid1, fid2, fid3 := id.NewFieldID(), id.NewFieldID(), id.NewFieldID()
	f1 := NewField(fid1, value.TypeText.Value("test").AsMultiple(), nil)
	f2 := NewField(fid2, value.TypeText.Value("test").AsMultiple(), nil)
	f3 := NewField(fid3, value.TypeText.Value("test").AsMultiple(), nil)

	i := &Item{fields: []*Field{f1, f2, f3}}

	i.ClearField(fid2)
	assert.Equal(t, []*Field{f1, f3}, i.fields)
}

func TestItem_ClearReferenceFields(t *testing.T) {
	now := time.Now()
	defer util.MockNow(now)()

	fid1, fid2, fid3 := id.NewFieldID(), id.NewFieldID(), id.NewFieldID()
	f1 := NewField(fid1, value.TypeText.Value("test").AsMultiple(), nil)
	f2 := NewField(fid2, value.TypeText.Value("test").AsMultiple(), nil)
	f3 := NewField(fid3, value.TypeReference.Value(id.NewItemID()).AsMultiple(), nil)

	i := &Item{fields: []*Field{f1, f2, f3}}

	i.ClearReferenceFields()
	assert.Equal(t, []*Field{f1, f2}, i.fields)
}

func TestItem_Filtered(t *testing.T) {
	sfid1 := id.NewFieldID()
	sfid2 := id.NewFieldID()
	sfid3 := id.NewFieldID()
	sfid4 := id.NewFieldID()
	f1 := &Field{field: sfid1}
	f2 := &Field{field: sfid2}
	f3 := &Field{field: sfid3}
	f4 := &Field{field: sfid4}

	tests := []struct {
		name string
		item *Item
		args id.FieldIDList
		want *Item
	}{
		{
			name: "success",
			item: &Item{
				fields: []*Field{f1, f2, f3, f4},
			},
			args: id.FieldIDList{sfid1, sfid3},
			want: &Item{
				fields: []*Field{f1, f3},
			},
		},
		{
			name: "nil item",
		},
		{
			name: "nil fs list",
			item: &Item{
				fields: []*Field{f1, f2, f3, f4},
			},
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()

			got := tc.item.FilterFields(tc.args)
			assert.Equal(tt, tc.want, got)
		})
	}
}

func TestItem_IsAnonymous(t *testing.T) {
	t.Parallel()

	base := func() *Builder {
		return New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref())
	}

	// anonymous flag is reflected by the getter and survives Clone
	anon := base().Anonymous(true).MustBuild()
	assert.True(t, anon.IsAnonymous())
	assert.True(t, anon.Clone().IsAnonymous())

	// user-originated items are not anonymous, and the flag defaults to false
	user := base().User(accountdomain.NewUserID()).MustBuild()
	assert.False(t, user.IsAnonymous())
	assert.False(t, user.Clone().IsAnonymous())
}

func TestItem_HasField(t *testing.T) {
	f1 := NewField(id.NewFieldID(), value.TypeText.Value("foo").AsMultiple(), nil)
	f2 := NewField(id.NewFieldID(), value.TypeText.Value("hoge").AsMultiple(), nil)
	i1 := New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Fields([]*Field{f1, f2}).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).Anonymous(true).MustBuild()

	type args struct {
		fid   id.FieldID
		value any
	}
	tests := []struct {
		name string
		item *Item
		args args
		want bool
	}{
		{
			name: "true: must find a field",
			args: args{
				fid:   f1.FieldID(),
				value: f1.Value(),
			},
			item: i1,
			want: true,
		},
		{
			name: "false: no existed value",
			args: args{
				fid:   f1.FieldID(),
				value: "xxx",
			},
			item: i1,
			want: false,
		},
		{
			name: "false: no existed ID",
			args: args{
				fid:   id.NewFieldID(),
				value: f1.Value(),
			},
			item: i1,
			want: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			assert.Equal(t, tt.want, tt.item.HasField(tt.args.fid, tt.args.value))
		})
	}
}

func TestItem_AssetIDs(t *testing.T) {
	aid, aid2 := id.NewAssetID(), id.NewAssetID()
	assert.Equal(t, id.AssetIDList{aid, aid2}, (&Item{
		fields: []*Field{
			{value: value.New(value.TypeAsset, aid).AsMultiple()},
			{value: value.New(value.TypeText, "aa").AsMultiple()},
			{value: value.New(value.TypeAsset, aid2).AsMultiple()},
		},
	}).AssetIDs())
}

func TestItem_AssetIDsBySchema(t *testing.T) {
	t.Parallel()

	aid1, aid2, aid3 := id.NewAssetID(), id.NewAssetID(), id.NewAssetID()
	assetFieldID := id.NewFieldID()
	textFieldID := id.NewFieldID()
	multiAssetFieldID := id.NewFieldID()

	// Create schema with asset and text fields
	wid := accountdomain.NewWorkspaceID()
	assetField := schema.NewField(schema.NewAsset().TypeProperty()).ID(assetFieldID).Key(id.RandomKey()).MustBuild()
	textField := schema.NewField(schema.NewText(nil).TypeProperty()).ID(textFieldID).Key(id.RandomKey()).MustBuild()
	multiAssetField := schema.NewField(schema.NewAsset().TypeProperty()).ID(multiAssetFieldID).Key(id.RandomKey()).Multiple(true).MustBuild()
	s := schema.New().NewID().Workspace(wid).Project(id.NewProjectID()).Fields([]*schema.Field{assetField, textField, multiAssetField}).MustBuild()

	tests := []struct {
		name     string
		item     *Item
		pkg      schema.Package
		expected AssetIDList
	}{
		{
			name: "empty schema package",
			item: &Item{
				fields: []*Field{
					{field: assetFieldID, value: value.New(value.TypeAsset, aid1).AsMultiple()},
				},
			},
			pkg:      schema.Package{},
			expected: nil,
		},
		{
			name: "single asset field",
			item: &Item{
				fields: []*Field{
					{field: assetFieldID, value: value.New(value.TypeAsset, aid1).AsMultiple()},
					{field: textFieldID, value: value.New(value.TypeText, "test").AsMultiple()},
				},
			},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: AssetIDList{aid1},
		},
		{
			name: "multiple asset field",
			item: &Item{
				fields: []*Field{
					{field: multiAssetFieldID, value: value.NewMultiple(value.TypeAsset, []any{aid1, aid2})},
				},
			},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: AssetIDList{aid1, aid2},
		},
		{
			name: "mixed fields",
			item: &Item{
				fields: []*Field{
					{field: assetFieldID, value: value.New(value.TypeAsset, aid1).AsMultiple()},
					{field: textFieldID, value: value.New(value.TypeText, "test").AsMultiple()},
					{field: multiAssetFieldID, value: value.NewMultiple(value.TypeAsset, []any{aid2, aid3})},
				},
			},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: AssetIDList{aid1, aid2, aid3},
		},
		{
			name: "no asset fields in item",
			item: &Item{
				fields: []*Field{
					{field: textFieldID, value: value.New(value.TypeText, "test").AsMultiple()},
				},
			},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: AssetIDList{},
		},
		{
			name: "item has asset field not in schema (deleted field)",
			item: &Item{
				fields: []*Field{
					{field: NewFieldID(), value: value.New(value.TypeAsset, aid1).AsMultiple()},
				},
			},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: AssetIDList{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := tt.item.AssetIDsBySchema(tt.pkg)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestItem_RefItemIDsByModels(t *testing.T) {
	t.Parallel()

	refID1 := id.NewItemID()
	refID2 := id.NewItemID()

	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()

	refFieldID := id.NewFieldID()
	otherRefFieldID := id.NewFieldID()
	textFieldID := id.NewFieldID()

	modelId := id.NewModelID()
	otherModelId := id.NewModelID()

	refField := schema.NewField(schema.NewReference(modelId, id.NewSchemaID(), nil, nil).TypeProperty()).
		ID(refFieldID).Key(id.RandomKey()).Multiple(true).MustBuild()
	otherRefField := schema.NewField(schema.NewReference(otherModelId, id.NewSchemaID(), nil, nil).TypeProperty()).
		ID(otherRefFieldID).Key(id.RandomKey()).MustBuild()
	textField := schema.NewField(schema.NewText(nil).TypeProperty()).
		ID(textFieldID).Key(id.RandomKey()).MustBuild()

	pkgRefOnly := *schema.NewPackage(schema.New().NewID().Workspace(wid).Project(pid).Fields([]*schema.Field{refField}).MustBuild(), nil, nil, nil)
	pkgBothRefs := *schema.NewPackage(schema.New().NewID().Workspace(wid).Project(pid).Fields([]*schema.Field{refField, otherRefField}).MustBuild(), nil, nil, nil)
	pkgNoRefs := *schema.NewPackage(schema.New().NewID().Workspace(wid).Project(pid).Fields([]*schema.Field{textField}).MustBuild(), nil, nil, nil)

	tests := []struct {
		name     string
		item     *Item
		pkg      schema.Package
		models   id.ModelIDList
		expected IDList
	}{
		{
			name:     "schema with no reference fields returns nil",
			item:     &Item{fields: []*Field{{field: refFieldID, value: value.TypeReference.Value(refID1).AsMultiple()}}},
			pkg:      pkgNoRefs,
			models:   id.ModelIDList{modelId, otherModelId},
			expected: nil,
		},
		{
			name:     "item has no matching fields",
			item:     &Item{fields: []*Field{{field: textFieldID, value: value.TypeText.Value("test").AsMultiple()}}},
			pkg:      pkgRefOnly,
			expected: IDList{},
		},
		{
			name: "single reference field single value",
			item: &Item{fields: []*Field{
				{field: refFieldID, value: value.TypeReference.Value(refID1).AsMultiple()},
			}},
			pkg:      pkgRefOnly,
			models:   id.ModelIDList{modelId, otherModelId},
			expected: IDList{refID1},
		},
		{
			name: "multiple values in reference field",
			item: &Item{fields: []*Field{
				{field: refFieldID, value: value.NewMultiple(value.TypeReference, []any{refID1, refID2})},
			}},
			pkg:      pkgRefOnly,
			models:   id.ModelIDList{modelId},
			expected: IDList{refID1, refID2},
		},
		{
			name: "only schema reference fields are collected",
			item: &Item{fields: []*Field{
				{field: refFieldID, value: value.TypeReference.Value(refID1).AsMultiple()},
				{field: otherRefFieldID, value: value.TypeReference.Value(refID2).AsMultiple()},
			}},
			pkg:      pkgRefOnly,
			models:   id.ModelIDList{modelId},
			expected: IDList{refID1},
		},
		{
			name: "both reference fields collected when both in schema",
			item: &Item{fields: []*Field{
				{field: refFieldID, value: value.TypeReference.Value(refID1).AsMultiple()},
				{field: otherRefFieldID, value: value.TypeReference.Value(refID2).AsMultiple()},
			}},
			pkg:      pkgBothRefs,
			models:   id.ModelIDList{modelId, otherModelId},
			expected: IDList{refID1, refID2},
		},
		{
			name: "both reference fields collected when both in schema",
			item: &Item{fields: []*Field{
				{field: refFieldID, value: value.TypeReference.Value(refID1).AsMultiple()},
				{field: otherRefFieldID, value: value.TypeReference.Value(refID2).AsMultiple()},
			}},
			pkg:      pkgBothRefs,
			models:   id.ModelIDList{modelId},
			expected: IDList{refID1},
		},
		{
			name: "non-reference value in field is ignored",
			item: &Item{fields: []*Field{
				{field: refFieldID, value: value.TypeText.Value("not-a-ref").AsMultiple()},
			}},
			pkg:      pkgRefOnly,
			expected: IDList{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := tt.item.RefItemsIDsByModels(tt.pkg, tt.models)
			assert.ElementsMatch(t, tt.expected, got)
		})
	}
}

func TestItem_RefItemIDsBySchema(t *testing.T) {
	t.Parallel()

	refID1 := id.NewItemID()
	refID2 := id.NewItemID()

	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()

	refFieldID := id.NewFieldID()
	textFieldID := id.NewFieldID()

	refField := schema.NewField(schema.NewReference(id.NewModelID(), id.NewSchemaID(), nil, nil).TypeProperty()).
		ID(refFieldID).Key(id.RandomKey()).Multiple(true).MustBuild()
	textField := schema.NewField(schema.NewText(nil).TypeProperty()).
		ID(textFieldID).Key(id.RandomKey()).MustBuild()
	s := schema.New().NewID().Workspace(wid).Project(pid).Fields([]*schema.Field{refField, textField}).MustBuild()

	tests := []struct {
		name     string
		item     *Item
		pkg      schema.Package
		expected IDList
	}{
		{
			name:     "empty schema package returns nil",
			item:     &Item{fields: []*Field{{field: refFieldID, value: value.TypeReference.Value(refID1).AsMultiple()}}},
			pkg:      schema.Package{},
			expected: nil,
		},
		{
			name: "no reference fields in schema returns nil",
			item: &Item{fields: []*Field{
				{field: textFieldID, value: value.TypeText.Value("test").AsMultiple()},
			}},
			pkg:      *schema.NewPackage(schema.New().NewID().Workspace(wid).Project(pid).Fields([]*schema.Field{textField}).MustBuild(), nil, nil, nil),
			expected: nil,
		},
		{
			name: "collects ref IDs from matching schema fields",
			item: &Item{fields: []*Field{
				{field: refFieldID, value: value.TypeReference.Value(refID1).AsMultiple()},
				{field: textFieldID, value: value.TypeText.Value("test").AsMultiple()},
			}},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: IDList{refID1},
		},
		{
			name: "collects multiple ref IDs from multi-value field",
			item: &Item{fields: []*Field{
				{field: refFieldID, value: value.NewMultiple(value.TypeReference, []any{refID1, refID2})},
			}},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: IDList{refID1, refID2},
		},
		{
			name: "field not in schema is ignored",
			item: &Item{fields: []*Field{
				{field: id.NewFieldID(), value: value.TypeReference.Value(refID1).AsMultiple()},
			}},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: IDList{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := tt.item.RefItemsIDs(tt.pkg)
			assert.ElementsMatch(t, tt.expected, got)
		})
	}
}

func TestItem_RefItemsIds(t *testing.T) {
	t.Parallel()

	refID1, refID2, refID3 := id.NewItemID(), id.NewItemID(), id.NewItemID()
	refFieldID := id.NewFieldID()
	refFieldID2 := id.NewFieldID()
	multiRefFieldID := id.NewFieldID()
	textFieldID := id.NewFieldID()

	wid := accountdomain.NewWorkspaceID()
	refField := schema.NewField(schema.NewReference(id.NewModelID(), id.NewSchemaID(), nil, nil).TypeProperty()).ID(refFieldID).Key(id.RandomKey()).MustBuild()
	refField2 := schema.NewField(schema.NewReference(id.NewModelID(), id.NewSchemaID(), nil, nil).TypeProperty()).ID(refFieldID2).Key(id.RandomKey()).MustBuild()
	multiRefField := schema.NewField(schema.NewReference(id.NewModelID(), id.NewSchemaID(), nil, nil).TypeProperty()).ID(multiRefFieldID).Key(id.RandomKey()).Multiple(true).MustBuild()
	textField := schema.NewField(schema.NewText(nil).TypeProperty()).ID(textFieldID).Key(id.RandomKey()).MustBuild()
	s := schema.New().NewID().Workspace(wid).Project(id.NewProjectID()).Fields([]*schema.Field{refField, refField2, multiRefField, textField}).MustBuild()

	tests := []struct {
		name     string
		item     *Item
		pkg      schema.Package
		expected IDList
	}{
		{
			name: "empty schema package",
			item: &Item{
				fields: []*Field{
					{field: refFieldID, value: value.TypeReference.Value(refID1).AsMultiple()},
				},
			},
			pkg:      schema.Package{},
			expected: nil,
		},
		{
			name: "single reference field",
			item: &Item{
				fields: []*Field{
					{field: refFieldID, value: value.TypeReference.Value(refID1).AsMultiple()},
					{field: textFieldID, value: value.TypeText.Value("test").AsMultiple()},
				},
			},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: IDList{refID1},
		},
		{
			name: "multiple reference values",
			item: &Item{
				fields: []*Field{
					{field: multiRefFieldID, value: value.NewMultiple(value.TypeReference, []any{refID1, refID2})},
				},
			},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: IDList{refID1, refID2},
		},
		{
			name: "non-multiple field extracts only first reference",
			item: &Item{
				fields: []*Field{
					{field: refFieldID, value: value.NewMultiple(value.TypeReference, []any{refID1, refID2})},
				},
			},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: IDList{refID1},
		},
		{
			name: "deduplicate duplicated references",
			item: &Item{
				fields: []*Field{
					{field: refFieldID, value: value.NewMultiple(value.TypeReference, []any{refID1, refID2, refID1})},
					{field: refFieldID2, value: value.TypeReference.Value(refID2).AsMultiple()},
					{field: textFieldID, value: value.TypeText.Value("test").AsMultiple()},
				},
			},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: IDList{refID1, refID2},
		},
		{
			name: "ignore references from fields not in schema package",
			item: &Item{
				fields: []*Field{
					{field: id.NewFieldID(), value: value.TypeReference.Value(refID3).AsMultiple()},
					{field: refFieldID, value: value.TypeReference.Value(refID1).AsMultiple()},
				},
			},
			pkg:      *schema.NewPackage(s, nil, nil, nil),
			expected: IDList{refID1},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.expected, tt.item.RefItemsIDs(tt.pkg))
		})
	}
}

func TestItem_User(t *testing.T) {
	f1 := NewField(id.NewFieldID(), value.TypeText.Value("foo").AsMultiple(), nil)
	uid := accountdomain.NewUserID()
	i1 := New().NewID().User(uid).Schema(id.NewSchemaID()).Model(id.NewModelID()).Fields([]*Field{f1}).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).MustBuild()

	assert.Equal(t, &uid, i1.User())
}

func TestItem_Integration(t *testing.T) {
	f1 := NewField(id.NewFieldID(), value.TypeText.Value("foo").AsMultiple(), nil)
	iid := id.NewIntegrationID()
	i1 := New().NewID().Integration(iid).Schema(id.NewSchemaID()).Model(id.NewModelID()).Fields([]*Field{f1}).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).MustBuild()

	assert.Equal(t, &iid, i1.Integration())
}

func TestItem_SetUpdatedByIntegration(t *testing.T) {
	uid := accountdomain.NewUserID()
	iid := id.NewIntegrationID()
	itm := &Item{
		updatedByUser: uid.Ref(),
	}
	itm.SetUpdatedByIntegration(iid)
	assert.Equal(t, iid.Ref(), itm.UpdatedByIntegration())
	assert.Nil(t, itm.UpdatedByUser())
}

func TestItem_SetUpdatedByUser(t *testing.T) {
	uid := accountdomain.NewUserID()
	iid := id.NewIntegrationID()
	itm := &Item{
		updatedByIntegration: iid.Ref(),
	}
	itm.SetUpdatedByUser(uid)
	assert.Equal(t, uid.Ref(), itm.UpdatedByUser())
	assert.Nil(t, itm.UpdatedByIntegration())
}

func TestItem_SetMetadataItem(t *testing.T) {
	mid := NewID()
	itm := &Item{}
	itm.SetMetadataItem(mid)
	assert.Equal(t, mid.Ref(), itm.MetadataItem())
}

func TestItem_SetOriginalItem(t *testing.T) {
	oid := NewID()
	itm := &Item{}
	itm.SetOriginalItem(oid)
	assert.Equal(t, oid.Ref(), itm.OriginalItem())
}

func TestItem_GetTitle(t *testing.T) {
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	sf1 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	sf2 := schema.NewField(schema.NewText(new(10)).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	s1 := schema.New().NewID().Workspace(wid).Project(pid).Fields(schema.FieldList{sf1, sf2}).MustBuild()
	if1 := NewField(sf1.ID(), value.TypeBool.Value(false).AsMultiple(), nil)
	if2 := NewField(sf2.ID(), value.TypeText.Value("test").AsMultiple(), nil)
	i1 := New().NewID().Schema(s1.ID()).Model(id.NewModelID()).Fields([]*Field{if1, if2}).Project(pid).Thread(id.NewThreadID().Ref()).Anonymous(true).MustBuild()
	// schema is nil
	title := i1.GetTitle(nil)
	assert.Nil(t, title)
	// schema is not nil but no title field
	title = i1.GetTitle(s1)
	assert.Nil(t, title)
	// invalid type
	err := s1.SetTitleField(sf1.ID().Ref())
	assert.NoError(t, err)
	title = i1.GetTitle(s1)
	assert.Nil(t, title)
	// test title
	err = s1.SetTitleField(sf2.ID().Ref())
	assert.NoError(t, err)
	title = i1.GetTitle(s1)
	assert.Equal(t, "test", *title)
}

func TestItem_Clone(t *testing.T) {
	now := time.Now()
	itemID := NewID()
	schemaID := id.NewSchemaID()
	modelID := id.NewModelID()
	projectID := id.NewProjectID()
	threadID := id.NewThreadID()
	userID := id.NewUserID()
	integrationID := id.NewIntegrationID()
	metadataItemID := id.NewItemID()
	originalItemID := id.NewItemID()

	field1 := &Field{
		field: NewFieldID(),
		value: nil,
	}
	field2 := &Field{
		field: NewFieldID(),
		value: nil,
	}

	tests := []struct {
		name string
		item *Item
	}{
		{
			name: "nil item",
			item: nil,
		},
		{
			name: "item with fields",
			item: &Item{
				id:                   itemID,
				schema:               schemaID,
				model:                modelID,
				project:              projectID,
				fields:               []*Field{field1, field2},
				timestamp:            now,
				thread:               &threadID,
				isMetadata:           true,
				user:                 (*UserID)(&userID),
				updatedByUser:        (*UserID)(&userID),
				updatedByIntegration: &integrationID,
				integration:          &integrationID,
				metadataItem:         &metadataItemID,
				originalItem:         &originalItemID,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cloned := tt.item.Clone()
			if tt.item == nil {
				assert.Nil(t, cloned)
				return
			}
			assert.NotNil(t, cloned)
			assert.Equal(t, tt.item.id, cloned.id)
			assert.Equal(t, tt.item.schema, cloned.schema)
			assert.Equal(t, tt.item.model, cloned.model)
			assert.Equal(t, tt.item.project, cloned.project)
			assert.Equal(t, tt.item.timestamp, cloned.timestamp)
			assert.Equal(t, tt.item.thread, cloned.thread)
			assert.Equal(t, tt.item.isMetadata, cloned.isMetadata)
			assert.Equal(t, tt.item.user, cloned.user)
			assert.Equal(t, tt.item.updatedByUser, cloned.updatedByUser)
			assert.Equal(t, tt.item.updatedByIntegration, cloned.updatedByIntegration)
			assert.Equal(t, tt.item.integration, cloned.integration)
			assert.Equal(t, tt.item.metadataItem, cloned.metadataItem)
			assert.Equal(t, tt.item.originalItem, cloned.originalItem)
			assert.Len(t, cloned.fields, len(tt.item.fields))
			// Ensure fields are deep cloned
			for i := range tt.item.fields {
				if tt.item.fields[i] != nil {
					assert.NotSame(t, tt.item.fields[i], cloned.fields[i])
				}
			}
		})
	}
}

func TestItem_SetReference(t *testing.T) {
	t.Parallel()

	fid, other := id.NewFieldID(), id.NewFieldID()
	ref, ref2 := NewID(), NewID()
	it := &Item{fields: []*Field{
		NewField(fid, value.TypeReference.Value(ref).AsMultiple(), nil),
		NewField(other, value.TypeText.Value("x").AsMultiple(), nil),
	}}

	it.SetReference(fid, ref2)
	assert.Equal(t, value.TypeReference.Value(ref2).AsMultiple(), it.Field(fid).Value())
	assert.Len(t, it.Fields(), 2)

	fid2 := id.NewFieldID()
	it.SetReference(fid2, ref)
	assert.Equal(t, value.TypeReference.Value(ref).AsMultiple(), it.Field(fid2).Value())
	assert.Len(t, it.Fields(), 3)
}

func TestItem_ClearReference(t *testing.T) {
	t.Parallel()

	fid := id.NewFieldID()
	ig := id.NewItemGroupID()
	ref1, ref2, ref3 := NewID(), NewID(), NewID()
	refs := func(ids ...ID) *value.Multiple {
		return value.NewMultiple(value.TypeReference, lo.Map(ids, func(i ID, _ int) any { return i }))
	}

	tests := []struct {
		name        string
		fields      []*Field
		refs        IDList
		want        bool
		wantValue   *value.Multiple
		wantGroup   *ItemGroupID
		wantMissing bool
	}{
		{
			name:      "removes only the matching references",
			fields:    []*Field{NewField(fid, refs(ref1, ref2, ref3), nil)},
			refs:      IDList{ref2},
			want:      true,
			wantValue: refs(ref1, ref3),
		},
		{
			name: "keeps the group of the field",
			fields: []*Field{
				NewField(id.NewFieldID(), value.NewMultiple(value.TypeGroup, []any{ig}), nil),
				NewField(fid, refs(ref1), &ig),
			},
			refs:      IDList{ref1},
			want:      true,
			wantValue: refs(),
			wantGroup: &ig,
		},
		{
			name:      "nothing to remove",
			fields:    []*Field{NewField(fid, refs(ref1), nil)},
			refs:      IDList{ref2},
			want:      false,
			wantValue: refs(ref1),
		},
		{
			name:        "field missing",
			refs:        IDList{ref1},
			want:        false,
			wantMissing: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			it := &Item{fields: tt.fields}
			assert.Equal(t, tt.want, it.ClearReference(fid, tt.refs))
			f := it.Field(fid)
			if tt.wantMissing {
				assert.Nil(t, f)
				return
			}
			assert.Equal(t, tt.wantValue, f.Value())
			assert.Equal(t, tt.wantGroup, f.ItemGroup())
		})
	}
}

func TestItem_ApplyInput(t *testing.T) {
	t.Parallel()

	gid := id.NewGroupID()
	subtitleField := buildValidationTestField("subtitle", schema.NewText(nil).TypeProperty(), true)
	groupSchema := buildValidationTestSchema(subtitleField)

	titleField := buildValidationTestField("title", schema.NewText(nil).TypeProperty(), true)
	noteField := buildValidationTestField("note", schema.NewText(nil).TypeProperty(), false)
	defaultField := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(id.NewKey("withDefault")).
		DefaultValue(value.TypeText.Value("default").AsMultiple()).MustBuild()
	sectionField := buildValidationTestFieldMultiple("section", schema.NewGroup(gid).TypeProperty(), false)
	s := buildValidationTestSchema(titleField, noteField, defaultField, sectionField)
	groups := map[id.GroupID]*schema.Schema{gid: groupSchema}
	sp := schema.NewPackage(s, nil, groups, nil)

	metaField := buildValidationTestField("status", schema.NewText(nil).TypeProperty(), true)
	metaDefaultField := schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(id.NewKey("metaDefault")).
		DefaultValue(value.TypeText.Value("meta default").AsMultiple()).MustBuild()
	meta := buildValidationTestSchema(metaField, metaDefaultField)
	msp := schema.NewPackage(s, meta, groups, nil)

	ig1, ig2, other := id.NewItemGroupID(), id.NewItemGroupID(), id.NewItemGroupID()
	unknownKey := id.NewKey("unknown")
	unknownFieldID := id.NewFieldID()

	text := func(v string) *value.Multiple { return value.TypeText.Value(v).AsMultiple() }
	groupsValue := func(igs ...ItemGroupID) *value.Multiple {
		return value.NewMultiple(value.TypeGroup, lo.ToAnySlice(igs))
	}
	newItem := func(fields ...*Field) func() *Item {
		return func() *Item {
			return New().NewID().Schema(s.ID()).Project(s.Project()).Model(id.NewModelID()).
				User(accountdomain.NewUserID()).Fields(fields).ForSchemaPackage(sp).AttachDefault().MustBuild()
		}
	}
	newMetaItem := func(fields ...*Field) func() *Item {
		return func() *Item {
			return New().NewID().Schema(meta.ID()).Project(meta.Project()).Model(id.NewModelID()).
				User(accountdomain.NewUserID()).IsMetadata(true).Fields(fields).ForSchemaPackage(msp).AttachDefault().MustBuild()
		}
	}
	defaultValue := NewField(defaultField.ID(), text("default"), nil)

	tests := []struct {
		name        string
		item        func() *Item
		sp          *schema.Package
		inputs      FieldInputList
		wantErr     error
		wantChanged Fields
		wantErrs    schema.FieldValidationErrors
		wantFields  Fields
	}{
		{
			name:    "nil package",
			item:    newItem(),
			sp:      nil,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:    "package without the item schema",
			item:    newItem(),
			sp:      schema.NewPackage(buildValidationTestSchema(), nil, nil, nil),
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "group schema missing from the package",
			item: newItem(),
			sp:   schema.NewPackage(s, nil, nil, nil),
			inputs: FieldInputList{
				{Field: sectionField.ID().Ref(), Value: []any{ig1.String()}},
			},
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "stored group-typed value on a non-group schema field",
			item: newItem(NewField(titleField.ID(), groupsValue(ig1), nil)),
			sp:   sp,
			// title is not sent, so the stored group value is kept and resolved as a group field
			wantErr: ErrInvalidField,
		},
		{
			name: "input by key replaces the stored field and keeps the others",
			item: newItem(
				NewField(titleField.ID(), text("old"), nil),
				NewField(noteField.ID(), text("kept"), nil),
			),
			sp:          sp,
			inputs:      FieldInputList{{Key: titleField.Key().Ref(), Value: "new"}},
			wantChanged: Fields{NewField(titleField.ID(), text("new"), nil)},
			wantFields: Fields{
				NewField(titleField.ID(), text("new"), nil),
				NewField(noteField.ID(), text("kept"), nil),
				defaultValue,
			},
		},
		{
			name:        "input by id adds a new field and keeps the default value",
			item:        newItem(),
			sp:          sp,
			inputs:      FieldInputList{{Field: titleField.ID().Ref(), Value: "t"}},
			wantChanged: Fields{NewField(titleField.ID(), text("t"), nil)},
			wantFields:  Fields{defaultValue, NewField(titleField.ID(), text("t"), nil)},
		},
		{
			name: "sent value replaces the default value",
			item: newItem(),
			sp:   sp,
			inputs: FieldInputList{
				{Field: titleField.ID().Ref(), Value: "t"},
				{Field: defaultField.ID().Ref(), Value: "sent"},
			},
			wantChanged: Fields{
				NewField(titleField.ID(), text("t"), nil),
				NewField(defaultField.ID(), text("sent"), nil),
			},
			wantFields: Fields{
				NewField(defaultField.ID(), text("sent"), nil),
				NewField(titleField.ID(), text("t"), nil),
			},
		},
		{
			name: "unknown top-level inputs are ignored",
			item: newItem(),
			sp:   sp,
			inputs: FieldInputList{
				{Field: titleField.ID().Ref(), Value: "t"},
				{Key: unknownKey.Ref(), Value: "x"},
				{Field: unknownFieldID.Ref(), Value: "x"},
			},
			wantChanged: Fields{NewField(titleField.ID(), text("t"), nil)},
			wantFields:  Fields{defaultValue, NewField(titleField.ID(), text("t"), nil)},
		},
		{
			name: "missing required field",
			item: newItem(),
			sp:   sp,
			wantErrs: schema.FieldValidationErrors{
				titleField.ValidationError(schema.ErrValueRequired, schema.FieldValidationCodeRequired),
			},
			wantFields: Fields{defaultValue},
		},
		{
			name:   "type mismatch is reported once, not also as required, and still replaces the stored value",
			item:   newItem(NewField(titleField.ID(), text("old"), nil)),
			sp:     sp,
			inputs: FieldInputList{{Field: titleField.ID().Ref(), Value: 1}},
			wantChanged: Fields{
				NewField(titleField.ID(), value.NewMultiple(value.TypeText, nil), nil),
			},
			wantErrs: schema.FieldValidationErrors{
				titleField.ValidationError(schema.ErrInvalidValue, schema.FieldValidationCodeTypeMismatch),
			},
			wantFields: Fields{
				NewField(titleField.ID(), value.NewMultiple(value.TypeText, nil), nil),
				defaultValue,
			},
		},
		{
			name: "parses every referenced group instance and drops the others",
			item: newItem(),
			sp:   sp,
			inputs: FieldInputList{
				{Field: titleField.ID().Ref(), Value: "t"},
				{Field: sectionField.ID().Ref(), Value: []any{ig1.String(), ig2.String()}},
				{Field: subtitleField.ID().Ref(), Value: "s1", Group: &ig1},
				{Key: subtitleField.Key().Ref(), Value: "s2", Group: &ig2},
				{Field: subtitleField.ID().Ref(), Value: "x", Group: &other},
			},
			wantChanged: Fields{
				NewField(titleField.ID(), text("t"), nil),
				NewField(sectionField.ID(), groupsValue(ig1, ig2), nil),
				NewField(subtitleField.ID(), text("s1"), &ig1),
				NewField(subtitleField.ID(), text("s2"), &ig2),
			},
			wantFields: Fields{
				defaultValue,
				NewField(titleField.ID(), text("t"), nil),
				NewField(sectionField.ID(), groupsValue(ig1, ig2), nil),
				NewField(subtitleField.ID(), text("s1"), &ig1),
				NewField(subtitleField.ID(), text("s2"), &ig2),
			},
		},
		{
			name: "group instances referenced by the stored group field are parsed",
			item: newItem(
				NewField(titleField.ID(), text("t"), nil),
				NewField(sectionField.ID(), groupsValue(ig1), nil),
				NewField(subtitleField.ID(), text("old"), &ig1),
			),
			sp:          sp,
			inputs:      FieldInputList{{Field: subtitleField.ID().Ref(), Value: "new", Group: &ig1}},
			wantChanged: Fields{NewField(subtitleField.ID(), text("new"), &ig1)},
			wantFields: Fields{
				NewField(titleField.ID(), text("t"), nil),
				NewField(sectionField.ID(), groupsValue(ig1), nil),
				NewField(subtitleField.ID(), text("new"), &ig1),
				defaultValue,
			},
		},
		{
			name: "reports unknown, mismatched and missing required fields inside group instances",
			item: newItem(),
			sp:   sp,
			inputs: FieldInputList{
				{Field: titleField.ID().Ref(), Value: "t"},
				{Field: sectionField.ID().Ref(), Value: []any{ig1.String(), ig2.String(), other.String()}},
				{Field: subtitleField.ID().Ref(), Value: "s1", Group: &ig1},
				{Key: unknownKey.Ref(), Value: "x", Group: &ig1},
				{Field: subtitleField.ID().Ref(), Value: 1, Group: &other},
				// ig2 has no subtitle
			},
			wantChanged: Fields{
				NewField(titleField.ID(), text("t"), nil),
				NewField(sectionField.ID(), groupsValue(ig1, ig2, other), nil),
				NewField(subtitleField.ID(), text("s1"), &ig1),
				NewField(subtitleField.ID(), value.NewMultiple(value.TypeText, nil), &other),
			},
			wantErrs: schema.FieldValidationErrors{
				{Key: unknownKey.Ref(), Group: &ig1, Code: schema.FieldValidationCodeNotFound, Detail: schema.ErrFieldNotFound},
				subtitleField.ValidationError(schema.ErrInvalidValue, schema.FieldValidationCodeTypeMismatch).WithGroup(&other),
				subtitleField.ValidationError(schema.ErrValueRequired, schema.FieldValidationCodeRequired).WithGroup(&ig2),
			},
			wantFields: Fields{
				defaultValue,
				NewField(titleField.ID(), text("t"), nil),
				NewField(sectionField.ID(), groupsValue(ig1, ig2, other), nil),
				NewField(subtitleField.ID(), text("s1"), &ig1),
				NewField(subtitleField.ID(), value.NewMultiple(value.TypeText, nil), &other),
			},
		},
		{
			name: "stored group-typed field unknown to the schema is skipped",
			item: newItem(
				NewField(titleField.ID(), text("t"), nil),
				NewField(unknownFieldID, groupsValue(ig1), nil),
			),
			sp:     sp,
			inputs: FieldInputList{{Field: subtitleField.ID().Ref(), Value: "s", Group: &ig1}},
			wantFields: Fields{
				NewField(titleField.ID(), text("t"), nil),
				NewField(unknownFieldID, groupsValue(ig1), nil),
				defaultValue,
			},
		},
		{
			name: "metadata item parses top-level inputs and ignores group inputs",
			item: newMetaItem(),
			sp:   msp,
			inputs: FieldInputList{
				{Field: metaField.ID().Ref(), Value: "draft"},
				{Field: subtitleField.ID().Ref(), Value: "s", Group: &ig1},
			},
			wantChanged: Fields{NewField(metaField.ID(), text("draft"), nil)},
			wantFields: Fields{
				NewField(metaDefaultField.ID(), text("meta default"), nil),
				NewField(metaField.ID(), text("draft"), nil),
			},
		},
		{
			name: "metadata item is validated against the meta schema",
			item: newMetaItem(),
			sp:   msp,
			// a content schema field is unknown to the meta schema
			inputs: FieldInputList{{Field: titleField.ID().Ref(), Value: "t"}},
			wantErrs: schema.FieldValidationErrors{
				metaField.ValidationError(schema.ErrValueRequired, schema.FieldValidationCodeRequired),
			},
			wantFields: Fields{NewField(metaDefaultField.ID(), text("meta default"), nil)},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			it := tt.item()
			changed, errs, err := it.ApplyInput(tt.inputs, tt.sp)
			if tt.wantErr != nil {
				assert.ErrorIs(t, err, tt.wantErr)
				assert.Nil(t, changed)
				assert.Nil(t, errs)
				return
			}
			require.NoError(t, err)
			assert.ElementsMatch(t, tt.wantChanged, changed)
			assert.ElementsMatch(t, tt.wantErrs, errs)
			assert.ElementsMatch(t, tt.wantFields, it.Fields())
		})
	}
}

func TestParseInputs(t *testing.T) {
	t.Parallel()

	maxLength := 3
	titleField := buildValidationTestField("title", schema.NewText(&maxLength).TypeProperty(), true)
	tagsField := buildValidationTestFieldMultiple("tags", schema.NewText(&maxLength).TypeProperty(), false)
	sectionField := buildValidationTestField("section", schema.NewGroup(id.NewGroupID()).TypeProperty(), false)
	s := buildValidationTestSchema(titleField, tagsField, sectionField)

	ig := id.NewItemGroupID()
	unknownKey := id.NewKey("unknown")
	unknownFieldID := id.NewFieldID()

	text := func(v ...string) *value.Multiple { return value.NewMultiple(value.TypeText, lo.ToAnySlice(v)) }
	empty := value.NewMultiple(value.TypeText, nil)

	tests := []struct {
		name       string
		inputs     FieldInputList
		wantFields Fields
		wantErrs   schema.FieldValidationErrors
	}{
		{
			name: "no inputs",
		},
		{
			name:       "input by field id",
			inputs:     FieldInputList{{Field: titleField.ID().Ref(), Value: "a"}},
			wantFields: Fields{NewField(titleField.ID(), text("a"), nil)},
		},
		{
			name:       "input by key",
			inputs:     FieldInputList{{Key: titleField.Key().Ref(), Value: "a"}},
			wantFields: Fields{NewField(titleField.ID(), text("a"), nil)},
		},
		{
			name:       "field id takes precedence over key",
			inputs:     FieldInputList{{Field: titleField.ID().Ref(), Key: tagsField.Key().Ref(), Value: "a"}},
			wantFields: Fields{NewField(titleField.ID(), text("a"), nil)},
		},
		{
			name:       "group is kept on the parsed field",
			inputs:     FieldInputList{{Field: titleField.ID().Ref(), Value: "a", Group: &ig}},
			wantFields: Fields{NewField(titleField.ID(), text("a"), &ig)},
		},
		{
			name:       "nil value gives an empty field without errors",
			inputs:     FieldInputList{{Field: titleField.ID().Ref(), Value: nil}},
			wantFields: Fields{NewField(titleField.ID(), empty, nil)},
		},
		{
			name:       "empty string is a valid text value",
			inputs:     FieldInputList{{Field: titleField.ID().Ref(), Value: ""}},
			wantFields: Fields{NewField(titleField.ID(), text(""), nil)},
		},
		{
			name:       "empty string that can't be converted is dropped without errors",
			inputs:     FieldInputList{{Field: sectionField.ID().Ref(), Value: ""}},
			wantFields: Fields{NewField(sectionField.ID(), value.NewMultiple(value.TypeGroup, nil), nil)},
		},
		{
			name:       "multiple field with a list",
			inputs:     FieldInputList{{Field: tagsField.ID().Ref(), Value: []any{"a", "b"}}},
			wantFields: Fields{NewField(tagsField.ID(), text("a", "b"), nil)},
		},
		{
			name: "unknown field id",
			inputs: FieldInputList{
				{Field: unknownFieldID.Ref(), Value: "a"},
			},
			wantErrs: schema.FieldValidationErrors{
				{Field: unknownFieldID.Ref(), Code: schema.FieldValidationCodeNotFound, Detail: schema.ErrFieldNotFound},
			},
		},
		{
			name: "unknown key in a group",
			inputs: FieldInputList{
				{Key: unknownKey.Ref(), Value: "a", Group: &ig},
			},
			wantErrs: schema.FieldValidationErrors{
				{Key: unknownKey.Ref(), Group: &ig, Code: schema.FieldValidationCodeNotFound, Detail: schema.ErrFieldNotFound},
			},
		},
		{
			name:     "input without field id or key",
			inputs:   FieldInputList{{Value: "a"}},
			wantErrs: schema.FieldValidationErrors{{Code: schema.FieldValidationCodeNotFound, Detail: schema.ErrFieldNotFound}},
		},
		{
			name:       "type mismatch gives an empty field and an error",
			inputs:     FieldInputList{{Field: titleField.ID().Ref(), Value: 1}},
			wantFields: Fields{NewField(titleField.ID(), empty, nil)},
			wantErrs: schema.FieldValidationErrors{
				titleField.ValidationError(schema.ErrInvalidValue, schema.FieldValidationCodeTypeMismatch),
			},
		},
		{
			name:       "list sent to a single field",
			inputs:     FieldInputList{{Field: titleField.ID().Ref(), Value: []any{"a"}}},
			wantFields: Fields{NewField(titleField.ID(), empty, nil)},
			wantErrs: schema.FieldValidationErrors{
				titleField.ValidationError(schema.ErrFieldValueMultiple, schema.FieldValidationCodeTypeMismatch),
			},
		},
		{
			name:       "single value sent to a multiple field",
			inputs:     FieldInputList{{Field: tagsField.ID().Ref(), Value: "a"}},
			wantFields: Fields{NewField(tagsField.ID(), empty, nil)},
			wantErrs: schema.FieldValidationErrors{
				tagsField.ValidationError(schema.ErrFieldValueNotMultiple, schema.FieldValidationCodeTypeMismatch),
			},
		},
		{
			name:       "multiple field keeps the convertible elements and reports the others by index",
			inputs:     FieldInputList{{Field: tagsField.ID().Ref(), Value: []any{"a", 1, "b", 2}}},
			wantFields: Fields{NewField(tagsField.ID(), text("a", "b"), nil)},
			wantErrs: schema.FieldValidationErrors{
				tagsField.ValidationError(schema.ErrInvalidValue, schema.FieldValidationCodeTypeMismatch).WithIndex(1),
				tagsField.ValidationError(schema.ErrInvalidValue, schema.FieldValidationCodeTypeMismatch).WithIndex(3),
			},
		},
		{
			name:       "constraint violation keeps the value",
			inputs:     FieldInputList{{Field: titleField.ID().Ref(), Value: "abcd"}},
			wantFields: Fields{NewField(titleField.ID(), text("abcd"), nil)},
			wantErrs: schema.FieldValidationErrors{
				titleField.ValidationError(schema.ErrStringFieldMaxLengthExceeded(maxLength), schema.FieldValidationCodeConstraint),
			},
		},
		{
			name:       "constraint violation in a multiple field is reported by the raw index",
			inputs:     FieldInputList{{Field: tagsField.ID().Ref(), Value: []any{1, "a", "abcd"}, Group: &ig}},
			wantFields: Fields{NewField(tagsField.ID(), text("a", "abcd"), &ig)},
			wantErrs: schema.FieldValidationErrors{
				tagsField.ValidationError(schema.ErrInvalidValue, schema.FieldValidationCodeTypeMismatch).WithIndex(0).WithGroup(&ig),
				tagsField.ValidationError(schema.ErrStringFieldMaxLengthExceeded(maxLength), schema.FieldValidationCodeConstraint).WithIndex(2).WithGroup(&ig),
			},
		},
		{
			name: "every input is parsed even after an error",
			inputs: FieldInputList{
				{Key: unknownKey.Ref(), Value: "a"},
				{Field: titleField.ID().Ref(), Value: 1},
				{Field: tagsField.ID().Ref(), Value: []any{"a"}},
			},
			wantFields: Fields{
				NewField(titleField.ID(), empty, nil),
				NewField(tagsField.ID(), text("a"), nil),
			},
			wantErrs: schema.FieldValidationErrors{
				{Key: unknownKey.Ref(), Code: schema.FieldValidationCodeNotFound, Detail: schema.ErrFieldNotFound},
				titleField.ValidationError(schema.ErrInvalidValue, schema.FieldValidationCodeTypeMismatch),
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			fields, errs := parseInputs(tt.inputs, s)
			assert.Equal(t, tt.wantFields, fields)
			assert.Equal(t, tt.wantErrs, errs)
		})
	}
}
