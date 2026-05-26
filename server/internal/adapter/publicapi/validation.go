package publicapi

import "github.com/reearth/reearth-cms/server/pkg/schema"

// FieldError is an alias for the domain-layer type so callers in this package
// and HTTP response types don't need to import pkg/schema directly.
type FieldError = schema.FieldValidationError

const (
	errCodeRequired     = schema.FieldValidationCodeRequired
	errCodeTypeMismatch = schema.FieldValidationCodeTypeMismatch
	errCodeConstraint   = schema.FieldValidationCodeConstraint
)

// ValidatePayload is a convenience wrapper so existing call sites in this
// package don't need to change.
func ValidatePayload(s *schema.Schema, body map[string]any) []FieldError {
	return s.ValidatePayload(body)
}
