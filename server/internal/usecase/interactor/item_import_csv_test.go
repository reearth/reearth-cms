package interactor

import (
	"strings"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestParseCSVValue(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name      string
		input     string
		valueType value.Type
		expected  any
	}{
		// Empty values
		{"empty string returns nil", "", value.TypeText, nil},

		// Text types
		{"text simple", "hello", value.TypeText, "hello"},
		{"text with spaces", "hello world", value.TypeText, "hello world"},
		{"textarea simple", "multiline\ntext", value.TypeTextArea, "multiline\ntext"},
		{"richtext simple", "<b>bold</b>", value.TypeRichText, "<b>bold</b>"},
		{"markdown simple", "# heading", value.TypeMarkdown, "# heading"},
		{"select simple", "option1", value.TypeSelect, "option1"},
		{"tag simple", "tag1", value.TypeTag, "tag1"},

		// URL
		{"url valid", "https://example.com", value.TypeURL, "https://example.com"},
		{"url with path", "https://example.com/path?query=1", value.TypeURL, "https://example.com/path?query=1"},

		// Integer
		{"integer valid", "42", value.TypeInteger, int64(42)},
		{"integer negative", "-100", value.TypeInteger, int64(-100)},
		{"integer zero", "0", value.TypeInteger, int64(0)},
		{"integer invalid returns nil", "abc", value.TypeInteger, nil},
		{"integer from float truncates", "42.7", value.TypeInteger, int64(42)},
		{"integer from float negative", "-42.3", value.TypeInteger, int64(-42)},

		// Number
		{"number valid", "3.14159", value.TypeNumber, 3.14159},
		{"number integer", "42", value.TypeNumber, float64(42)},
		{"number negative", "-123.456", value.TypeNumber, -123.456},
		{"number zero", "0", value.TypeNumber, float64(0)},
		{"number invalid returns nil", "abc", value.TypeNumber, nil},

		// Bool
		{"bool true", "true", value.TypeBool, true},
		{"bool false", "false", value.TypeBool, false},
		{"bool TRUE", "TRUE", value.TypeBool, true},
		{"bool FALSE", "FALSE", value.TypeBool, false},
		{"bool 1", "1", value.TypeBool, true},
		{"bool 0", "0", value.TypeBool, false},
		{"bool invalid returns nil", "maybe", value.TypeBool, nil},

		// Checkbox (same as bool)
		{"checkbox true", "true", value.TypeCheckbox, true},
		{"checkbox false", "false", value.TypeCheckbox, false},
		{"checkbox 1", "1", value.TypeCheckbox, true},
		{"checkbox 0", "0", value.TypeCheckbox, false},

		// DateTime
		{"datetime rfc3339", "2024-01-15T10:30:00Z", value.TypeDateTime, time.Date(2024, 1, 15, 10, 30, 0, 0, time.UTC)},
		{"datetime rfc3339 with timezone", "2024-01-15T10:30:00+09:00", value.TypeDateTime, func() time.Time { t, _ := time.Parse(time.RFC3339, "2024-01-15T10:30:00+09:00"); return t }()},
		{"datetime invalid returns nil", "not-a-date", value.TypeDateTime, nil},
		{"datetime incomplete returns nil", "2024-01-15", value.TypeDateTime, nil},

		// Unknown type returns string
		{"unknown type returns string", "test", value.Type("unknown"), "test"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := parseCSVValue(tt.input, tt.valueType)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestCsvRowToMap(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		headers  []string
		record   []string
		fieldMap map[string]*schema.Field
		expected map[string]any
	}{
		{
			name:     "simple row with id",
			headers:  []string{"id", "name"},
			record:   []string{"123", "test"},
			fieldMap: map[string]*schema.Field{},
			expected: map[string]any{"id": "123", "name": "test"},
		},
		{
			name:     "row without id",
			headers:  []string{"name", "value"},
			record:   []string{"test", "data"},
			fieldMap: map[string]*schema.Field{},
			expected: map[string]any{"name": "test", "value": "data"},
		},
		{
			name:     "empty id is skipped",
			headers:  []string{"id", "name"},
			record:   []string{"", "test"},
			fieldMap: map[string]*schema.Field{},
			expected: map[string]any{"name": "test"},
		},
		{
			name:     "empty values are skipped",
			headers:  []string{"name", "description"},
			record:   []string{"test", ""},
			fieldMap: map[string]*schema.Field{},
			expected: map[string]any{"name": "test"},
		},
		{
			name:     "more headers than values",
			headers:  []string{"name", "extra"},
			record:   []string{"test"},
			fieldMap: map[string]*schema.Field{},
			expected: map[string]any{"name": "test"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := csvRowToMap(tt.headers, tt.record, tt.fieldMap)
			assert.Equal(t, tt.expected, result)
		})
	}
}

// buildOversizedCSV returns a CSV document (header + n data rows) with n
// tiny rows, e.g. "id,field1\n1,v\n2,v\n...".
func buildOversizedCSV(n int) string {
	var b strings.Builder
	b.WriteString("id,field1\n")
	for i := 0; i < n; i++ {
		b.WriteString("row,v\n")
	}
	return b.String()
}

// buildOversizedCSVPayload returns a header plus a single data row whose
// one cell alone exceeds MaxImportFileSize, isolating the file-size check
// from the record-count check (which this payload stays well under).
func buildOversizedCSVPayload() string {
	var b strings.Builder
	b.WriteString("id,field1\n")
	b.WriteString("row,")
	b.WriteString(strings.Repeat("a", interfaces.MaxImportFileSize+1))
	b.WriteString("\n")
	return b.String()
}

// TestItem_importCSVWithProgress_FileTooLarge guards the local size-cap
// re-enforcement in importCSVWithProgress: it must reject an oversized
// payload itself rather than relying solely on the caller (ImportAsync)
// having already capped it.
func TestItem_importCSVWithProgress_FileTooLarge(t *testing.T) {
	t.Parallel()

	ctx, itemUC, jb, m, sp, op := setupImportWithProgressFixture(t)

	param := interfaces.ImportItemsParam{
		ModelID:      m.ID(),
		SP:           sp,
		Strategy:     interfaces.ImportStrategyTypeInsert,
		Format:       interfaces.ImportFormatTypeCSV,
		MutateSchema: false,
		Reader:       strings.NewReader(buildOversizedCSVPayload()),
	}

	res, err := itemUC.importWithProgress(ctx, jb, param, op)

	require.Error(t, err)
	assert.ErrorIs(t, err, interfaces.ErrImportFileTooLarge)
	assert.Equal(t, interfaces.ImportItemsResponse{}, res)
}

func TestItem_importCSVWithProgress_TooManyRecords(t *testing.T) {
	t.Parallel()

	ctx, itemUC, jb, m, sp, op := setupImportWithProgressFixture(t)

	overLimit := interfaces.MaxImportRecordCount + 1
	payload := buildOversizedCSV(overLimit)

	param := interfaces.ImportItemsParam{
		ModelID:      m.ID(),
		SP:           sp,
		Strategy:     interfaces.ImportStrategyTypeInsert,
		Format:       interfaces.ImportFormatTypeCSV,
		MutateSchema: false,
		Reader:       strings.NewReader(payload),
	}

	res, err := itemUC.importWithProgress(ctx, jb, param, op)

	require.Error(t, err)
	assert.ErrorIs(t, err, interfaces.ErrImportTooManyRecords)
	// The guard fires in the first pass over CSV rows, before any chunk is
	// ever handed to saveChunk, so nothing should have been inserted/updated/ignored.
	assert.Equal(t, interfaces.ImportItemsResponse{}, res)
}

// TestItem_importCSVWithProgress_ProcessesInChunks guards against the
// two-pass "read every row into allRows, then chunk it" shape that only
// bounded record *count*, not memory: a within-limit CSV import must still
// be processed and saved in chunkSize-sized pieces (observable via
// incremental job-progress publishes), never as one giant in-memory batch.
func TestItem_importCSVWithProgress_ProcessesInChunks(t *testing.T) {
	t.Parallel()

	ctx, itemUC, jb, m, sp, op, pubsub := setupImportWithProgressFixtureWithPubSub(t)

	recordCount := chunkSize*2 + chunkSize/2 // 2 full chunks + 1 partial
	payload := buildOversizedCSV(recordCount)

	sub, err := pubsub.Subscribe(ctx, jb.ID())
	require.NoError(t, err)

	param := interfaces.ImportItemsParam{
		ModelID:      m.ID(),
		SP:           sp,
		Strategy:     interfaces.ImportStrategyTypeInsert,
		Format:       interfaces.ImportFormatTypeCSV,
		MutateSchema: false,
		Reader:       strings.NewReader(payload),
	}

	res, err := itemUC.importWithProgress(ctx, jb, param, op)
	require.NoError(t, err)
	assert.Equal(t, recordCount, res.Inserted)

	var processedSteps []int
drain:
	for {
		select {
		case state := <-sub:
			if p := state.Progress(); p != nil {
				processedSteps = append(processedSteps, p.Processed())
			}
		default:
			break drain
		}
	}

	require.Len(t, processedSteps, 3, "expected one progress publish per chunk (2 full + 1 partial)")
	for idx, processed := range processedSteps {
		step := processed
		if idx > 0 {
			step = processed - processedSteps[idx-1]
		}
		assert.LessOrEqual(t, step, chunkSize, "no single progress step should exceed chunkSize, i.e. no chunk held more than chunkSize rows at once")
	}
	assert.Equal(t, recordCount, processedSteps[len(processedSteps)-1])
}
