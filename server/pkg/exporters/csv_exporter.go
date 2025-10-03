package exporters

import (
	"context"
	"encoding/csv"
	"io"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
)

// CSVExporter handles CSV format exports
type CSVExporter struct {
	isStreaming  bool
	writer       io.Writer
	csvWriter    *csv.Writer
	nonGeoFields []*schema.Field
}

// NewCSVExporter creates a new CSV exporter
func NewCSVExporter(w io.Writer) Exporter {
	return &CSVExporter{
		writer: w,
	}
}

// ValidateRequest validates the export request
func (e *CSVExporter) ValidateRequest(req *ExportRequest) error {
	if req.Schema.Schema() == nil {
		return ErrSchemaRequired
	}

	if !req.Schema.Schema().IsPointFieldSupported() {
		return ErrNoPointField
	}

	return nil
}

// Export performs the CSV export
func (e *CSVExporter) Export(ctx context.Context, req *ExportRequest, il item.List, al asset.List) error {
	writer := csv.NewWriter(e.writer)
	defer writer.Flush()

	sch := req.Schema.Schema()

	//// Write headers
	//var headers []string
	//if len(req.Options.CustomHeaders) > 0 {
	//	headers = req.Options.CustomHeaders
	//} else {
	//	headers = BuildCSVHeaders(sch)
	//}
	//
	//if err := writer.Write(headers); err != nil {
	//	return err
	//}

	// Get all fields and filter later in RowFromItem
	allFields := sch.Fields()
	nonGeoFields := make([]*schema.Field, 0)
	for _, f := range allFields {
		if !f.IsGeometryField() {
			nonGeoFields = append(nonGeoFields, f)
		}
	}

	// Write data rows
	for _, item := range il {
		row, ok := RowFromItem(item, nonGeoFields)
		if ok {
			if err := writer.Write(row); err != nil {
				return err
			}
		}
	}

	return writer.Error()
}

// StartExport initializes the streaming CSV export
func (e *CSVExporter) StartExport(ctx context.Context, req *ExportRequest) error {
	e.isStreaming = true
	e.csvWriter = csv.NewWriter(e.writer)

	sch := req.Schema.Schema()

	// Write headers
	if err := e.csvWriter.Write(BuildCSVHeaders(sch)); err != nil {
		return err
	}

	// Prepare non-geometry fields for batch processing
	e.nonGeoFields = make([]*schema.Field, 0)
	for _, f := range sch.Fields() {
		if !f.IsGeometryField() {
			e.nonGeoFields = append(e.nonGeoFields, f)
		}
	}

	return nil
}

// ProcessBatch processes a batch of items for streaming CSV export
func (e *CSVExporter) ProcessBatch(ctx context.Context, items item.List, assets asset.List) error {
	if !e.isStreaming || e.writer == nil {
		return ErrInvalidRequest
	}

	for _, item := range items {
		row, ok := RowFromItem(item, e.nonGeoFields)
		if ok {
			if err := e.csvWriter.Write(row); err != nil {
				return err
			}
		}
	}

	// Flush after each batch to ensure data is written
	e.csvWriter.Flush()
	return e.csvWriter.Error()
}

// EndExport finalizes the streaming CSV export
func (e *CSVExporter) EndExport(ctx context.Context, extra map[string]any) error {
	if !e.isStreaming || e.writer == nil {
		return ErrInvalidRequest
	}

	e.csvWriter.Flush()
	err := e.csvWriter.Error()

	e.isStreaming = false
	e.csvWriter = nil
	e.nonGeoFields = nil

	return err
}
