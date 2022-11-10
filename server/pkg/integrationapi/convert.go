package integrationapi

import (
	"time"

	openapi_types "github.com/deepmap/oapi-codegen/pkg/types"
)

func ToDate(t time.Time) *openapi_types.Date {
	return &openapi_types.Date{
		Time: t,
	}
}
