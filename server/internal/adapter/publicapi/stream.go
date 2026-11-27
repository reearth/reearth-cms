package publicapi

import (
	"context"
	"errors"
	"io"

	"github.com/labstack/echo/v5"
	"github.com/reearth/reearthx/log"
)

// stream lets export write straight to the response, as in Echo's streaming
// response recipe (https://echo.labstack.com/cookbook/streaming-response/),
// so the export is never held in memory as a whole.
//
// The content type is set up front, and Echo sends the 200 status with the
// first write. If export fails before writing anything (e.g. not found), the
// content type is removed again and the error is returned, so the caller can
// send its usual error response. Once the response has started its status
// can no longer change: the error is logged and the response ends there.
func stream(c *echo.Context, contentType string, export func(io.Writer) error) error {
	res := c.Response()
	res.Header().Set(echo.HeaderContentType, contentType)

	err := export(res)
	if err == nil {
		return nil
	}

	if r, _ := echo.UnwrapResponse(res); r == nil || !r.Committed {
		res.Header().Del(echo.HeaderContentType)
		return err
	}

	ctx := c.Request().Context()
	if !errors.Is(err, context.Canceled) && ctx.Err() == nil {
		log.Errorfc(ctx, "publicapi: export failed after the response started: %v", err)
	}
	return nil
}
