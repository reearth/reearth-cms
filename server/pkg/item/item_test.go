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
				id:       tt.fields.id,
				schemaID: tt.fields.schemaID,
				fields:   tt.fields.fields,
			}
			i.UpdateFields(tt.input)
			assert.Equal(t, tt.want, i.Fields())
		})
	}
}
