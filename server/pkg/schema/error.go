package schema

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

var (
	ErrFieldNotFound         = rerror.NewE(i18n.T("field not found for the given schema"))
	ErrFieldValueNotMultiple = rerror.NewE(i18n.T("field value must be a list for the given schema field"))
	ErrFieldValueMultiple    = rerror.NewE(i18n.T("field value must not be a list for the given schema field"))
)

type FieldValidationCode string

const (
	FieldValidationCodeRequired            FieldValidationCode = "FIELD_REQUIRED"
	FieldValidationCodeNotFound            FieldValidationCode = "FIELD_NOT_FOUND"
	FieldValidationCodeTypeMismatch        FieldValidationCode = "TYPE_MISMATCH"
	FieldValidationCodeConstraint          FieldValidationCode = "CONSTRAINT_VIOLATION"
	FieldValidationCodeUnique              FieldValidationCode = "UNIQUE_VIOLATION"
	FieldValidationCodeMaxLengthExceeded   FieldValidationCode = "MAX_LENGTH_EXCEEDED"
	FieldValidationCodeMaxSizeExceeded     FieldValidationCode = "MAX_SIZE_EXCEEDED"
	FieldValidationCodeInvalidGeoStructure FieldValidationCode = "INVALID_GEO_STRUCTURE"
)

type FieldValidationError struct {
	Field  *FieldID
	Key    *id.Key
	Index  *int
	Group  *id.ItemGroupID
	Code   FieldValidationCode
	Detail error
}

func (e FieldValidationError) WithGroup(g *id.ItemGroupID) FieldValidationError {
	e.Group = g.CloneRef()
	return e
}

func (e FieldValidationError) WithIndex(i int) FieldValidationError {
	e.Index = lo.ToPtr(i)
	return e
}

func (e FieldValidationError) Unwrap() error {
	return e.Detail
}

func (e FieldValidationError) Error() string {
	field := "field"
	if e.Field != nil {
		field = e.Field.String()
	}
	if e.Key != nil {
		field += "(" + e.Key.String() + ")"
	}
	if e.Index != nil {
		field += "[" + strconv.Itoa(*e.Index) + "]"
	}
	if e.Group != nil {
		field += " (group " + e.Group.String() + ")"
	}
	if e.Detail != nil {
		return field + ": " + string(e.Code) + " (" + e.Detail.Error() + ")"
	}
	return field + ": " + string(e.Code)
}

func (e FieldValidationError) AsList() FieldValidationErrors {
	return FieldValidationErrors{e}
}

func (f *Field) ValidationError(err error, fallback FieldValidationCode) FieldValidationError {
	code := fallback
	switch {
	case errors.Is(err, ErrURLFieldMaxLengthExceeded):
		code = FieldValidationCodeMaxLengthExceeded
	case errors.Is(err, ErrGeoFieldMaxSizeExceeded):
		code = FieldValidationCodeMaxSizeExceeded
	case errors.Is(err, ErrGeoFieldInvalidGeoStructure):
		code = FieldValidationCodeInvalidGeoStructure
	}
	return FieldValidationError{
		Field:  f.ID().Ref(),
		Key:    f.Key().Ref(),
		Code:   code,
		Detail: err,
	}
}

type FieldValidationErrors []FieldValidationError

func (e FieldValidationErrors) Error() string {
	if len(e) == 0 {
		return "field validation failed"
	}
	msgs := lo.Map(e, func(fe FieldValidationError, _ int) string {
		return fe.Error()
	})
	return "field validation failed: " + strings.Join(msgs, "; ")
}

// Unwrap lets errors.Is / errors.As match the underlying error of any field error.
func (e FieldValidationErrors) Unwrap() []error {
	return lo.Map(e, func(fe FieldValidationError, _ int) error { return fe })
}

func (e FieldValidationErrors) StatusCode() int {
	return http.StatusBadRequest
}

func (e FieldValidationErrors) Empty() bool {
	return len(e) == 0
}

func (e FieldValidationErrors) WithGroup(g *id.ItemGroupID) FieldValidationErrors {
	return lo.Map(e, func(fe FieldValidationError, _ int) FieldValidationError {
		return fe.WithGroup(g)
	})
}

// FieldKey identifies a field value inside an item: a top-level field (Group == nil) or a field in a group instance.
type FieldKey struct {
	Field FieldID
	Group id.ItemGroupID
}

type FieldKeySet map[FieldKey]struct{}

func NewFieldKey(f FieldID, g *id.ItemGroupID) FieldKey {
	k := FieldKey{Field: f}
	if g != nil {
		k.Group = *g
	}
	return k
}

func (s FieldKeySet) Has(f FieldID, g *id.ItemGroupID) bool {
	_, ok := s[NewFieldKey(f, g)]
	return ok
}

// Keys returns the set of field values that already have an error, so later validation steps can skip them.
func (e FieldValidationErrors) Keys() FieldKeySet {
	res := FieldKeySet{}
	for _, fe := range e {
		if fe.Field == nil {
			continue
		}
		res[NewFieldKey(*fe.Field, fe.Group)] = struct{}{}
	}
	return res
}
