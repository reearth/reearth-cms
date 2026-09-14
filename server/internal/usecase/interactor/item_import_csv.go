package interactor

import (
	"bytes"
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"net/url"
	"strconv"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/job"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/log"
	"golang.org/x/text/encoding/unicode"
	"golang.org/x/text/transform"
)

func newCSVReader(r io.Reader) (*csv.Reader, *io.LimitedReader) {
	lr := &io.LimitedReader{R: r, N: interfaces.MaxImportFileSize + 1}
	return csv.NewReader(transform.NewReader(lr, unicode.BOMOverride(transform.Nop))), lr
}

// importCSV handles CSV format import (synchronous)
func (i Item) importCSV(ctx context.Context, prj *project.Project, m *model.Model, s *schema.Schema, param interfaces.ImportItemsParam, res *ImportRes, operator *usecase.Operator) (interfaces.ImportItemsResponse, error) {
	reader, lr := newCSVReader(param.Reader)

	// Read header row
	headers, err := reader.Read()
	if err != nil {
		if err == io.EOF {
			// Empty file - just headers or nothing
			return res.Into(), nil
		}
		return res.Into(), fmt.Errorf("error reading CSV header: %v", err)
	}

	// Build field map from headers to schema fields
	fieldMap := buildFieldMap(headers, param.SP)

	count, totalCount := 0, 0
	csvChunk := make([]map[string]any, 0)

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return res.Into(), fmt.Errorf("error reading CSV row: %v", err)
		}

		if lr.N == 0 {
			return res.Into(), interfaces.ErrImportFileTooLarge
		}

		count++
		totalCount++

		if totalCount > interfaces.MaxImportRecordCount {
			return res.Into(), interfaces.ErrImportTooManyRecords
		}

		row := csvRowToMap(headers, record, fieldMap)
		csvChunk = append(csvChunk, row)

		if count == chunkSize {
			items, err := itemsParamsFrom(csvChunk, false, nil, param.SP)
			if err != nil {
				return res.Into(), err
			}
			err = i.saveChunk(ctx, prj, m, s, param, items, res, operator)
			if err != nil {
				return res.Into(), err
			}
			log.Printf("chunk with %d items saved.", count)
			count = 0
			csvChunk = nil
		}
	}

	// Process remaining records
	if len(csvChunk) > 0 {
		items, err := itemsParamsFrom(csvChunk, false, nil, param.SP)
		if err != nil {
			return res.Into(), err
		}
		err = i.saveChunk(ctx, prj, m, s, param, items, res, operator)
		if err != nil {
			return res.Into(), err
		}
		log.Printf("chunk with %d items saved.", len(csvChunk))
	}

	return res.Into(), nil
}

// importCSVWithProgress handles CSV format import with progress tracking (async)
func (i Item) importCSVWithProgress(ctx context.Context, j *job.Job, prj *project.Project, m *model.Model, s *schema.Schema, param interfaces.ImportItemsParam, res *ImportRes, operator *usecase.Operator) (interfaces.ImportItemsResponse, error) {
	// Buffer the (already size-capped) payload once so it can be scanned
	// twice: a cheap counting pass to learn totalCount for progress
	// reporting, and a chunked read-and-save pass that never holds more
	// than chunkSize rows in memory at once.
	data, err := io.ReadAll(param.Reader)
	if err != nil {
		return res.Into(), fmt.Errorf("error reading import data: %v", err)
	}

	headers, totalCount, err := countCSVRecords(data)
	if err != nil {
		return res.Into(), err
	}
	if headers == nil {
		// Empty file - just headers or nothing
		return res.Into(), nil
	}

	// Build field map from headers to schema fields
	fieldMap := buildFieldMap(headers, param.SP)

	reader, lr := newCSVReader(bytes.NewReader(data))
	if _, err := reader.Read(); err != nil { // re-consume the header row
		return res.Into(), fmt.Errorf("error reading CSV header: %v", err)
	}

	processed := 0
	csvChunk := make([]map[string]any, 0, chunkSize)
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return res.Into(), fmt.Errorf("error reading CSV row: %v", err)
		}
		if lr.N == 0 {
			return res.Into(), interfaces.ErrImportFileTooLarge
		}

		csvChunk = append(csvChunk, csvRowToMap(headers, record, fieldMap))

		if len(csvChunk) < chunkSize {
			continue
		}

		if err := i.saveCSVChunk(ctx, j, prj, m, s, param, csvChunk, res, operator, &processed, totalCount); err != nil {
			return res.Into(), err
		}
		csvChunk = csvChunk[:0]
	}
	if len(csvChunk) > 0 {
		if err := i.saveCSVChunk(ctx, j, prj, m, s, param, csvChunk, res, operator, &processed, totalCount); err != nil {
			return res.Into(), err
		}
	}

	return res.Into(), nil
}

