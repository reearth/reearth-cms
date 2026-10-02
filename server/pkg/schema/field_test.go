package schema

import (
	"fmt"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/rerror"
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
		key:          id.RandomKey(),
		unique:       true,
		multiple:     true,
		required:     true,
		typeProperty: NewText(nil).TypeProperty(),
		defaultValue: value.TypeText.Value("aa").AsMultiple(),
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

func TestField_SetOrder(t *testing.T) {
	f := &Field{order: 0}
	f.SetOrder(3)
	assert.Equal(t, &Field{order: 3}, f)
	assert.Equal(t, 3, f.Order())
}

func TestField_SetKey(t *testing.T) {
	f := &Field{}
	k := id.RandomKey()
	assert.NoError(t, f.SetKey(k))
	assert.Equal(t, &Field{key: k}, f)
	assert.Equal(t, k, f.Key())

	assert.Equal(t, &rerror.Error{
		Label: ErrInvalidKey,
		Err:   fmt.Errorf("%s", ""),
	}, f.SetKey(id.NewKey("")))
}

func TestField_SetTypeProperty(t *testing.T) {
	tp := NewText(new(1)).TypeProperty()
	f := &Field{}
	assert.NoError(t, f.SetTypeProperty(tp))
	assert.Equal(t, &Field{typeProperty: tp}, f)

	f = &Field{defaultValue: value.TypeText.Value("aaa").AsMultiple()}
	assert.ErrorContains(t, f.SetTypeProperty(tp), ErrStringFieldMaxLengthExceeded(1).Error())
	assert.Equal(t, &Field{defaultValue: value.TypeText.Value("aaa").AsMultiple()}, f)

	assert.Same(t, ErrInvalidType, f.SetTypeProperty(nil))
	assert.Equal(t, &Field{defaultValue: value.TypeText.Value("aaa").AsMultiple()}, f)
}

func TestField_SetDefaultValue(t *testing.T) {
	f := &Field{typeProperty: NewText(new(1)).TypeProperty()}
	assert.NoError(t, f.SetDefaultValue(value.TypeText.Value("a").AsMultiple()))
	assert.Equal(t, value.TypeText.Value("a").AsMultiple(), f.defaultValue)
	assert.Equal(t, value.TypeText.Value("a").AsMultiple(), f.DefaultValue())

	assert.NoError(t, f.SetDefaultValue(nil))
	assert.Nil(t, f.defaultValue)
	assert.Nil(t, f.DefaultValue())

	assert.ErrorContains(t, f.SetDefaultValue(value.TypeText.Value("aaa").AsMultiple()), ErrStringFieldMaxLengthExceeded(1).Error())
	assert.Nil(t, f.defaultValue)
	assert.Nil(t, f.DefaultValue())
}

func TestField_ParseValue(t *testing.T) {
	t.Parallel()

	maxCount := int64(100)
	single := NewField(MustNewInteger(nil, &maxCount).TypeProperty()).NewID().Key(id.NewKey("count")).MustBuild()
	multiple := NewField(MustNewInteger(nil, &maxCount).TypeProperty()).NewID().Key(id.NewKey("counts")).Multiple(true).MustBuild()

	type wantErr struct {
		code  FieldValidationCode
		index *int
		err   error
	}
	tests := []struct {
		name     string
		field    *Field
		raw      any
		wantVals []any
		wantErrs []wantErr
	}{
		{
			name:     "single valid value",
			field:    single,
			raw:      float64(5),
			wantVals: []any{int64(5)},
		},
		{
			name:     "single value that can't be converted",
			field:    single,
			raw:      "abc",
			wantVals: []any{},
			wantErrs: []wantErr{{code: FieldValidationCodeTypeMismatch, err: ErrInvalidValue}},
		},
		{
			name:     "single value over the max is reported as a constraint violation",
			field:    single,
			raw:      float64(200),
			wantVals: []any{int64(200)},
			wantErrs: []wantErr{{code: FieldValidationCodeConstraint}},
		},
		{
			name:     "list sent to a single-value field",
			field:    single,
			raw:      []any{float64(1)},
			wantVals: []any{},
			wantErrs: []wantErr{{code: FieldValidationCodeTypeMismatch, err: ErrFieldValueMultiple}},
		},
		{
			name:     "nil for a single-value field is no value",
			field:    single,
			raw:      nil,
			wantVals: []any{},
		},
		{
			name:     "scalar sent to a multiple field",
			field:    multiple,
			raw:      float64(1),
			wantVals: []any{},
			wantErrs: []wantErr{{code: FieldValidationCodeTypeMismatch, err: ErrFieldValueNotMultiple}},
		},
		{
			name:     "every problem of a multiple value is reported with its raw index",
			field:    multiple,
			raw:      []any{float64(5), "x", nil, float64(200)},
			wantVals: []any{int64(5), int64(200)},
			wantErrs: []wantErr{
				{code: FieldValidationCodeTypeMismatch, index: new(1), err: ErrInvalidValue},
				{code: FieldValidationCodeConstraint, index: new(3)},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			m, errs := tt.field.ParseValue(tt.raw)
			assert.NotNil(t, m)
			assert.Equal(t, value.NewMultiple(value.TypeInteger, tt.wantVals), m)
			assert.Len(t, errs, len(tt.wantErrs))
			for i, want := range tt.wantErrs {
				if i >= len(errs) {
					break
				}
				assert.Equal(t, want.code, errs[i].Code)
				assert.Equal(t, want.index, errs[i].Index)
				assert.Equal(t, tt.field.ID().Ref(), errs[i].Field)
				if want.err != nil {
					assert.ErrorIs(t, errs[i], want.err)
				}
			}
		})
	}
}

func TestField_Validate(t *testing.T) {
	t.Parallel()

	f := NewField(MustNewInteger(new(int64(50)), new(int64(100))).TypeProperty()).NewID().Key(id.NewKey("counts")).Multiple(true).MustBuild()

	assert.Empty(t, f.Validate(nil))
	assert.Empty(t, f.Validate(value.NewMultiple(value.TypeInteger, []any{51, 52})))

	errs := f.Validate(value.NewMultiple(value.TypeInteger, []any{25, 75, 300}))
	assert.Len(t, errs, 2)
	assert.Equal(t, new(0), errs[0].Index)
	assert.Equal(t, new(2), errs[1].Index)
	assert.Equal(t, ErrIntegerFieldMinExceeded(50).Error(), errs[0].Detail.Error())
	assert.Equal(t, ErrIntegerFieldMaxExceeded(100).Error(), errs[1].Detail.Error())
}
