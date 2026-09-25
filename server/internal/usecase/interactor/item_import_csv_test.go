package interactor

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/job"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
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

func csvTestSchema(keys ...string) *schema.Schema {
	fields := lo.Map(keys, func(k string, _ int) *schema.Field {
		return schema.NewField(schema.NewText(nil).TypeProperty()).NewID().Key(id.NewKey(k)).MustBuild()
	})
	return schema.New().NewID().Workspace(accountdomain.NewWorkspaceID()).Project(id.NewProjectID()).Fields(fields).MustBuild()
}

func TestBuildFieldMap(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name            string
		headers         []string
		schemaKeys      []string
		wantFieldMapLen int
		wantColumns     []interfaces.ImportColumnResult
	}{
		{
			name:            "all columns matched",
			headers:         []string{"name", "count"},
			schemaKeys:      []string{"name", "count"},
			wantFieldMapLen: 2,
			wantColumns: []interfaces.ImportColumnResult{
				{Header: "name", Status: interfaces.ImportColumnStatusMatched, SchemaFieldKey: new("name")},
				{Header: "count", Status: interfaces.ImportColumnStatusMatched, SchemaFieldKey: new("count")},
			},
		},
		{
			name:            "one column skipped",
			headers:         []string{"name", "unknown_col"},
			schemaKeys:      []string{"name", "count"},
			wantFieldMapLen: 1,
			wantColumns: []interfaces.ImportColumnResult{
				{Header: "name", Status: interfaces.ImportColumnStatusMatched, SchemaFieldKey: new("name")},
				{Header: "unknown_col", Status: interfaces.ImportColumnStatusSkipped, Reason: new("no matching schema field for header 'unknown_col'")},
			},
		},
		{
			name:            "multiple columns skipped",
			headers:         []string{"name", "a_col", "b_col"},
			schemaKeys:      []string{"name"},
			wantFieldMapLen: 1,
			wantColumns: []interfaces.ImportColumnResult{
				{Header: "name", Status: interfaces.ImportColumnStatusMatched, SchemaFieldKey: new("name")},
				{Header: "a_col", Status: interfaces.ImportColumnStatusSkipped, Reason: new("no matching schema field for header 'a_col'")},
				{Header: "b_col", Status: interfaces.ImportColumnStatusSkipped, Reason: new("no matching schema field for header 'b_col'")},
			},
		},
		{
			name:            "reserved id column is not reported",
			headers:         []string{"id", "name"},
			schemaKeys:      []string{"name"},
			wantFieldMapLen: 1,
			wantColumns: []interfaces.ImportColumnResult{
				{Header: "name", Status: interfaces.ImportColumnStatusMatched, SchemaFieldKey: new("name")},
			},
		},
		{
			name:            "invalid key header skipped",
			headers:         []string{"", "name"},
			schemaKeys:      []string{"name"},
			wantFieldMapLen: 1,
			wantColumns: []interfaces.ImportColumnResult{
				{Header: "", Status: interfaces.ImportColumnStatusSkipped, Reason: new("no matching schema field for header ''")},
				{Header: "name", Status: interfaces.ImportColumnStatusMatched, SchemaFieldKey: new("name")},
			},
		},
		{
			name:            "no headers",
			headers:         nil,
			schemaKeys:      []string{"name"},
			wantFieldMapLen: 0,
			wantColumns:     []interfaces.ImportColumnResult{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			s := csvTestSchema(tt.schemaKeys...)
			sp := schema.NewPackage(s, nil, nil, nil)

			fieldMap, columns := buildFieldMap(tt.headers, *sp)

			assert.Len(t, fieldMap, tt.wantFieldMapLen)
			assert.Equal(t, tt.wantColumns, columns)
			for h, f := range fieldMap {
				assert.Equal(t, h, f.Key().String())
			}
		})
	}
}

// csvImportTestEnv sets up an item usecase with a model whose schema has the given field keys.
func csvImportTestEnv(t *testing.T, schemaKeys ...string) (*Item, *repo.Container, schema.Package, *usecase.Operator) {
	t.Helper()

	s := csvTestSchema(schemaKeys...)
	prj := project.New().ID(s.Project()).Workspace(s.Workspace()).MustBuild()
	m := model.New().NewID().Schema(s.ID()).Key(id.RandomKey()).Project(s.Project()).MustBuild()

	ctx := context.Background()
	db := memory.New()
	lo.Must0(db.Project.Save(ctx, prj))
	lo.Must0(db.Schema.Save(ctx, s))
	lo.Must0(db.Model.Save(ctx, m))

	itemUC := NewItem(db, &gateway.Container{})
	itemUC.ignoreEvent = true

	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               accountdomain.NewUserID().Ref(),
			ReadableWorkspaces: []accountdomain.WorkspaceID{s.Workspace()},
			WritableWorkspaces: []accountdomain.WorkspaceID{s.Workspace()},
		},
		ReadableProjects: []id.ProjectID{s.Project()},
		WritableProjects: []id.ProjectID{s.Project()},
	}

	return itemUC, db, *schema.NewPackage(s, nil, nil, nil), op
}

