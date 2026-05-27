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
	return NewField(tp).NewID().Key(k).Name(key).Required(required).MustBuild()
}

func buildTestFieldMultiple(key string, tp *TypeProperty, required bool) *Field {
	k := id.NewKey(key)
	return NewField(tp).NewID().Key(k).Name(key).Required(required).Multiple(true).MustBuild()
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

// --- gate / edge cases ---

func TestSchema_ValidateFields_NilSchema(t *testing.T) {
	t.Parallel()
	var s *Schema
	assert.Nil(t, s.ValidateFields(map[string]any{"any": "value"}))
}

func TestSchema_ValidateFields_UnknownKeysIgnored(t *testing.T) {
	t.Parallel()
	s := buildTestSchema(buildTestField("title", NewText(nil).TypeProperty(), false))
	assert.Empty(t, s.ValidateFields(map[string]any{"title": "hello", "unknown": "ignored"}))
}

func TestSchema_ValidateFields_OptionalFieldAbsent(t *testing.T) {
	t.Parallel()
	s := buildTestSchema(buildTestField("notes", NewText(nil).TypeProperty(), false))
	assert.Empty(t, s.ValidateFields(map[string]any{}))
}

func TestSchema_ValidateFields_MissingRequiredField(t *testing.T) {
	t.Parallel()
	s := buildTestSchema(buildTestField("title", NewText(nil).TypeProperty(), true))
	errs := s.ValidateFields(map[string]any{})
	assert.Len(t, errs, 1)
	assert.Equal(t, "title", errs[0].Field)
	assert.Equal(t, FieldValidationCodeRequired, errs[0].Code)
}

func TestSchema_ValidateFields_EmptyStringRequiredField(t *testing.T) {
	t.Parallel()
	s := buildTestSchema(buildTestField("title", NewText(nil).TypeProperty(), true))
	errs := s.ValidateFields(map[string]any{"title": ""})
	assert.Len(t, errs, 1)
	assert.Equal(t, FieldValidationCodeRequired, errs[0].Code)
}

func TestSchema_ValidateFields_MultipleErrors(t *testing.T) {
	t.Parallel()
	intField, _ := NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(10)))
	s := buildTestSchema(
		buildTestField("name", NewText(nil).TypeProperty(), true),
		buildTestField("age", intField.TypeProperty(), false),
	)
	errs := s.ValidateFields(map[string]any{"age": float64(999)})
	assert.Len(t, errs, 2)
}

// --- out-of-scope types ---

func TestSchema_ValidateFields_OutOfScopeFieldsSkipped(t *testing.T) {
	t.Parallel()
	s := buildTestSchema(
		buildTestField("attachment", NewAsset().TypeProperty(), true),
		buildTestField("ref", NewReference(id.NewModelID(), id.NewSchemaID(), nil, nil).TypeProperty(), true),
	)
	// Required asset and reference fields must not produce errors — out of scope for phase 1.
	assert.Empty(t, s.ValidateFields(map[string]any{}))
}

// --- Text (maxLength) ---

func TestSchema_ValidateFields_Text(t *testing.T) {
	t.Parallel()
	s := buildTestSchema(buildTestField("bio", NewText(lo.ToPtr(10)).TypeProperty(), false))

	t.Run("within maxLength", func(t *testing.T) {
		t.Parallel()
		assert.Empty(t, s.ValidateFields(map[string]any{"bio": "short"}))
	})
	t.Run("exceeds maxLength", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidateFields(map[string]any{"bio": "this string is way too long"})
		assert.Len(t, errs, 1)
		assert.Equal(t, "bio", errs[0].Field)
		assert.Equal(t, FieldValidationCodeConstraint, errs[0].Code)
	})
	t.Run("type mismatch", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidateFields(map[string]any{"bio": 123})
		assert.Len(t, errs, 1)
		assert.Equal(t, FieldValidationCodeTypeMismatch, errs[0].Code)
	})
}

