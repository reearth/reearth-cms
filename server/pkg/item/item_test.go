package item

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/util"
	"github.com/stretchr/testify/assert"
)

func TestItem_UpdateFields(t *testing.T) {
	f := NewField(id.NewFieldID(), schema.TypeText, "test")
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

func TestItem_HasField(t *testing.T) {
	f1 := NewField(id.NewFieldID(), schema.TypeText, "foo")
	f2 := NewField(id.NewFieldID(), schema.TypeText, "hoge")
	i1 := New().NewID().Schema(id.NewSchemaID()).Model(id.NewModelID()).Fields([]*Field{f1, f2}).Project(id.NewProjectID()).MustBuild()

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
				fid:   f1.SchemaFieldID(),
				value: f1.Value(),
			},
			item: i1,
			want: true,
		},
		{
			name: "false: no existed value",
			args: args{
				fid:   f1.SchemaFieldID(),
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
