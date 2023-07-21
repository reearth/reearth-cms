package item

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestCompareFields(t *testing.T) {
	fId := id.NewFieldID()
	fId2 := id.NewFieldID()
	fId3 := id.NewFieldID()
	fId4 := id.NewFieldID()

	type args struct {
		n []*Field
		o []*Field
	}
	tests := []struct {
		name string
		args args
		want []FieldChange
	}{
		{
			name: "no change",
			args: args{
				n: []*Field{
					NewField(fId, value.TypeText.Value("value1").AsMultiple()),
					NewField(fId2, value.TypeNumber.Value("value1").AsMultiple()),
				},
				o: []*Field{
					NewField(fId, value.TypeText.Value("value1").AsMultiple()),
					NewField(fId2, value.TypeNumber.Value("value1").AsMultiple()),
				},
			},
			want: nil, // No changes expected
		},
			{
			name: "add",
			args: args{
				n: []*Field{
					NewField(fId, value.New(value.TypeText, "value1").AsMultiple()),
					NewField(fId2, value.New(value.TypeText, "new field").AsMultiple()),
				},
				o: []*Field{
					NewField(fId, value.New(value.TypeText, "value1").AsMultiple()),
				},
			},
			want: []FieldChange{
				{
					ID:            &fId2,
					Type:          Add,
					CurrentValue:  value.New(value.TypeText, "new field").AsMultiple(),
					PreviousValue: nil,
				},
			},
		},
		{
			name: "update",
			args: args{
				n: []*Field{
					NewField(fId, value.New(value.TypeText, "value2").AsMultiple()),
					NewField(fId2, value.New(value.TypeNumber, 42).AsMultiple()),
				},
				o: []*Field{
					NewField(fId, value.New(value.TypeText, "value1").AsMultiple()),
					NewField(fId2, value.New(value.TypeNumber, 42).AsMultiple()),
				},
			},
			want: []FieldChange{
				{
					ID:            &fId,
					Type:          Update,
					PreviousValue: value.New(value.TypeText, "value1").AsMultiple(),
					CurrentValue:  value.New(value.TypeText, "value2").AsMultiple(),
				},
			},
		},
		{
			name: "delete",
			args: args{
				n: []*Field{
					NewField(fId, value.New(value.TypeText, "value1").AsMultiple()),
				},
				o: []*Field{
					NewField(fId, value.New(value.TypeText, "value1").AsMultiple()),
					NewField(fId2, value.New(value.TypeText, "to be deleted").AsMultiple()),
				},
			},
			want: []FieldChange{
				{
					ID:            &fId2,
					Type:          Delete,
					CurrentValue:  nil,
					PreviousValue: value.New(value.TypeText, "to be deleted").AsMultiple(),
				},
			},
		},
		{
			name: "multiple changes",
			args: args{
				n: []*Field{
					NewField(fId, value.New(value.TypeText, "value1").AsMultiple()),
					NewField(fId2, value.New(value.TypeNumber, 42).AsMultiple()),
					NewField(fId3, value.New(value.TypeText, "new field").AsMultiple()),
				},
				o: []*Field{
					NewField(fId, value.New(value.TypeText, "old value").AsMultiple()),
					NewField(fId2, value.New(value.TypeNumber, 42).AsMultiple()),
					NewField(fId4, value.New(value.TypeText, "to be deleted").AsMultiple()),
				},
			},
			want: []FieldChange{
				{
					ID:            &fId,
					Type:          Update,
					CurrentValue:  value.New(value.TypeText, "value1").AsMultiple(),
					PreviousValue: value.New(value.TypeText, "old value").AsMultiple(),
				}, 
				{
					ID:            &fId4,
					Type:          Delete,
					CurrentValue:  nil,
					PreviousValue: value.New(value.TypeText, "to be deleted").AsMultiple(),
				},
				{
					ID:            &fId3,
					Type:          Add,
					CurrentValue:  value.New(value.TypeText, "new field").AsMultiple(),
					PreviousValue: nil,
				},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, CompareFields(tt.args.n, tt.args.o))
		})
	}
}
