package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/value"
)

type FieldValidationCode string

const (
	FieldValidationCodeRequired     FieldValidationCode = "FIELD_REQUIRED"
	FieldValidationCodeTypeMismatch FieldValidationCode = "TYPE_MISMATCH"
	FieldValidationCodeConstraint   FieldValidationCode = "CONSTRAINT_VIOLATION"
)

type FieldValidationError struct {
	Field  string              `json:"field"`
	Code   FieldValidationCode `json:"code"`
	Detail string              `json:"detail,omitempty"`
}

// ValidateFields validates a raw key→value map against the schema.
// Unknown keys are silently ignored. Missing or empty required fields are reported.
// Returns a non-nil slice only when there are errors; nil means the payload is valid.
func (s *Schema) ValidateFields(fields map[string]any) []FieldValidationError {
	if s == nil {
		return nil
	}

	var errs []FieldValidationError

	for _, f := range s.Fields() {
		if f.Type() == value.TypeAsset || f.Type() == value.TypeReference || f.Type() == value.TypeTag || f.Type() == value.TypeGroup {
			continue
		}

		key := f.Key().String()
		raw, present := fields[key]

		// required check
		if f.Required() && (!present || isEmptyFieldValue(raw)) {
			errs = append(errs, FieldValidationError{
				Field: key,
				Code:  FieldValidationCodeRequired,
			})
			continue
		}

		if !present || isEmptyFieldValue(raw) {
			continue
		}

		// type coercion + constraint validation
		if err := validateFieldEntry(f, raw); err != nil {
			errs = append(errs, *err)
		}
	}

	return errs
}

func isEmptyFieldValue(v any) bool {
	if v == nil {
		return true
	}
	if s, ok := v.(string); ok {
		return s == ""
	}
	return false
}

// validateFieldEntry coerces raw into a typed value.Multiple and validates it
// against the field's constraints. Returns a FieldValidationError on failure.
func validateFieldEntry(f *Field, raw any) *FieldValidationError {
	key := f.Key().String()
	ft := f.Type()

	// normalize: wrap scalars into a slice so NewMultiple works uniformly.
	var raws []any
	if arr, ok := raw.([]any); ok {
		raws = arr
	} else {
		raws = []any{raw}
	}

	m := value.NewMultiple(ft, raws)
	if m == nil || m.Len() != len(raws) {
		return &FieldValidationError{
			Field: key,
			Code:  FieldValidationCodeTypeMismatch,
		}
	}

	if err := f.ValidateValue(m); err != nil {
		return &FieldValidationError{
			Field:  key,
			Code:   FieldValidationCodeConstraint,
			Detail: err.Error(),
		}
	}

	return nil
}
