package item

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/stretchr/testify/assert"
)

func TestItem_UpdateFields(t *testing.T) {
	iid := id.NewItemID()
	sid := id.NewSchemaID()
	f := NewField(id.NewFieldID(), schema.TypeText, "test")
	type fields struct {
		id       ID
		schemaID schema.ID
		fields   []*Field
	}

	tests := []struct {
		name        string
		fields      fields
		input, want []*Field
	}{
		{
			name:  "should update fields",
			input: []*Field{f},
			fields: fields{
				id:       iid,
				schemaID: sid,
				fields:   []*Field{},
			},
			want: []*Field{f},
		},
		{
			name: "nil fields",
			fields: fields{
				id:       iid,
				schemaID: sid,
				fields:   []*Field{},
			},
			input: nil,
			want:  []*Field{},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			i := &Item{
				id:     tt.fields.id,
				schema: tt.fields.schemaID,
				fields: tt.fields.fields,
			}
			i.UpdateFields(tt.input)
			assert.Equal(t, tt.want, i.Fields())
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

			got := tc.item.Filtered(tc.args)
			assert.Equal(tt, tc.want, got)
		})
	}
}
