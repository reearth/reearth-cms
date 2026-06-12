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

type apiErrorResponse struct {
	Error   string `json:"error"`
	Code    string `json:"code,omitempty"`
	Message string `json:"message,omitempty"`
	Details any    `json:"details,omitempty"`
}

// Error codes and messages returned by the posting endpoint.
const (
	codePostingDisabled      = "posting_disabled"
	codeModelPostingDisabled = "model_posting_disabled"
	codeOriginNotAllowed     = "origin_not_allowed"

	msgNoOriginsConfigured = "No origins are configured for posting on this project."
	msgOriginNotAllowed    = "Origin is not allowed for posting on this project."
)

// postingAccessErrorResponse maps errors from ValidatePostingAccess to their HTTP responses.
func postingAccessErrorResponse(c *echo.Context, err error) error {
	switch {
	case errors.Is(err, ErrProjectPostingDisabled):
		return c.JSON(http.StatusForbidden, apiErrorResponse{
			Error: codePostingDisabled,
			Code:  codePostingDisabled,
		})
	case errors.Is(err, ErrModelPostingDisabled):
		return c.JSON(http.StatusForbidden, apiErrorResponse{
			Error: codeModelPostingDisabled,
			Code:  codeModelPostingDisabled,
		})
	case errors.Is(err, project.ErrNoOriginsConfigured):
		return c.JSON(http.StatusForbidden, apiErrorResponse{
			Error:   codeOriginNotAllowed,
			Code:    codeOriginNotAllowed,
			Message: msgNoOriginsConfigured,
		})
	case errors.Is(err, project.ErrOriginNotAllowed):
		return c.JSON(http.StatusForbidden, apiErrorResponse{
			Error:   codeOriginNotAllowed,
			Code:    codeOriginNotAllowed,
			Message: msgOriginNotAllowed,
		})
	case errors.Is(err, rerror.ErrNotFound):
		return c.JSON(http.StatusNotFound, apiErrorResponse{
			Error: "not found",
		})
	default:
		return err
	}
}
