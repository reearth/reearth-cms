package item

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
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