type csvColumnCase struct {
	name        string
	schemaKeys  []string
	content     string
	wantTotal   int
	wantColumns []interfaces.ImportColumnResult
}

func csvColumnCases() []csvColumnCase {
	return []csvColumnCase{
		{
			name:       "all columns matched",
			schemaKeys: []string{"name", "count"},
			content:    "name,count\nItem 1,10\nItem 2,20",
			wantTotal:  2,
			wantColumns: []interfaces.ImportColumnResult{
				{Header: "name", Status: interfaces.ImportColumnStatusMatched, SchemaFieldKey: new("name")},
				{Header: "count", Status: interfaces.ImportColumnStatusMatched, SchemaFieldKey: new("count")},
			},
		},
		{
			name:       "one column skipped",
			schemaKeys: []string{"name", "count"},
			content:    "name,unknown_col\nItem 1,ignored",
			wantTotal:  1,
			wantColumns: []interfaces.ImportColumnResult{
				{Header: "name", Status: interfaces.ImportColumnStatusMatched, SchemaFieldKey: new("name")},
				{Header: "unknown_col", Status: interfaces.ImportColumnStatusSkipped, Reason: new("no matching schema field for header 'unknown_col'")},
			},
		},
		{
			name:       "multiple columns skipped",
			schemaKeys: []string{"name"},
			content:    "name,a_col,b_col\nItem 1,x,y",
			wantTotal:  1,
			wantColumns: []interfaces.ImportColumnResult{
				{Header: "name", Status: interfaces.ImportColumnStatusMatched, SchemaFieldKey: new("name")},
				{Header: "a_col", Status: interfaces.ImportColumnStatusSkipped, Reason: new("no matching schema field for header 'a_col'")},
				{Header: "b_col", Status: interfaces.ImportColumnStatusSkipped, Reason: new("no matching schema field for header 'b_col'")},
			},
		},
	}
}

func TestItem_Import_CSVColumns(t *testing.T) {
	t.Parallel()

	for _, tt := range csvColumnCases() {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			itemUC, _, sp, op := csvImportTestEnv(t, tt.schemaKeys...)
			m := lo.Must(itemUC.repos.Model.FindBySchema(context.Background(), sp.Schema().ID()))

			res, err := itemUC.Import(context.Background(), interfaces.ImportItemsParam{
				ModelID:  m.ID(),
				SP:       sp,
				Strategy: interfaces.ImportStrategyTypeInsert,
				Format:   interfaces.ImportFormatTypeCSV,
				Reader:   strings.NewReader(tt.content),
			}, op)

			assert.NoError(t, err)
			assert.Equal(t, tt.wantColumns, res.Columns)
			// existing fields are untouched
			assert.Equal(t, tt.wantTotal, res.Total)
			assert.Equal(t, tt.wantTotal, res.Inserted)
			assert.Equal(t, 0, res.Updated)
			assert.Equal(t, 0, res.Ignored)
			assert.Nil(t, res.NewFields)
		})
	}
}

func TestItem_ImportAsync_CSVColumns(t *testing.T) {
	t.Parallel()

	for _, tt := range csvColumnCases() {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			itemUC, db, sp, op := csvImportTestEnv(t, tt.schemaKeys...)
			m := lo.Must(db.Model.FindBySchema(ctx, sp.Schema().ID()))

			j := job.New().
				NewID().
				Type(job.TypeImport).
				Project(sp.Schema().Project()).
				User(*op.AcOperator.User).
				MustBuild()
			lo.Must0(db.Job.Save(ctx, j))

			itemUC.runImportJob(j.ID(), interfaces.ImportItemsAsyncParam{
				ModelID:  m.ID(),
				SP:       sp,
				Strategy: interfaces.ImportStrategyTypeInsert,
				Format:   interfaces.ImportFormatTypeCSV,
				Reader:   strings.NewReader(tt.content),
			}, op)

			// the column detail is retrievable from the completed job
			completed, err := db.Job.FindByID(ctx, j.ID())
			assert.NoError(t, err)
			assert.Equal(t, job.StatusCompleted, completed.Status())

			result, err := completed.ImportResult()
			assert.NoError(t, err)
			wantColumns := lo.Map(tt.wantColumns, func(c interfaces.ImportColumnResult, _ int) job.ImportColumnResult {
				return job.ImportColumnResult{
					Header:         c.Header,
					Status:         string(c.Status),
					SchemaFieldKey: c.SchemaFieldKey,
					Reason:         c.Reason,
				}
			})
			assert.Equal(t, wantColumns, result.Columns)
			// existing fields are untouched
			assert.Equal(t, tt.wantTotal, result.Total)
			assert.Equal(t, tt.wantTotal, result.Inserted)
			assert.Equal(t, 0, result.Updated)
			assert.Equal(t, 0, result.Ignored)
		})
	}
}
