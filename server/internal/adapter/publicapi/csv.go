package publicapi

import (
	"io"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/log"
)

func toCSV(c echo.Context, l item.VersionedList, s *schema.Schema) error {
	if !s.IsPointFieldSupported() {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"error": "point type is not supported in this model",
		})
	}

	pr, pw := io.Pipe()
	err := generateCSV(pw, l, s)
	if err != nil {
		log.Errorf("failed to generate CSV: %+v", err)
	}

	c.Response().Header().Set(echo.HeaderContentDisposition, "attachment;")
	c.Response().Header().Set(echo.HeaderContentType, "text/csv")
	return c.Stream(http.StatusOK, "text/csv", pr)
}

func generateCSV(pw *io.PipeWriter, l item.VersionedList, s *schema.Schema) error {
	err := exporters.CSVFromItems(pw, l, s)
	if err != nil {
		return err
	}

	return nil
}
