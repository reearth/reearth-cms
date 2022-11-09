package publicapi

import (
	"context"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

var contextKey = struct{}{}

func AttachController(ctx context.Context, c *Controller) context.Context {
	return context.WithValue(ctx, contextKey, c)
}

func GetController(ctx context.Context) *Controller {
	return ctx.Value(contextKey).(*Controller)
}

func Echo(e *echo.Group) {
	e.GET("/:project/:model", PublicApiItemList())
	e.GET("/:project/:model/:item", PublicApiItem())
}

func PublicApiItem() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		ctrl := GetController(c.Request().Context())

		res, err := ctrl.GetItem(ctx, c.Param("project"), c.Param("item"))
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, res)
	}
}

func PublicApiItemList() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		ctrl := GetController(ctx)

		p, err := listParamFromEchoContext(c)
		if err != nil {
			return c.JSON(http.StatusBadRequest, "invalid offset or limit")
		}

		res, err := ctrl.GetItems(ctx, c.Param("project"), c.Param("model"), p)
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, res)
	}
}

func listParamFromEchoContext(c echo.Context) (ListParam, error) {
	var offset = 0
	var limit = 0
	var err error

	if offsets := c.QueryParam("offset"); offsets != "" {
		offset, err = strconv.Atoi(offsets)
	}

	if limits := c.QueryParam("limit"); limits != "" {
		limit, err = strconv.Atoi(limits)
	}

	return ListParam{
		Offset: offset,
		Limit:  limit,
	}, err
}
