package schema

import (
	"encoding/json"
	"unicode/utf8"

	"github.com/reearth/reearth-cms/server/pkg/value"
)

type FieldValidationCode string

const (
	FieldValidationCodeRequired            FieldValidationCode = "FIELD_REQUIRED"
	FieldValidationCodeTypeMismatch        FieldValidationCode = "TYPE_MISMATCH"
	FieldValidationCodeConstraint          FieldValidationCode = "CONSTRAINT_VIOLATION"
	FieldValidationCodeMaxLengthExceeded   FieldValidationCode = "MAX_LENGTH_EXCEEDED"
	FieldValidationCodeMaxSizeExceeded     FieldValidationCode = "MAX_SIZE_EXCEEDED"
	FieldValidationCodeInvalidGeoStructure FieldValidationCode = "INVALID_GEO_STRUCTURE"
)

// Global hard limits enforced on every posting request.
const (
	// maxURLFieldLength is the hard character cap for URL fields.
	maxURLFieldLength = 2048
	// maxGeoFieldBytes caps the serialized size of a single Geo field (10 KB).
	maxGeoFieldBytes = 10 * 1024
)

type FieldValidationError struct {
	Field  string              `json:"field"`
	Code   FieldValidationCode `json:"code"`
	Detail string              `json:"detail,omitempty"`
}

// ValidateFields validates a raw key→value map against the schema.
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

		if le := checkFieldLimits(f, raw); le != nil {
			errs = append(errs, *le)
			continue
		}

		// type coercion + constraint validation
		if err := validateFieldEntry(f, raw); err != nil {
			errs = append(errs, *err)
		}
	}

	return errs
}

// checkFieldLimits enforces the global hard limits for URL and Geo fields.
// It returns the first violation found, or nil when the value is within limits.
func checkFieldLimits(f *Field, raw any) *FieldValidationError {
	key := f.Key().String()

	for _, v := range toLimitSlice(raw) {
		if v == nil {
			continue
		}
		switch f.Type() {
		case value.TypeURL:
			// URL fields have a hard 2,048 character cap.
			if s, ok := v.(string); ok && utf8.RuneCountInString(s) > maxURLFieldLength {
				return &FieldValidationError{Field: key, Code: FieldValidationCodeMaxLengthExceeded}
			}
		case value.TypeGeometryObject, value.TypeGeometryEditor:
			if e := checkGeoLimits(key, v); e != nil {
				return e
			}
		}
	}

	return nil
}

// checkGeoLimits validates a Geo field value: structure first, then size.
func checkGeoLimits(key string, raw any) *FieldValidationError {
	gj, ok := geoJSONString(raw)
	if !ok {
		return &FieldValidationError{Field: key, Code: FieldValidationCodeInvalidGeoStructure}
	}
	if _, valid := isValidGeoJSON(gj); !valid {
		return &FieldValidationError{Field: key, Code: FieldValidationCodeInvalidGeoStructure}
	}
	if len(gj) > maxGeoFieldBytes {
		return &FieldValidationError{Field: key, Code: FieldValidationCodeMaxSizeExceeded}
	}
	return nil
}

// geoJSONString returns the serialized GeoJSON for a raw value. Geo values may
// arrive as a JSON string or as a nested JSON object; both are normalized to
// their serialized string form.
func geoJSONString(raw any) (string, bool) {
	if s, ok := raw.(string); ok {
		return s, true
	}
	b, err := json.Marshal(raw)
	if err != nil {
		return "", false
	}
	return string(b), true
}

// toLimitSlice normalizes a raw field value into a slice so scalar and array
// values can be checked uniformly.
func toLimitSlice(raw any) []any {
	if arr, ok := raw.([]any); ok {
		return arr
	}
	return []any{raw}
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

	// The value shape must match the field's cardinality: a multiple field
	// requires an array, a single field requires a scalar.
	arr, isSlice := raw.([]any)
	if isSlice != f.Multiple() {
		return &FieldValidationError{
			Field: key,
			Code:  FieldValidationCodeTypeMismatch,
		}
	}

	var raws []any
	if isSlice {
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
