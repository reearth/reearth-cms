package item

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestItem_UpdateFields(t *testing.T) {
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
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.target.UpdateFields(tt.input)
			assert.Equal(t, tt.want, tt.target)
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
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()

			got := tc.item.FilterFields(tc.args)
			assert.Equal(tt, tc.want, got)
		})
	}
}

func TestItem_HasField(t *testing.T) {
	f1 := NewField(id.NewFieldID(), value.TypeText.Value("foo").AsMultiple(), nil)
	f2 := NewField(id.NewFieldID(), value.TypeText.Value("hoge").AsMultiple(), nil)
	i1 := New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Fields([]*Field{f1, f2}).Project(id.NewProjectID()).Thread(id.NewThreadID().Ref()).MustBuild()

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
	sf2 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	s1 := schema.New().NewID().Workspace(wid).Project(pid).Fields(schema.FieldList{sf1, sf2}).MustBuild()
	if1 := NewField(sf1.ID(), value.TypeBool.Value(false).AsMultiple(), nil)
	if2 := NewField(sf2.ID(), value.TypeText.Value("test").AsMultiple(), nil)
	i1 := New().NewID().Schema(s1.ID()).Model(id.NewModelID()).Fields([]*Field{if1, if2}).Project(pid).Thread(id.NewThreadID().Ref()).MustBuild()
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

func TestGetFirstGeometryField(t *testing.T) {
	iid := id.NewItemID()
	sid := id.NewSchemaID()
	mid := id.NewModelID()
	uid := accountdomain.NewUserID()
	nid := id.NewIntegrationID()
	tid := id.NewThreadID().Ref()
	pid := id.NewProjectID()
	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString, schema.GeometryObjectSupportedTypePolygon}
	gest := schema.GeometryEditorSupportedTypeList{schema.GeometryEditorSupportedTypePoint, schema.GeometryEditorSupportedTypeLineString, schema.GeometryEditorSupportedTypePolygon}
	sf1 := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().Name("LineString").Key(id.RandomKey()).MustBuild()
	sf2 := schema.NewField(schema.NewText(lo.ToPtr(10)).TypeProperty()).NewID().Name("Name").Key(id.RandomKey()).Multiple(true).MustBuild()
	sf3 := schema.NewField(schema.NewGeometryEditor(gest).TypeProperty()).NewID().Name("Polygon").Key(id.RandomKey()).MustBuild()
	in4, _ := schema.NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	tp4 := in4.TypeProperty()
	sf4 := schema.NewField(tp4).NewID().Name("Age").Key(id.RandomKey()).MustBuild()
	sf5 := schema.NewField(schema.NewBool().TypeProperty()).NewID().Name("IsMarried").Key(id.RandomKey()).MustBuild()
	fi1 := NewField(sf1.ID(), value.TypeGeometryObject.Value("{\"coordinates\":[[139.65439725962517,36.34793305387103],[139.61688622815393,35.910803456352724]],\"type\":\"LineString\"}").AsMultiple(), nil)
	fi2 := NewField(sf2.ID(), value.MultipleFrom(value.TypeText, []*value.Value{value.TypeText.Value("a"), value.TypeText.Value("b"), value.TypeText.Value("c")}), nil)
	fi3 := NewField(sf3.ID(), value.TypeGeometryEditor.Value("{\"coordinates\": [[[138.90306434425662,36.11737907906834],[138.90306434425662,36.33622175736386],[138.67187898370287,36.33622175736386],[138.67187898370287,36.11737907906834],[138.90306434425662,36.11737907906834]]],\"type\": \"Polygon\"}").AsMultiple(), nil)
	fi4 := NewField(sf4.ID(), value.TypeInteger.Value(30).AsMultiple(), nil)
	fi5 := NewField(sf5.ID(), value.TypeBool.Value(true).AsMultiple(), nil)
	i1 := New().
		ID(iid).
		Schema(sid).
		Project(pid).
		Fields([]*Field{fi1, fi2, fi3, fi4, fi5}).
		Model(mid).
		Thread(tid).
		User(uid).
		Integration(nid).
		MustBuild()
	i2 := New().
		ID(iid).
		Schema(sid).
		Project(pid).
		Fields([]*Field{fi1, fi2, fi4, fi5}).
		Model(mid).
		Thread(tid).
		User(uid).
		Integration(nid).
		MustBuild()
	i3 := New().
		ID(iid).
		Schema(sid).
		Project(pid).
		Fields([]*Field{fi2, fi4, fi5}).
		Model(mid).
		Thread(tid).
		User(uid).
		Integration(nid).
		MustBuild()

	// Test with item that has two geometry fields
	geometry1, ok1 := i1.GetFirstGeometryField()
	assert.True(t, ok1)
	assert.NotNil(t, geometry1)

	// Test with item that has one geometry field
	geometry2, ok2 := i2.GetFirstGeometryField()
	assert.True(t, ok2)
	assert.NotNil(t, geometry2)

	// Test with item that has no geometry fields
	geometry3, ok3 := i3.GetFirstGeometryField()
	assert.False(t, ok3)
	assert.Nil(t, geometry3)

	// Test with item that equals nil
	var i4 *Item
	geometry4, ok4 := i4.GetFirstGeometryField()
	assert.False(t, ok4)
	assert.Nil(t, geometry4)
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
