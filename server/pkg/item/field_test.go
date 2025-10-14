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
		tt := tt
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
