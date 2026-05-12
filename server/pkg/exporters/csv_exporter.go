package exporters

import (
	"context"
	"encoding/csv"
	"io"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/samber/lo"
)

// CSVExporter handles CSV format exports
type CSVExporter struct {
	isStreaming   bool
	writer        io.Writer
	csvWriter     *csv.Writer
	schemaPackage *schema.Package
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

	return nil
}

// Export performs the CSV export
func (e *CSVExporter) Export(ctx context.Context, req *ExportRequest, il item.List, al asset.List) error {
	writer := csv.NewWriter(e.writer)
	defer writer.Flush()

	sp := &req.Schema

	// Write headers
	if err := writer.Write(BuildCSVHeaders(sp)); err != nil {
		return err
	}

	// Write data rows
	lo.ForEach(il, func(itm *item.Item, _ int) {
		row, ok := RowFromItem(itm, sp)
		if !ok {
			return
		}
		if err := writer.Write(row); err != nil {
			return
		}
	})

	return writer.Error()
}

// StartExport initializes the streaming CSV export
func (e *CSVExporter) StartExport(ctx context.Context, req *ExportRequest) error {
	e.isStreaming = true
	e.csvWriter = csv.NewWriter(e.writer)
	e.schemaPackage = &req.Schema

	// Write headers
	if err := e.csvWriter.Write(BuildCSVHeaders(e.schemaPackage)); err != nil {
		return err
	}

	return nil
}

// ProcessBatch processes a batch of items for streaming CSV export
func (e *CSVExporter) ProcessBatch(ctx context.Context, il item.List, assets asset.List) error {
	if !e.isStreaming || e.writer == nil {
		return ErrInvalidRequest
	}

	// Write data rows
	lo.ForEach(il, func(itm *item.Item, _ int) {
		row, ok := RowFromItem(itm, e.schemaPackage)
		if !ok {
			return
		}
		if err := e.csvWriter.Write(row); err != nil {
			return
		}
	})

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
	e.schemaPackage = nil

	return err
}
