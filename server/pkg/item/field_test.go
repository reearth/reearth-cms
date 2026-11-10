package item

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewField(t *testing.T) {
	fId := id.NewFieldID()
	assert.Nil(t, NewField(fId, nil, nil))
	f := NewField(fId, value.TypeBool.Value(true).AsMultiple(), nil)
	assert.Equal(t, &Field{
		field: fId,
		value: value.TypeBool.Value(true).AsMultiple(),
	}, f)

	assert.Equal(t, value.TypeBool, f.Type())
}

func TestField_Clone(t *testing.T) {
	fid := id.NewFieldID()
	ig := id.NewItemGroupID()
	val := value.NewMultiple(value.TypeText, []any{"test"})

	tests := []struct {
		name  string
		field *Field
	}{
		{
			name:  "nil field",
			field: nil,
		},
		{
			name: "normal field",
			field: &Field{
				field: fid,
				value: val,
				group: &ig,
			},
		},
		{
			name: "field with nil group",
			field: &Field{
				field: fid,
				value: val,
				group: nil,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			cloned := tt.field.Clone()
			assert.Equal(t, tt.field, cloned)
			if tt.field == nil {
				assert.Nil(t, cloned)
				return
			}

			assert.NotSame(t, tt.field, cloned)
			assert.NotSame(t, tt.field.value, cloned.value)
			if tt.field.group == nil {
				assert.Nil(t, cloned.group)
				return
			}
			assert.NotSame(t, tt.field.group, cloned.group)
		})
	}
}

func TestField_IsGeometryField(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		t    value.Type
		want bool
	}{
		{name: "geometry object", t: value.TypeGeometryObject, want: true},
		{name: "geometry editor", t: value.TypeGeometryEditor, want: true},
		{name: "geometry", t: value.TypeGeometry, want: true},
		{name: "text", t: value.TypeText, want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, NewField(id.NewFieldID(), value.NewMultiple(tt.t, nil), nil).IsGeometryField())
		})
	}
}
