package publicapi

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

type contextKey string

func (c contextKey) String() string {
	return "public_api_" + string(c)
}

var controllerCK = contextKey("controller")

const defaultLimit = 50
const maxLimit = 100

func AttachController(ctx context.Context, c *Controller) context.Context {
	return context.WithValue(ctx, controllerCK, c)
}

func GetController(ctx context.Context) *Controller {
	return ctx.Value(controllerCK).(*Controller)
}

func Echo(e *echo.Group) {
	e.GET("/:project/:model", ItemOrAssetList())
	e.GET("/:project/:model/:item", ItemOrAsset())
}

func ItemOrAsset() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		ctrl := GetController(c.Request().Context())

		p, m, i := c.Param("project"), c.Param("model"), c.Param("item")
		var res any
		var err error
		if m == "assets" {
			res, err = ctrl.GetAsset(ctx, p, i)
		} else if i == "schema.json" {
			res, err = ctrl.GetSchemaJSON(ctx, p, m)
		} else {
			res, err = ctrl.GetItem(ctx, p, m, i)
		}

		if err != nil {
			if errors.Is(err, rerror.ErrNotFound) {
				return c.JSON(http.StatusNotFound, map[string]string{"error": "not found"})
			}
			return err
		}

		return c.JSON(http.StatusOK, res)
	}
}

func ItemOrAssetList() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		ctrl := GetController(ctx)

		mKey := c.Param("model")
		pKey := c.Param("project")
		p, err := listParamFromEchoContext(c)
		if err != nil {
			return c.JSON(http.StatusBadRequest, "invalid offset or limit")
		}

		if mKey == "assets" {
			res, err := ctrl.GetAssets(ctx, pKey, p)
			if err != nil {
				return err
			}
			return c.JSON(http.StatusOK, res)
		}

		resType := ""
		if strings.Contains(mKey, ".") {
			mKey, resType, _ = strings.Cut(mKey, ".")
		}
		if resType != "csv" && resType != "json" && resType != "geojson" {
			resType = "json"
		}

		items, sp, aPublic, assets, pi, err := ctrl.GetPublicItems(ctx, pKey, mKey, p)
		if err != nil {
			if errors.Is(err, rerror.ErrNotFound) {
				return c.JSON(http.StatusNotFound, map[string]string{"error": "not found"})
			}
			return err
		}

		switch resType {
		case "csv":
			return toCSV(c, items, sp.Schema())
		case "geojson":
			return toGeoJSON(c, items, sp, assets)
		case "json":
			return toJSON(c, items, sp, aPublic, assets, nil, pi, p.Pagination)
		default:
			return toJSON(c, items, sp, aPublic, assets, nil, pi, p.Pagination)
		}
	}
}

func listParamFromEchoContext(c echo.Context) (ListParam, error) {
	limit, _ := intParams(c, "limit", "perPage", "per_page", "page_size", "pageSize")
	if limit <= 0 {
		limit = defaultLimit
	} else if limit > 100 {
		limit = maxLimit
	}

	var offset int64 = 0
	var err error
	var p *usecasex.Pagination
	if startCursor := c.QueryParam("start_cursor"); startCursor != "" {
		p = usecasex.CursorPagination{
			First: lo.ToPtr(int64(limit)),
			After: (*usecasex.Cursor)(&startCursor),
		}.Wrap()
	} else {
		if offsets := c.QueryParam("offset"); offsets != "" {
			offset, err = strconv.ParseInt(offsets, 10, 64)
		} else if page := c.QueryParam("page"); page != "" {
			page2, err2 := strconv.ParseInt(page, 10, 64)
			if page2 <= 0 {
				page2 = 1
			}
			offset = (page2 - 1) * limit
			err = err2
		}

		p = usecasex.OffsetPagination{
			Offset: offset,
			Limit:  limit,
		}.Wrap()
	}

	return ListParam{
		Pagination: p,
	}, err
}

func intParams(c echo.Context, params ...string) (int64, bool) {
	for _, p := range params {
		if q := c.QueryParam(p); q != "" {
			if p, err := strconv.ParseInt(q, 10, 64); err == nil {
				return p, true
			}
		}
	}
	return 0, false
}
