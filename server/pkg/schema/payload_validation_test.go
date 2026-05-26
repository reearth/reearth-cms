package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func buildTestField(key string, tp *TypeProperty, required bool) *Field {
	k := id.NewKey(key)
	return NewField(tp).
		NewID().
		Key(k).
		Name(key).
		Required(required).
		MustBuild()
}

func buildTestSchema(fields ...*Field) *Schema {
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	return New().
		NewID().
		Workspace(wid).
		Project(pid).
		Fields(fields).
		MustBuild()
}

func TestSchema_ValidatePayload_UnknownKeysIgnored(t *testing.T) {
	t.Parallel()

	s := buildTestSchema(
		buildTestField("title", NewText(nil).TypeProperty(), false),
	)

	errs := s.ValidatePayload(map[string]any{
		"title":   "hello",
		"unknown": "ignored",
	})

	assert.Empty(t, errs)
}

func TestSchema_ValidatePayload_MissingRequiredField(t *testing.T) {
	t.Parallel()

	s := buildTestSchema(
		buildTestField("title", NewText(nil).TypeProperty(), true),
	)

	errs := s.ValidatePayload(map[string]any{})

	assert.Len(t, errs, 1)
	assert.Equal(t, "title", errs[0].Field)
	assert.Equal(t, FieldValidationCodeRequired, errs[0].Code)
}

func TestSchema_ValidatePayload_EmptyStringRequiredField(t *testing.T) {
	t.Parallel()

	s := buildTestSchema(
		buildTestField("title", NewText(nil).TypeProperty(), true),
	)

	errs := s.ValidatePayload(map[string]any{"title": ""})

	assert.Len(t, errs, 1)
	assert.Equal(t, FieldValidationCodeRequired, errs[0].Code)
}

func TestSchema_ValidatePayload_ValidPayloadPassesThrough(t *testing.T) {
	t.Parallel()

	intField, _ := NewInteger(nil, nil)
	numField, _ := NewNumber(nil, nil)

	s := buildTestSchema(
		buildTestField("title", NewText(nil).TypeProperty(), true),
		buildTestField("count", intField.TypeProperty(), false),
		buildTestField("score", numField.TypeProperty(), false),
	)

	errs := s.ValidatePayload(map[string]any{
		"title": "hello",
		"count": float64(5),
		"score": float64(9.5),
	})

	assert.Empty(t, errs)
}

func TestSchema_ValidatePayload_TextMaxLengthConstraint(t *testing.T) {
	t.Parallel()

	s := buildTestSchema(
		buildTestField("bio", NewText(lo.ToPtr(10)).TypeProperty(), false),
	)

	errs := s.ValidatePayload(map[string]any{"bio": "this string is way too long"})

	assert.Len(t, errs, 1)
	assert.Equal(t, "bio", errs[0].Field)
	assert.Equal(t, FieldValidationCodeConstraint, errs[0].Code)
}

func TestSchema_ValidatePayload_IntegerMinMaxConstraint(t *testing.T) {
	t.Parallel()

	intField, _ := NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	s := buildTestSchema(
		buildTestField("age", intField.TypeProperty(), false),
	)

	t.Run("below min", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidatePayload(map[string]any{"age": float64(0)})
		assert.Len(t, errs, 1)
		assert.Equal(t, FieldValidationCodeConstraint, errs[0].Code)
	})

	t.Run("above max", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidatePayload(map[string]any{"age": float64(101)})
		assert.Len(t, errs, 1)
		assert.Equal(t, FieldValidationCodeConstraint, errs[0].Code)
	})

	t.Run("within range", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidatePayload(map[string]any{"age": float64(50)})
		assert.Empty(t, errs)
	})
}

func TestSchema_ValidatePayload_NumberMinMaxConstraint(t *testing.T) {
	t.Parallel()

	numField, _ := NewNumber(lo.ToPtr(0.0), lo.ToPtr(1.0))
	s := buildTestSchema(
		buildTestField("ratio", numField.TypeProperty(), false),
	)

	t.Run("below min", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidatePayload(map[string]any{"ratio": float64(-0.1)})
		assert.Len(t, errs, 1)
		assert.Equal(t, FieldValidationCodeConstraint, errs[0].Code)
	})

	t.Run("above max", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidatePayload(map[string]any{"ratio": float64(1.1)})
		assert.Len(t, errs, 1)
		assert.Equal(t, FieldValidationCodeConstraint, errs[0].Code)
	})

	t.Run("within range", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidatePayload(map[string]any{"ratio": float64(0.5)})
		assert.Empty(t, errs)
	})
}

func TestSchema_ValidatePayload_TypeMismatch(t *testing.T) {
	t.Parallel()

	intField, _ := NewInteger(nil, nil)
	s := buildTestSchema(
		buildTestField("count", intField.TypeProperty(), false),
	)

	errs := s.ValidatePayload(map[string]any{"count": map[string]any{"nested": "object"}})

	assert.Len(t, errs, 1)
	assert.Equal(t, FieldValidationCodeTypeMismatch, errs[0].Code)
}

func TestSchema_ValidatePayload_OutOfScopeFieldsSkipped(t *testing.T) {
	t.Parallel()

	s := buildTestSchema(
		buildTestField("attachment", NewAsset().TypeProperty(), true),
	)

	errs := s.ValidatePayload(map[string]any{})

	assert.Empty(t, errs)
}

func TestSchema_ValidatePayload_MultipleErrors(t *testing.T) {
	t.Parallel()

	intField, _ := NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(10)))
	s := buildTestSchema(
		buildTestField("name", NewText(nil).TypeProperty(), true),
		buildTestField("age", intField.TypeProperty(), false),
	)

	errs := s.ValidatePayload(map[string]any{
		"age": float64(999),
	})

	assert.Len(t, errs, 2)
}

func TestSchema_ValidatePayload_NilSchema(t *testing.T) {
	t.Parallel()

	var s *Schema
	errs := s.ValidatePayload(map[string]any{"any": "value"})
	assert.Nil(t, errs)
}

func TestSchema_ValidatePayload_OptionalFieldAbsent(t *testing.T) {
	t.Parallel()

	s := buildTestSchema(
		buildTestField("notes", NewText(nil).TypeProperty(), false),
	)

	errs := s.ValidatePayload(map[string]any{})
	assert.Empty(t, errs)
}

func TestSchema_ValidatePayload_SelectConstraint(t *testing.T) {
	t.Parallel()

	s := buildTestSchema(
		buildTestField("status", NewSelect([]string{"open", "closed"}).TypeProperty(), false),
	)

	t.Run("valid value", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidatePayload(map[string]any{"status": "open"})
		assert.Empty(t, errs)
	})

	t.Run("invalid value", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidatePayload(map[string]any{"status": "pending"})
		assert.Len(t, errs, 1)
		assert.Equal(t, "status", errs[0].Field)
		assert.Equal(t, FieldValidationCodeConstraint, errs[0].Code)
	})
}
