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
	e.GET("/:workspace-alias/:project-alias/:model-key", ItemOrAssetList())
	e.GET("/:workspace-alias/:project-alias/:model-key/:item-id", ItemOrAsset())
}

func ItemOrAsset() echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
		ctrl := GetController(c.Request().Context())

		wAlias, pAlias, mKey, iID := c.Param("workspace-alias"), c.Param("project-alias"), c.Param("model-key"), c.Param("item-id")
		var res any
		var err error
		if mKey == "assets" {
			res, err = ctrl.GetAsset(ctx, wAlias, pAlias, iID)
		} else if iID == "schema.json" {
			res, err = ctrl.GetSchemaJSON(ctx, wAlias, pAlias, mKey)
		} else {
			res, err = ctrl.GetItem(ctx, wAlias, pAlias, mKey, iID)
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

		wAlias, pAlias, mKey := c.Param("workspace-alias"), c.Param("project-alias"), c.Param("model-key")
		p, err := listParamFromEchoContext(c)
		if err != nil {
			return c.JSON(http.StatusBadRequest, "invalid offset or limit")
		}

		if mKey == "assets" {
			res, err := ctrl.GetAssets(ctx, wAlias, pAlias, p)
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

		items, sp, aPublic, assets, pi, err := ctrl.GetPublicItems(ctx, wAlias, pAlias, mKey, p)
		if err != nil {
			if errors.Is(err, rerror.ErrNotFound) {
				return c.JSON(http.StatusNotFound, map[string]string{"error": "not found"})
			}
			return err
		}
		refItems := getReferencedItemsMap(ctx, items, aPublic)

		switch resType {
		case "csv":
			return toCSV(c, items, sp.Schema())
		case "geojson":
			return toGeoJSON(c, items, sp, assets)
		case "json":
			return toJSON(c, items, sp, aPublic, assets, refItems, pi, p.Pagination)
		default:
			return toJSON(c, items, sp, aPublic, assets, refItems, pi, p.Pagination)
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
