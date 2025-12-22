package item

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestFields_Map(t *testing.T) {
	fId1 := id.NewFieldID()
	fId2 := id.NewFieldID()
	fId3 := id.NewFieldID()
	fId4 := id.NewFieldID()

	f := Fields{
		NewField(fId1, value.TypeText.Value("value1").AsMultiple(), nil),
		NewField(fId2, value.TypeText.Value("value2").AsMultiple(), nil),
		NewField(fId3, value.TypeText.Value("value3").AsMultiple(), nil),
		NewField(fId4, value.TypeText.Value("value4").AsMultiple(), nil),
	}

	assert.Equal(t, FieldMap{
		fId1: f[0],
		fId2: f[1],
		fId3: f[2],
		fId4: f[3],
	}, f.Map())
}

func TestFields_Field(t *testing.T) {
	fId1 := id.NewFieldID()
	fId2 := id.NewFieldID()
	fId3 := id.NewFieldID()
	fId4 := id.NewFieldID()

	f := Fields{
		NewField(fId1, value.TypeText.Value("value1").AsMultiple(), nil),
		NewField(fId2, value.TypeText.Value("value2").AsMultiple(), nil),
		NewField(fId3, value.TypeText.Value("value3").AsMultiple(), nil),
		NewField(fId4, value.TypeText.Value("value4").AsMultiple(), nil),
	}

	assert.Equal(t, f[0], f.Field(fId1))
}

func TestFields_FieldsByGroup(t *testing.T) {
	fId1 := id.NewFieldID()
	fId2 := id.NewFieldID()
	fId3 := id.NewFieldID()
	fId4 := id.NewFieldID()
	ig := id.NewItemGroupID()
	f := Fields{
		NewField(fId1, value.TypeText.Value("value1").AsMultiple(), ig.Ref()),
		NewField(fId2, value.TypeText.Value("value2").AsMultiple(), ig.Ref()),
		NewField(fId3, value.TypeText.Value("value3").AsMultiple(), id.NewItemGroupID().Ref()),
		NewField(fId4, value.TypeText.Value("value4").AsMultiple(), nil),
	}

	assert.Equal(t, 2, len(f.FieldsByGroup(ig)))
}

func TestFields_Clone(t *testing.T) {
	t.Parallel()

	fId1 := id.NewFieldID()
	fId2 := id.NewFieldID()
	fId3 := id.NewFieldID()
	ig := id.NewItemGroupID()

	tests := []struct {
		name   string
		fields Fields
	}{
		{
			name:   "empty fields",
			fields: Fields{},
		},
		{
			name:   "nil fields",
			fields: nil,
		},
		{
			name: "single field without group",
			fields: Fields{
				NewField(fId1, value.TypeText.Value("value1").AsMultiple(), nil),
			},
		},
		{
			name: "single field with group",
			fields: Fields{
				NewField(fId1, value.TypeText.Value("value1").AsMultiple(), ig.Ref()),
			},
		},
		{
			name: "multiple fields with mixed groups",
			fields: Fields{
				NewField(fId1, value.TypeText.Value("value1").AsMultiple(), ig.Ref()),
				NewField(fId2, value.TypeInteger.Value(42).AsMultiple(), nil),
				NewField(fId3, value.TypeBool.Value(true).AsMultiple(), ig.Ref()),
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			// Act
			cloned := tt.fields.Clone()

			// Assert: same length
			assert.Equal(t, len(tt.fields), len(cloned))

			// Assert: same values
			for i, f := range tt.fields {
				assert.Equal(t, f.FieldID(), cloned[i].FieldID())
				assert.Equal(t, f.Value(), cloned[i].Value())
				assert.Equal(t, f.ItemGroup(), cloned[i].ItemGroup())
			}

			// Assert: different pointers (deep copy)
			for i, f := range tt.fields {
				if f != nil {
					assert.NotSame(t, f, cloned[i])
				}
			}
		})
	}
}

func TestFields_Clone_Independence(t *testing.T) {
	t.Parallel()

	fId1 := id.NewFieldID()
	fId2 := id.NewFieldID()

	original := Fields{
		NewField(fId1, value.TypeText.Value("original").AsMultiple(), nil),
		NewField(fId2, value.TypeInteger.Value(100).AsMultiple(), nil),
	}

	// Clone the fields
	cloned := original.Clone()

	// Modify the cloned slice (append new element)
	newField := NewField(id.NewFieldID(), value.TypeText.Value("new").AsMultiple(), nil)
	cloned = append(cloned, newField)

	// Assert: original is unchanged
	assert.Equal(t, 2, len(original))
	assert.Equal(t, 3, len(cloned))
}
