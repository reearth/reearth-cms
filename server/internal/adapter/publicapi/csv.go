package publicapi

import (
	"encoding/csv"
	"io"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

func toCSV(c echo.Context, l item.VersionedList, s *schema.Schema) error {
	if !s.IsPointFieldSupported() {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "point type is not supported in this model",
		})
	}

	pr, pw := io.Pipe()
	go handleCSVGeneration(pw, l, s)

	c.Response().Header().Set(echo.HeaderContentDisposition, "attachment;")
	c.Response().Header().Set(echo.HeaderContentType, "text/csv")
	return c.Stream(http.StatusOK, "text/csv", pr)
}

func handleCSVGeneration(pw *io.PipeWriter, l item.VersionedList, s *schema.Schema) {
	err := generateCSV(pw, l, s)
	if err != nil {
		log.Errorf("failed to generate CSV: %v", err)
		_ = pw.CloseWithError(err)
	} else {
		_ = pw.Close()
	}
}

func generateCSV(pw *io.PipeWriter, l item.VersionedList, s *schema.Schema) error {
	w := csv.NewWriter(pw)
	defer w.Flush()

	headers := exporters.BuildCSVHeaders(s)
	if err := w.Write(headers); err != nil {
		return err
	}

	nonGeoFields := lo.Filter(s.Fields(), func(f *schema.Field, _ int) bool {
		return !f.IsGeometryField()
	})

	for _, ver := range l {
		row, ok := exporters.RowFromItem(ver.Value(), nonGeoFields)
		if ok {
			if err := w.Write(row); err != nil {
				return err
			}
		}
	}

	return w.Error()
}