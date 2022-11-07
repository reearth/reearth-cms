package item

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/util"
	"github.com/stretchr/testify/assert"
)

func TestItem_UpdateFields(t *testing.T) {
	f := NewField(id.NewFieldID(), value.Must(value.TypeText, "test"))
	now := time.Now()
	defer util.MockNow(now)()

	tests := []struct {
		name  string
		input []*Field
		want  *Item
	}{
		{
			name:  "should update fields",
			input: []*Field{f},
			want: &Item{
				fields:    []*Field{f},
				timestamp: now,
			},
		},
		{
			name:  "nil fields",
			input: nil,
			want:  &Item{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			i := &Item{}
			i.UpdateFields(tt.input)
			assert.Equal(t, tt.want, i)
		})
	}
}

func TestItem_Filtered(t *testing.T) {
	sfid1 := id.NewFieldID()
	sfid2 := id.NewFieldID()
	sfid3 := id.NewFieldID()
	sfid4 := id.NewFieldID()
	f1 := &Field{schemaFieldID: sfid1}
	f2 := &Field{schemaFieldID: sfid2}
	f3 := &Field{schemaFieldID: sfid3}
	f4 := &Field{schemaFieldID: sfid4}

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
