package item

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestList_SortByID(t *testing.T) {
	id1 := NewID()
	id2 := NewID()

	list := List{
		&Item{id: id2},
		&Item{id: id1},
	}
	res := list.SortByID()
	assert.Equal(t, List{
		&Item{id: id1},
		&Item{id: id2},
	}, res)
	assert.Equal(t, List{
		&Item{id: id2},
		&Item{id: id1},
	}, list)
}

func TestList_SortByTimestamp(t *testing.T) {
	id1 := NewID()
	id2 := NewID()
	now1 := time.Now()
	now2 := time.Now().Add(time.Second)

	list := List{
		&Item{id: id2, timestamp: now2},
		&Item{id: id1, timestamp: now1},
	}
	res := list.SortByTimestamp()
	assert.Equal(t, List{
		&Item{id: id1, timestamp: now1},
		&Item{id: id2, timestamp: now2},
	}, res)
	assert.Equal(t, List{
		&Item{id: id2, timestamp: now2},
		&Item{id: id1, timestamp: now1},
	}, list)
}

func TestList_Filtered(t *testing.T) {
	sfid1 := id.NewFieldID()
	sfid2 := id.NewFieldID()
	sfid3 := id.NewFieldID()
	sfid4 := id.NewFieldID()
	f1 := &Field{schemaFieldID: sfid1}
	f2 := &Field{schemaFieldID: sfid2}
	f3 := &Field{schemaFieldID: sfid3}
	f4 := &Field{schemaFieldID: sfid4}
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

func TestList_ItemsBySchemaField(t *testing.T) {
	sid := id.NewSchemaID()
	pid := id.NewProjectID()
	mid := id.NewModelID()
	f1 := NewField(id.NewFieldID(), value.Must(value.TypeText, "foo"))
	f2 := NewField(id.NewFieldID(), value.Must(value.TypeText, "hoge"))
	f3 := NewField(id.NewFieldID(), value.Must(value.TypeBool, true))
	i1 := New().NewID().Schema(sid).Model(mid).Fields([]*Field{f1, f2}).Project(pid).MustBuild()
	i2 := New().NewID().Schema(sid).Model(mid).Fields([]*Field{f2, f3}).Project(pid).MustBuild()
	i3 := New().NewID().Schema(sid).Model(mid).Fields([]*Field{f1}).Project(pid).MustBuild()
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
				fid:   f1.SchemaFieldID(),
				value: f1.Value(),
			},
			wantCount: 2,
		},
		{
			name: "must find 1",
			l:    List{i1, i2, i3},
			args: args{
				fid:   f3.SchemaFieldID(),
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
			assert.Equal(t, tt.wantCount, len(tt.l.ItemsBySchemaField(tt.args.fid, tt.args.value)))
		})
	}
}