// countCSVRecords reports the header row and how many data rows follow,
// enforcing MaxImportRecordCount without retaining any row: each record is
// read and immediately discarded, so peak memory here is independent of
// how many rows the file holds. A nil header means the file was empty.
func countCSVRecords(data []byte) ([]string, int, error) {
	reader, lr := newCSVReader(bytes.NewReader(data))

	headers, err := reader.Read()
	if err != nil {
		if err == io.EOF {
			return nil, 0, nil
		}
		return nil, 0, fmt.Errorf("error reading CSV header: %v", err)
	}

	count := 0
	for {
		_, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, 0, fmt.Errorf("error reading CSV row: %v", err)
		}
		if lr.N == 0 {
			return nil, 0, interfaces.ErrImportFileTooLarge
		}
		if count >= interfaces.MaxImportRecordCount {
			return nil, 0, interfaces.ErrImportTooManyRecords
		}
		count++
	}
	return headers, count, nil
}

// saveCSVChunk converts a chunk of CSV rows to items, saves them, and
// publishes job progress. processed is updated in place.
func (i Item) saveCSVChunk(ctx context.Context, j *job.Job, prj *project.Project, m *model.Model, s *schema.Schema, param interfaces.ImportItemsParam, csvChunk []map[string]any, res *ImportRes, operator *usecase.Operator, processed *int, totalCount int) error {
	// Check if job was cancelled
	currentJob, err := i.repos.Job.FindByID(ctx, j.ID())
	if err != nil {
		log.Warnf("item: import job %s failed to check cancellation status: %v", j.ID(), err)
	}
	if currentJob != nil && currentJob.IsCancelled() {
		return fmt.Errorf("job cancelled")
	}

	items, err := itemsParamsFrom(csvChunk, false, nil, param.SP)
	if err != nil {
		return err
	}
	if err := i.saveChunk(ctx, prj, m, s, param, items, res, operator); err != nil {
		return err
	}

	*processed += len(csvChunk)

	// Publish progress
	progress := job.NewProgress(*processed, totalCount)
	state := job.NewState(job.StatusInProgress, &progress, "")
	if i.gateways.JobPubSub != nil {
		if err := i.gateways.JobPubSub.Publish(ctx, j.ID(), state); err != nil {
			log.Warnf("item: import job %s failed to publish progress: %v", j.ID(), err)
		}
	}

	// Update job progress
	j.SetProgress(progress)
	if err := i.repos.Job.Save(ctx, j); err != nil {
		log.Errorf("item: import job %s failed to update progress: %v", j.ID(), err)
	}

	log.Printf("chunk with %d items saved.", len(csvChunk))
	return nil
}

// buildFieldMap creates a mapping from header column name to schema field
func buildFieldMap(headers []string, sp schema.Package) map[string]*schema.Field {
	fieldMap := make(map[string]*schema.Field)
	for _, h := range headers {
		if h == "id" {
			continue
		}
		key := id.NewKey(h)
		if key.IsValid() {
			if f := sp.FieldByIDOrKey(nil, &key); f != nil {
				fieldMap[h] = f
			}
		}
	}
	return fieldMap
}

// csvRowToMap converts a CSV row to a map with typed values
func csvRowToMap(headers []string, record []string, fieldMap map[string]*schema.Field) map[string]any {
	row := make(map[string]any)

	for i, header := range headers {
		if i >= len(record) {
			break
		}
		cellValue := record[i]

		if header == "id" {
			if cellValue != "" {
				row["id"] = cellValue
			}
			continue
		}

		if f, ok := fieldMap[header]; ok {
			typedValue := parseCSVValue(cellValue, f.Type())
			if typedValue != nil {
				row[header] = typedValue
			}
		} else {
			// Unknown field, store as string if not empty
			if cellValue != "" {
				row[header] = cellValue
			}
		}
	}

	return row
}

// parseCSVValue converts a CSV string value to the appropriate typed value
func parseCSVValue(s string, t value.Type) any {
	if s == "" {
		return nil
	}

	switch t {
	case value.TypeText, value.TypeTextArea, value.TypeRichText,
		value.TypeMarkdown, value.TypeSelect, value.TypeTag:
		return s

	case value.TypeURL:
		if u, err := url.Parse(s); err == nil {
			return u.String()
		}
		return nil

	case value.TypeInteger:
		if v, err := strconv.ParseInt(s, 10, 64); err == nil {
			return v
		}
		// Try parsing as float then truncate
		if v, err := strconv.ParseFloat(s, 64); err == nil {
			return int64(v)
		}
		return nil

	case value.TypeNumber:
		if v, err := strconv.ParseFloat(s, 64); err == nil {
			return v
		}
		return nil

	case value.TypeBool, value.TypeCheckbox:
		if v, err := strconv.ParseBool(s); err == nil {
			return v
		}
		return nil

	case value.TypeDateTime:
		// Try RFC3339 first (same format used in export)
		if t, err := time.Parse(time.RFC3339, s); err == nil {
			return t
		}
		// Try RFC3339Nano as fallback
		if t, err := time.Parse(time.RFC3339Nano, s); err == nil {
			return t
		}
		return nil

	default:
		return s
	}
}