// --- TextArea (maxLength) ---

func TestSchema_ValidateFields_TextArea(t *testing.T) {
	t.Parallel()
	s := buildTestSchema(buildTestField("body", NewTextArea(lo.ToPtr(5)).TypeProperty(), false))

	t.Run("within maxLength", func(t *testing.T) {
		t.Parallel()
		assert.Empty(t, s.ValidateFields(map[string]any{"body": "hello"}))
	})
	t.Run("exceeds maxLength", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidateFields(map[string]any{"body": "too long string"})
		assert.Len(t, errs, 1)
		assert.Equal(t, FieldValidationCodeConstraint, errs[0].Code)
	})
}

// --- RichText (maxLength) ---

func TestSchema_ValidateFields_RichText(t *testing.T) {
	t.Parallel()
	s := buildTestSchema(buildTestField("content", NewRichText(lo.ToPtr(5)).TypeProperty(), false))

	t.Run("within maxLength", func(t *testing.T) {
		t.Parallel()
		assert.Empty(t, s.ValidateFields(map[string]any{"content": "hello"}))
	})
	t.Run("exceeds maxLength", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidateFields(map[string]any{"content": "too long string"})
		assert.Len(t, errs, 1)
		assert.Equal(t, FieldValidationCodeConstraint, errs[0].Code)
	})
}

// --- MarkdownText (maxLength) ---

func TestSchema_ValidateFields_Markdown(t *testing.T) {
	t.Parallel()
	s := buildTestSchema(buildTestField("md", NewMarkdown(lo.ToPtr(5)).TypeProperty(), false))

	t.Run("within maxLength", func(t *testing.T) {
		t.Parallel()
		assert.Empty(t, s.ValidateFields(map[string]any{"md": "hello"}))
	})
	t.Run("exceeds maxLength", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidateFields(map[string]any{"md": "too long string"})
		assert.Len(t, errs, 1)
		assert.Equal(t, FieldValidationCodeConstraint, errs[0].Code)
	})
}

// --- Integer (min/max) ---

func TestSchema_ValidateFields_Integer(t *testing.T) {
	t.Parallel()
	intField, _ := NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	s := buildTestSchema(buildTestField("age", intField.TypeProperty(), false))

	t.Run("within range", func(t *testing.T) {
		t.Parallel()
		assert.Empty(t, s.ValidateFields(map[string]any{"age": float64(50)}))
	})
	t.Run("below min", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidateFields(map[string]any{"age": float64(0)})
		assert.Len(t, errs, 1)
		assert.Equal(t, "age", errs[0].Field)
		assert.Equal(t, FieldValidationCodeConstraint, errs[0].Code)
	})
	t.Run("above max", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidateFields(map[string]any{"age": float64(101)})
		assert.Len(t, errs, 1)
		assert.Equal(t, FieldValidationCodeConstraint, errs[0].Code)
	})
	t.Run("type mismatch", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidateFields(map[string]any{"age": map[string]any{"bad": "value"}})
		assert.Len(t, errs, 1)
		assert.Equal(t, FieldValidationCodeTypeMismatch, errs[0].Code)
	})
}

// --- Number (min/max) ---

func TestSchema_ValidateFields_Number(t *testing.T) {
	t.Parallel()
	numField, _ := NewNumber(lo.ToPtr(0.0), lo.ToPtr(1.0))
	s := buildTestSchema(buildTestField("ratio", numField.TypeProperty(), false))

	t.Run("within range", func(t *testing.T) {
		t.Parallel()
		assert.Empty(t, s.ValidateFields(map[string]any{"ratio": float64(0.5)}))
	})
	t.Run("below min", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidateFields(map[string]any{"ratio": float64(-0.1)})
		assert.Len(t, errs, 1)
		assert.Equal(t, "ratio", errs[0].Field)
		assert.Equal(t, FieldValidationCodeConstraint, errs[0].Code)
	})
	t.Run("above max", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidateFields(map[string]any{"ratio": float64(1.1)})
		assert.Len(t, errs, 1)
		assert.Equal(t, FieldValidationCodeConstraint, errs[0].Code)
	})
	t.Run("type mismatch", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidateFields(map[string]any{"ratio": map[string]any{"bad": "value"}})
		assert.Len(t, errs, 1)
		assert.Equal(t, FieldValidationCodeTypeMismatch, errs[0].Code)
	})
}

