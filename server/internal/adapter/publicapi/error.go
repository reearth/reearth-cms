package publicapi

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

var ErrInvalidProject = rerror.NewE(i18n.T("invalid project"))
var ErrProjectPostingDisabled = rerror.NewE(i18n.T("posting is disabled for this project"))
var ErrModelPostingDisabled = rerror.NewE(i18n.T("posting is disabled for this model"))

// apiErrorResponse is the uniform error body returned by the posting endpoint.
type apiErrorResponse struct {
	Error   string `json:"error"`
	Code    string `json:"code"`
	Message string `json:"message"`
	Details any    `json:"details,omitempty"`
}

// Error codes returned by the posting endpoint. PostingErrorCodes is the single
// source of truth and is published as an enum in the OpenAPI schema (openapi.go).
const (
	codeInvalidJSON          = "invalid_json"
	codeValidationError      = "validation_error"
	codePostingDisabled      = "posting_disabled"
	codeModelPostingDisabled = "model_posting_disabled"
	codeOriginNotAllowed     = "origin_not_allowed"
	codeNotFound             = "not_found"
	codePayloadTooLarge      = "payload_too_large"
)

// Human-readable messages paired with each error code.
const (
	msgInvalidJSON          = "Request body is not valid JSON."
	msgValidationError      = "One or more fields failed validation."
	msgPostingDisabled      = "Posting is disabled for this project."
	msgModelPostingDisabled = "Posting is disabled for this model."
	msgNoOriginsConfigured  = "No origins are configured for posting on this project."
	msgOriginNotAllowed     = "Origin is not allowed for posting on this project."
	msgNotFound             = "The requested resource was not found."
	msgPayloadTooLarge      = "Request body exceeds the allowed limit"
)

// PostingErrorCodes lists every machine-readable code the posting endpoint can
// return. It is the single source of truth shared with the OpenAPI schema.
var PostingErrorCodes = []string{
	codeInvalidJSON,
	codeValidationError,
	codePostingDisabled,
	codeModelPostingDisabled,
	codeOriginNotAllowed,
	codeNotFound,
}

// newAPIError builds a uniform error body with both code and message set.
func newAPIError(code, message string, details any) apiErrorResponse {
	return apiErrorResponse{Error: code, Code: code, Message: message, Details: details}
}

// postingAccessErrorResponse maps errors from ValidatePostingAccess to their HTTP responses.
func postingAccessErrorResponse(c *echo.Context, err error) error {
	switch {
	case errors.Is(err, ErrProjectPostingDisabled):
		return c.JSON(http.StatusForbidden, newAPIError(codePostingDisabled, msgPostingDisabled, nil))
	case errors.Is(err, ErrModelPostingDisabled):
		return c.JSON(http.StatusForbidden, newAPIError(codeModelPostingDisabled, msgModelPostingDisabled, nil))
	case errors.Is(err, project.ErrNoOriginsConfigured):
		return c.JSON(http.StatusForbidden, newAPIError(codeOriginNotAllowed, msgNoOriginsConfigured, nil))
	case errors.Is(err, project.ErrOriginNotAllowed):
		return c.JSON(http.StatusForbidden, newAPIError(codeOriginNotAllowed, msgOriginNotAllowed, nil))
	case errors.Is(err, rerror.ErrNotFound):
		return c.JSON(http.StatusNotFound, newAPIError(codeNotFound, msgNotFound, nil))
	default:
		return err
	}
}
