package publicapi

import (
	"context"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

var contextKey = struct{}{}

func AttachController(ctx context.Context, c *Controller) context.Context {
	return context.WithValue(ctx, contextKey, c)
}

func GetController(ctx context.Context) *Controller {
	return ctx.Value(contextKey).(*Controller)
}

func Echo(e *echo.Group) {
	e.Use(middleware.CORS())
	e.GET("/:project/:model", PublicApiItemList())
	e.GET("/:project/:model/:item", PublicApiItemOrAsset())
}

func PublicApiItemOrAsset() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		ctrl := GetController(c.Request().Context())

		p, m, i := c.Param("project"), c.Param("model"), c.Param("item")
		var res any
		var err error
		if m == "assets" {
			res, err = ctrl.GetAsset(ctx, p, i)
		} else {
			res, err = ctrl.GetItem(ctx, p, m, i)
		}

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

func PublicApiAsset() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		ctrl := GetController(c.Request().Context())

		res, err := ctrl.GetAsset(ctx, c.Param("project"), c.Param("asset"))
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

	if limits := c.QueryParam("limit"); limits != "" {
		limit, err = strconv.Atoi(limits)
	} else if pageSize := c.QueryParam("page_size"); pageSize != "" {
		limit, err = strconv.Atoi(pageSize)
	} else if pageSize := c.QueryParam("per_page"); pageSize != "" {
		limit, err = strconv.Atoi(pageSize)
	}
	if limit <= 0 {
		limit = 50
	} else if limit > 100 {
		limit = 100
	}

	var p *usecasex.Pagination
	if startCursor := c.QueryParam("start_cursor"); startCursor != "" {
		p = usecasex.CursorPagination{
			First: lo.ToPtr(int64(limit)),
			After: (*usecasex.Cursor)(&startCursor),
		}.Wrap()
	} else {
		if offsets := c.QueryParam("offset"); offsets != "" {
			offset, err = strconv.Atoi(offsets)
		} else if page := c.QueryParam("page"); page != "" {
			page2, err2 := strconv.Atoi(page)
			if page2 <= 0 {
				page2 = 1
			}
			offset = (page2 - 1) * limit
			err = err2
		}

		p = usecasex.OffsetPagination{
			Offset: int64(offset),
			Limit:  int64(limit),
		}.Wrap()
	}

	return ListParam{
		Pagination: p,
	}, err
}