// --- Select (allowed values) ---

func TestSchema_ValidateFields_Select(t *testing.T) {
	t.Parallel()
	s := buildTestSchema(buildTestField("status", NewSelect([]string{"open", "closed"}).TypeProperty(), false))

	t.Run("valid value", func(t *testing.T) {
		t.Parallel()
		assert.Empty(t, s.ValidateFields(map[string]any{"status": "open"}))
	})
	t.Run("invalid value", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidateFields(map[string]any{"status": "pending"})
		assert.Len(t, errs, 1)
		assert.Equal(t, "status", errs[0].Field)
		assert.Equal(t, FieldValidationCodeConstraint, errs[0].Code)
	})
	t.Run("type mismatch", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidateFields(map[string]any{"status": 123})
		assert.Len(t, errs, 1)
		assert.Equal(t, FieldValidationCodeTypeMismatch, errs[0].Code)
	})
}

// --- Bool ---

func TestSchema_ValidateFields_Bool(t *testing.T) {
	t.Parallel()
	s := buildTestSchema(buildTestField("active", NewBool().TypeProperty(), false))

	t.Run("valid true", func(t *testing.T) {
		t.Parallel()
		assert.Empty(t, s.ValidateFields(map[string]any{"active": true}))
	})
	t.Run("valid false", func(t *testing.T) {
		t.Parallel()
		assert.Empty(t, s.ValidateFields(map[string]any{"active": false}))
	})
	t.Run("type mismatch", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidateFields(map[string]any{"active": map[string]any{"bad": "value"}})
		assert.Len(t, errs, 1)
		assert.Equal(t, FieldValidationCodeTypeMismatch, errs[0].Code)
	})
}

// --- Checkbox ---

func TestSchema_ValidateFields_Checkbox(t *testing.T) {
	t.Parallel()
	s := buildTestSchema(buildTestField("agreed", NewCheckbox().TypeProperty(), false))

	t.Run("valid true", func(t *testing.T) {
		t.Parallel()
		assert.Empty(t, s.ValidateFields(map[string]any{"agreed": true}))
	})
	t.Run("type mismatch", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidateFields(map[string]any{"agreed": map[string]any{"bad": "value"}})
		assert.Len(t, errs, 1)
		assert.Equal(t, FieldValidationCodeTypeMismatch, errs[0].Code)
	})
}

// --- DateTime ---

func TestSchema_ValidateFields_DateTime(t *testing.T) {
	t.Parallel()
	s := buildTestSchema(buildTestField("publishedAt", NewDateTime().TypeProperty(), false))

	t.Run("valid RFC3339", func(t *testing.T) {
		t.Parallel()
		assert.Empty(t, s.ValidateFields(map[string]any{"publishedAt": "2024-01-15T10:00:00Z"}))
	})
	t.Run("type mismatch", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidateFields(map[string]any{"publishedAt": map[string]any{"bad": "value"}})
		assert.Len(t, errs, 1)
		assert.Equal(t, FieldValidationCodeTypeMismatch, errs[0].Code)
	})
}

// --- URL ---

func TestSchema_ValidateFields_URL(t *testing.T) {
	t.Parallel()
	s := buildTestSchema(buildTestField("website", NewURL().TypeProperty(), false))

	t.Run("valid URL", func(t *testing.T) {
		t.Parallel()
		assert.Empty(t, s.ValidateFields(map[string]any{"website": "https://example.com"}))
	})
	t.Run("type mismatch", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidateFields(map[string]any{"website": map[string]any{"bad": "value"}})
		assert.Len(t, errs, 1)
		assert.Equal(t, FieldValidationCodeTypeMismatch, errs[0].Code)
	})
}

