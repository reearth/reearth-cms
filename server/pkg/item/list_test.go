package item

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
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
