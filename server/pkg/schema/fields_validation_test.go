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
		// required
		buildTestField("title", NewText(nil).TypeProperty(), true),
		// text with maxLength
		buildTestField("bio", NewText(lo.ToPtr(10)).TypeProperty(), false),
		// textarea with maxLength
		buildTestField("summary", NewTextArea(lo.ToPtr(10)).TypeProperty(), false),
		// richtext with maxLength
		buildTestField("content", NewRichText(lo.ToPtr(10)).TypeProperty(), false),
		// markdown with maxLength
		buildTestField("notes", NewMarkdown(lo.ToPtr(10)).TypeProperty(), false),
		// integer with min/max
		buildTestField("count", intField.TypeProperty(), false),
		// number with min/max
		buildTestField("score", numField.TypeProperty(), false),
		// select with allowed values
		buildTestField("status", NewSelect([]string{"open", "closed"}).TypeProperty(), false),
		// bool, checkbox, datetime, url — type-only validation
		buildTestField("active", NewBool().TypeProperty(), false),
		buildTestField("agreed", NewCheckbox().TypeProperty(), false),
		buildTestField("publishedAt", NewDateTime().TypeProperty(), false),
		buildTestField("website", NewURL().TypeProperty(), false),
		// single and multiple
		buildTestField("tag", NewText(nil).TypeProperty(), false),
		buildTestFieldMultiple("tags", NewText(nil).TypeProperty(), false),
		buildTestFieldMultiple("counts", intField.TypeProperty(), false),
		// out of scope — must be skipped even when required
		buildTestField("attachment", NewAsset().TypeProperty(), true),
		buildTestField("ref", NewReference(id.NewModelID(), id.NewSchemaID(), nil, nil).TypeProperty(), true),
	)

	tests := []struct {
		name      string
		body      map[string]any
		wantCodes map[string]FieldValidationCode
	}{
		{
			name: "nil schema returns nil",
		},
		{
			name: "valid payload with all field types passes",
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
		{
			name:      "missing required field",
			body:      map[string]any{},
			wantCodes: map[string]FieldValidationCode{"title": FieldValidationCodeRequired},
		},
		{
			name:      "empty string treated as missing required",
			body:      map[string]any{"title": ""},
			wantCodes: map[string]FieldValidationCode{"title": FieldValidationCodeRequired},
		},
		{
			name:      "out-of-scope required fields are skipped",
			body:      map[string]any{"title": "hello"},
			wantCodes: nil,
		},
		{
			name:      "unknown keys silently ignored",
			body:      map[string]any{"title": "hello", "unknown": "ignored"},
			wantCodes: nil,
		},
		// maxLength constraints
		{
			name:      "text exceeds maxLength",
			body:      map[string]any{"title": "hello", "bio": "way too long!!"},
			wantCodes: map[string]FieldValidationCode{"bio": FieldValidationCodeConstraint},
		},
		{
			name:      "textarea exceeds maxLength",
			body:      map[string]any{"title": "hello", "summary": "way too long!!"},
			wantCodes: map[string]FieldValidationCode{"summary": FieldValidationCodeConstraint},
		},
		{
			name:      "richtext exceeds maxLength",
			body:      map[string]any{"title": "hello", "content": "way too long!!"},
			wantCodes: map[string]FieldValidationCode{"content": FieldValidationCodeConstraint},
		},
		{
			name:      "markdown exceeds maxLength",
			body:      map[string]any{"title": "hello", "notes": "way too long!!"},
			wantCodes: map[string]FieldValidationCode{"notes": FieldValidationCodeConstraint},
		},
		// integer min/max
		{
			name:      "integer below min",
			body:      map[string]any{"title": "hello", "count": float64(0)},
			wantCodes: map[string]FieldValidationCode{"count": FieldValidationCodeConstraint},
		},
		{
			name:      "integer above max",
			body:      map[string]any{"title": "hello", "count": float64(999)},
			wantCodes: map[string]FieldValidationCode{"count": FieldValidationCodeConstraint},
		},
		// number min/max
		{
			name:      "number below min",
			body:      map[string]any{"title": "hello", "score": float64(-0.1)},
			wantCodes: map[string]FieldValidationCode{"score": FieldValidationCodeConstraint},
		},
		{
			name:      "number above max",
			body:      map[string]any{"title": "hello", "score": float64(1.1)},
			wantCodes: map[string]FieldValidationCode{"score": FieldValidationCodeConstraint},
		},
		// select
		{
			name:      "select invalid value",
			body:      map[string]any{"title": "hello", "status": "pending"},
			wantCodes: map[string]FieldValidationCode{"status": FieldValidationCodeConstraint},
		},
		// type mismatches
		{
			name:      "integer type mismatch",
			body:      map[string]any{"title": "hello", "count": map[string]any{"bad": "value"}},
			wantCodes: map[string]FieldValidationCode{"count": FieldValidationCodeTypeMismatch},
		},
		{
			name:      "bool type mismatch",
			body:      map[string]any{"title": "hello", "active": map[string]any{"bad": "value"}},
			wantCodes: map[string]FieldValidationCode{"active": FieldValidationCodeTypeMismatch},
		},
		{
			name:      "datetime type mismatch",
			body:      map[string]any{"title": "hello", "publishedAt": map[string]any{"bad": "value"}},
			wantCodes: map[string]FieldValidationCode{"publishedAt": FieldValidationCodeTypeMismatch},
		},
		{
			name:      "url type mismatch",
			body:      map[string]any{"title": "hello", "website": map[string]any{"bad": "value"}},
			wantCodes: map[string]FieldValidationCode{"website": FieldValidationCodeTypeMismatch},
		},
		// single vs multiple
		{
			name:      "single field rejects array with multiple values",
			body:      map[string]any{"title": "hello", "tag": []any{"one", "two"}},
			wantCodes: map[string]FieldValidationCode{"tag": FieldValidationCodeConstraint},
		},
		{
			name:      "multiple field type mismatch on invalid item in array",
			body:      map[string]any{"title": "hello", "counts": []any{float64(5), map[string]any{"bad": "value"}}},
			wantCodes: map[string]FieldValidationCode{"counts": FieldValidationCodeTypeMismatch},
		},
		{
			name:      "multiple field constraint violation on item out of range",
			body:      map[string]any{"title": "hello", "counts": []any{float64(5), float64(999)}},
			wantCodes: map[string]FieldValidationCode{"counts": FieldValidationCodeConstraint},
		},
		// multiple errors
		{
			name: "multiple field errors reported together",
			body: map[string]any{"count": float64(999)},
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

			var errs []FieldValidationError
			if tt.name == "nil schema returns nil" {
				var nilSchema *Schema
				errs = nilSchema.ValidateFields(tt.body)
				assert.Nil(t, errs)
				return
			}

			errs = s.ValidateFields(tt.body)

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