// --- single vs multiple ---

func TestSchema_ValidateFields_SingleField(t *testing.T) {
	t.Parallel()
	s := buildTestSchema(buildTestField("tag", NewText(nil).TypeProperty(), false))

	t.Run("accepts scalar", func(t *testing.T) {
		t.Parallel()
		assert.Empty(t, s.ValidateFields(map[string]any{"tag": "one"}))
	})
	t.Run("rejects array with multiple values", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidateFields(map[string]any{"tag": []any{"one", "two"}})
		assert.Len(t, errs, 1)
		assert.Equal(t, "tag", errs[0].Field)
		assert.Equal(t, FieldValidationCodeConstraint, errs[0].Code)
	})
}

func TestSchema_ValidateFields_MultipleField(t *testing.T) {
	t.Parallel()
	intField := MustNewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(10)))
	s := buildTestSchema(
		buildTestFieldMultiple("tags", NewText(nil).TypeProperty(), false),
		buildTestFieldMultiple("counts", intField.TypeProperty(), false),
	)

	t.Run("accepts array of valid values", func(t *testing.T) {
		t.Parallel()
		assert.Empty(t, s.ValidateFields(map[string]any{"tags": []any{"one", "two", "three"}}))
	})
	t.Run("accepts scalar as single-item", func(t *testing.T) {
		t.Parallel()
		assert.Empty(t, s.ValidateFields(map[string]any{"tags": "one"}))
	})
	t.Run("reports type mismatch on invalid item in array", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidateFields(map[string]any{"counts": []any{float64(5), map[string]any{"bad": "value"}}})
		assert.Len(t, errs, 1)
		assert.Equal(t, "counts", errs[0].Field)
		assert.Equal(t, FieldValidationCodeTypeMismatch, errs[0].Code)
	})
	t.Run("reports constraint violation on item out of range", func(t *testing.T) {
		t.Parallel()
		errs := s.ValidateFields(map[string]any{"counts": []any{float64(5), float64(999)}})
		assert.Len(t, errs, 1)
		assert.Equal(t, "counts", errs[0].Field)
		assert.Equal(t, FieldValidationCodeConstraint, errs[0].Code)
	})
}

// --- valid payload with all in-scope types ---

func TestSchema_ValidateFields_ValidPayloadPassesThrough(t *testing.T) {
	t.Parallel()

	intField, _ := NewInteger(nil, nil)
	numField, _ := NewNumber(nil, nil)

	s := buildTestSchema(
		buildTestField("title", NewText(nil).TypeProperty(), true),
		buildTestField("body", NewTextArea(nil).TypeProperty(), false),
		buildTestField("content", NewRichText(nil).TypeProperty(), false),
		buildTestField("md", NewMarkdown(nil).TypeProperty(), false),
		buildTestField("count", intField.TypeProperty(), false),
		buildTestField("score", numField.TypeProperty(), false),
		buildTestField("status", NewSelect([]string{"open", "closed"}).TypeProperty(), false),
		buildTestField("active", NewBool().TypeProperty(), false),
		buildTestField("agreed", NewCheckbox().TypeProperty(), false),
		buildTestField("publishedAt", NewDateTime().TypeProperty(), false),
		buildTestField("website", NewURL().TypeProperty(), false),
	)

	errs := s.ValidateFields(map[string]any{
		"title":       "hello",
		"body":        "some text area",
		"content":     "rich content",
		"md":          "## heading",
		"count":       float64(5),
		"score":       float64(9.5),
		"status":      "open",
		"active":      true,
		"agreed":      false,
		"publishedAt": "2024-01-15T10:00:00Z",
		"website":     "https://example.com",
	})

	assert.Empty(t, errs)
}
