package item

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestMap_ItemsByIDs(t *testing.T) {
	t.Parallel()

	id1 := id.NewItemID()
	id2 := id.NewItemID()
	id3 := id.NewItemID()

	i1 := &Item{id: id1}
	i2 := &Item{id: id2}
	i3 := &Item{id: id3}

	m := Map{id1: i1, id2: i2, id3: i3}

	tests := []struct {
		name string
		m    Map
		ids  IDList
		want List
	}{
		{
			name: "nil map returns nil",
			m:    nil,
			ids:  IDList{id1},
			want: nil,
		},
		{
			name: "nil id list returns empty",
			m:    m,
			ids:  nil,
			want: List{},
		},
		{
			name: "empty id list returns empty",
			m:    m,
			ids:  IDList{},
			want: List{},
		},
		{
			name: "single id found",
			m:    m,
			ids:  IDList{id1},
			want: List{i1},
		},
		{
			name: "single id not found",
			m:    m,
			ids:  IDList{id.NewItemID()},
			want: List{},
		},
		{
			name: "multiple ids all found preserves order",
			m:    m,
			ids:  IDList{id3, id1, id2},
			want: List{i3, i1, i2},
		},
		{
			name: "some ids not in map",
			m:    m,
			ids:  IDList{id1, id.NewItemID(), id2},
			want: List{i1, i2},
		},
		{
			name: "duplicate ids return item twice",
			m:    m,
			ids:  IDList{id1, id1},
			want: List{i1, i1},
		},
		{
			name: "all ids missing",
			m:    m,
			ids:  IDList{id.NewItemID(), id.NewItemID()},
			want: List{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := tt.m.ItemsByIDs(tt.ids)
			assert.Equal(t, tt.want, got)
		})
	}
}
