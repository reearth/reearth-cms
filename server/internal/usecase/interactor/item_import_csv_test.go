package interactor

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
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
		{"datetime rfc3339 with timezone", "2024-01-15T10:30:00+09:00", value.TypeDateTime, time.Date(2024, 1, 15, 10, 30, 0, 0, time.FixedZone("", 9*60*60))},
		{"datetime invalid returns nil", "not-a-date", value.TypeDateTime, nil},
		{"datetime incomplete returns nil", "2024-01-15", value.TypeDateTime, nil},

		// Unknown type returns string
		{"unknown type returns string", "test", value.Type("unknown"), "test"},
	}

	for _, tt := range tests {
		tt := tt
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
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := csvRowToMap(tt.headers, tt.record, tt.fieldMap)
			assert.Equal(t, tt.expected, result)
		})
	}
}
