package schema

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestField_ID(t *testing.T) {
	id := id.NewFieldID()
	assert.Equal(t, id, (&Field{id: id}).ID())
}

func TestField_TypeProperty(t *testing.T) {
	tp := &TypeProperty{}
	assert.Same(t, tp, (&Field{typeProperty: tp}).TypeProperty())
}

func TestField_Type(t *testing.T) {
	assert.Equal(t, value.TypeText, (&Field{typeProperty: &TypeProperty{t: value.TypeText}}).Type())
}

func TestField_CreatedAt(t *testing.T) {
	id := id.NewFieldID()
	assert.Equal(t, id.Timestamp(), (&Field{id: id}).CreatedAt())
}

func TestField_UpdatedAt(t *testing.T) {
	now := time.Now()
	fId := NewFieldID()
	tests := []struct {
		name  string
		field Field
		want  time.Time
	}{
		{
			name: "success",
			field: Field{
				updatedAt: now,
			},
			want: now,
		},
		{
			name: "success",
			field: Field{
				id: fId,
			},
			want: fId.Timestamp(),
		},
	}
	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tc.want, tc.field.UpdatedAt())
		})
	}
}

func TestField_Clone(t *testing.T) {
	s := &Field{
		id:           NewFieldID(),
		name:         "a",
		description:  "b",
		key:          key.Random(),
		unique:       true,
		multiple:     true,
		required:     true,
		typeProperty: NewText(nil).TypeProperty(),
		defaultValue: value.TypeText.Value("aa"),
		updatedAt:    time.Now(),
	}
	c := s.Clone()
	assert.Equal(t, s, c)
	assert.NotSame(t, s, c)

	s = nil
	c = s.Clone()
	assert.Nil(t, c)
}

func TestField_SetRequired(t *testing.T) {
	f := &Field{required: false}
	f.SetRequired(true)
	assert.Equal(t, &Field{required: true}, f)
	assert.Equal(t, true, f.Required())
}

func TestField_SetUnique(t *testing.T) {
	f := &Field{unique: false}
	f.SetUnique(true)
	assert.Equal(t, &Field{unique: true}, f)
	assert.Equal(t, true, f.Unique())
}

func TestField_SetMultiple(t *testing.T) {
	f := &Field{multiple: false}
	f.SetMultiple(true)
	assert.Equal(t, &Field{multiple: true}, f)
	assert.Equal(t, true, f.Multiple())
}

func TestField_SetName(t *testing.T) {
	f := &Field{name: ""}
	f.SetName("a")
	assert.Equal(t, &Field{name: "a"}, f)
	assert.Equal(t, "a", f.Name())
}

func TestField_SetDescription(t *testing.T) {
	f := &Field{description: ""}
	f.SetDescription("a")
	assert.Equal(t, &Field{description: "a"}, f)
	assert.Equal(t, "a", f.Description())
}

func TestField_SetKey(t *testing.T) {
	f := &Field{}
	k := key.Random()
	f.SetKey(k)
	assert.Equal(t, &Field{key: k}, f)
	assert.Equal(t, k, f.Key())
}
