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
	return New().NewID().Workspace(wid).Project(pid).Fields(fields).MustBuild()
}

func TestSchema_ValidateFields(t *testing.T) {
	t.Parallel()

	intField, _ := NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	numField, _ := NewNumber(lo.ToPtr(0.0), lo.ToPtr(1.0))

	s := buildTestSchema(
		buildTestField("title", NewText(nil).TypeProperty(), true),
		buildTestField("bio", NewText(lo.ToPtr(10)).TypeProperty(), false),
		buildTestField("summary", NewTextArea(lo.ToPtr(10)).TypeProperty(), false),
		buildTestField("content", NewRichText(lo.ToPtr(10)).TypeProperty(), false),
		buildTestField("notes", NewMarkdown(lo.ToPtr(10)).TypeProperty(), false),
		buildTestField("count", intField.TypeProperty(), false),
		buildTestField("score", numField.TypeProperty(), false),
		buildTestField("status", NewSelect([]string{"open", "closed"}).TypeProperty(), false),
		buildTestField("active", NewBool().TypeProperty(), false),
		buildTestField("agreed", NewCheckbox().TypeProperty(), false),
		buildTestField("publishedAt", NewDateTime().TypeProperty(), false),
		buildTestField("website", NewURL().TypeProperty(), false),
		buildTestField("tag", NewText(nil).TypeProperty(), false),
		buildTestFieldMultiple("tags", NewText(nil).TypeProperty(), false),
		buildTestFieldMultiple("counts", intField.TypeProperty(), false),
		// out of scope — skipped even when required
		buildTestField("attachment", NewAsset().TypeProperty(), true),
		buildTestField("ref", NewReference(id.NewModelID(), id.NewSchemaID(), nil, nil).TypeProperty(), true),
	)

	tests := []struct {
		name      string
		schema    *Schema
		body      map[string]any
		wantCodes map[string]FieldValidationCode
	}{
		{
			name:   "nil schema returns nil",
			schema: nil,
			body:   map[string]any{"any": "value"},
		},
		{
			name:   "valid payload with all field types passes",
			schema: s,
			body: map[string]any{
				"title": "hello", "bio": "short", "summary": "short",
				"content": "short", "notes": "short",
				"count": float64(50), "score": float64(0.5), "status": "open",
				"active": true, "agreed": false,
				"publishedAt": "2024-01-15T10:00:00Z", "website": "https://example.com",
				"tag": "one", "tags": []any{"a", "b"}, "counts": []any{float64(1), float64(5)},
				"unknown": "ignored",
			},
		},
		// required
		{
			name:      "missing required field",
			schema:    s,
			body:      map[string]any{},
			wantCodes: map[string]FieldValidationCode{"title": FieldValidationCodeRequired},
		},
		{
			name:      "empty string treated as missing required",
			schema:    s,
			body:      map[string]any{"title": ""},
			wantCodes: map[string]FieldValidationCode{"title": FieldValidationCodeRequired},
		},
		{
			name:   "out-of-scope required fields are skipped",
			schema: s,
			body:   map[string]any{"title": "hello"},
		},
		{
			name:   "unknown keys silently ignored",
			schema: s,
			body:   map[string]any{"title": "hello", "unknown": "ignored"},
		},
		// maxLength constraints
		{
			name:      "text exceeds maxLength",
			schema:    s,
			body:      map[string]any{"title": "hello", "bio": "way too long!!"},
			wantCodes: map[string]FieldValidationCode{"bio": FieldValidationCodeConstraint},
		},
		{
			name:      "textarea exceeds maxLength",
			schema:    s,
			body:      map[string]any{"title": "hello", "summary": "way too long!!"},
			wantCodes: map[string]FieldValidationCode{"summary": FieldValidationCodeConstraint},
		},
		{
			name:      "richtext exceeds maxLength",
			schema:    s,
			body:      map[string]any{"title": "hello", "content": "way too long!!"},
			wantCodes: map[string]FieldValidationCode{"content": FieldValidationCodeConstraint},
		},
		{
			name:      "markdown exceeds maxLength",
			schema:    s,
			body:      map[string]any{"title": "hello", "notes": "way too long!!"},
			wantCodes: map[string]FieldValidationCode{"notes": FieldValidationCodeConstraint},
		},
		// integer min/max
		{
			name:      "integer below min",
			schema:    s,
			body:      map[string]any{"title": "hello", "count": float64(0)},
			wantCodes: map[string]FieldValidationCode{"count": FieldValidationCodeConstraint},
		},
		{
			name:      "integer above max",
			schema:    s,
			body:      map[string]any{"title": "hello", "count": float64(999)},
			wantCodes: map[string]FieldValidationCode{"count": FieldValidationCodeConstraint},
		},
		// number min/max
		{
			name:      "number below min",
			schema:    s,
			body:      map[string]any{"title": "hello", "score": float64(-0.1)},
			wantCodes: map[string]FieldValidationCode{"score": FieldValidationCodeConstraint},
		},
		{
			name:      "number above max",
			schema:    s,
			body:      map[string]any{"title": "hello", "score": float64(1.1)},
			wantCodes: map[string]FieldValidationCode{"score": FieldValidationCodeConstraint},
		},
		// select
		{
			name:      "select invalid value",
			schema:    s,
			body:      map[string]any{"title": "hello", "status": "pending"},
			wantCodes: map[string]FieldValidationCode{"status": FieldValidationCodeConstraint},
		},
		// type mismatches
		{
			name:      "integer type mismatch",
			schema:    s,
			body:      map[string]any{"title": "hello", "count": map[string]any{"bad": "value"}},
			wantCodes: map[string]FieldValidationCode{"count": FieldValidationCodeTypeMismatch},
		},
		{
			name:      "bool type mismatch",
			schema:    s,
			body:      map[string]any{"title": "hello", "active": map[string]any{"bad": "value"}},
			wantCodes: map[string]FieldValidationCode{"active": FieldValidationCodeTypeMismatch},
		},
		{
			name:      "datetime type mismatch",
			schema:    s,
			body:      map[string]any{"title": "hello", "publishedAt": map[string]any{"bad": "value"}},
			wantCodes: map[string]FieldValidationCode{"publishedAt": FieldValidationCodeTypeMismatch},
		},
		{
			name:      "url type mismatch",
			schema:    s,
			body:      map[string]any{"title": "hello", "website": map[string]any{"bad": "value"}},
			wantCodes: map[string]FieldValidationCode{"website": FieldValidationCodeTypeMismatch},
		},
		// single vs multiple
		{
			name:      "single field rejects array with multiple values",
			schema:    s,
			body:      map[string]any{"title": "hello", "tag": []any{"one", "two"}},
			wantCodes: map[string]FieldValidationCode{"tag": FieldValidationCodeTypeMismatch},
		},
		{
			name:      "multiple field type mismatch on invalid item in array",
			schema:    s,
			body:      map[string]any{"title": "hello", "counts": []any{float64(5), map[string]any{"bad": "value"}}},
			wantCodes: map[string]FieldValidationCode{"counts": FieldValidationCodeTypeMismatch},
		},
		{
			name:      "multiple field constraint violation on item out of range",
			schema:    s,
			body:      map[string]any{"title": "hello", "counts": []any{float64(5), float64(999)}},
			wantCodes: map[string]FieldValidationCode{"counts": FieldValidationCodeConstraint},
		},
		// multiple errors at once
		{
			name:   "multiple field errors reported together",
			schema: s,
			body:   map[string]any{"count": float64(999)},
			wantCodes: map[string]FieldValidationCode{
				"title": FieldValidationCodeRequired,
				"count": FieldValidationCodeConstraint,
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			errs := tt.schema.ValidateFields(tt.body)

			if tt.wantCodes == nil {
				assert.Empty(t, errs)
				return
			}

			assert.Len(t, errs, len(tt.wantCodes))
			for _, fe := range errs {
				wantCode, exists := tt.wantCodes[fe.Field]
				assert.True(t, exists, "unexpected field error for %q", fe.Field)
				assert.Equal(t, wantCode, fe.Code)
			}
		})
	}
}
