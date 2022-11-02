package integration

import (
	"time"

	openapi_types "github.com/deepmap/oapi-codegen/pkg/types"
)

//nolint:composites
func ToDate(t time.Time) *openapi_types.Date {
	return &openapi_types.Date{
		t,
	}
}
