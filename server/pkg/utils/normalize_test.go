package utils

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNormalizeText(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "fullwidth alphanumeric to halfwidth",
			input:    "Ｔｏｋｙｏ２０２４",
			expected: "Tokyo2024",
		},
		{
			name:     "fullwidth symbols",
			input:    "ｆｉｌｅ．ｔｘｔ",
			expected: "file.txt",
		},
		{
			name:     "mixed fullwidth and halfwidth",
			input:    "Tokyo２０２４",
			expected: "Tokyo2024",
		},
		{
			name:     "already normalized text",
			input:    "Tokyo2024",
			expected: "Tokyo2024",
		},
		{
			name:     "empty string",
			input:    "",
			expected: "",
		},
		{
			name:     "unicode with combining characters",
			input:    "café",
			expected: "café",
		},
		{
			name:     "fullwidth katakana space",
			input:    "テスト　ファイル",
			expected: "テスト ファイル",
		},
		{
			name:     "compatibility ideographic space",
			input:    "test　file",
			expected: "test file",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := NormalizeText(tt.input)
			if result != tt.expected {
				t.Errorf("NormalizeText(%q) = %q; want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestIsTextFieldType(t *testing.T) {
	tests := []struct {
		name      string
		fieldType string
		want      bool
	}{
		{"text", "text", true},
		{"textArea", "textArea", true},
		{"richText", "richText", true},
		{"markdown", "markdown", true},
		{"select", "select", true},
		{"tag", "tag", true},
		{"geometryObject", "geometryObject", true},
		{"geometryEditor", "geometryEditor", true},
		{"integer", "integer", false},
		{"number", "number", false},
		{"bool", "bool", false},
		{"asset", "asset", false},
		{"unknown", "unknown", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := value.IsString(tt.fieldType)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestNormalizeTextValues(t *testing.T) {
	tests := []struct {
		name      string
		fieldType string
		input     []any
		expected  []any
	}{
		{
			name:      "text field - fullwidth to halfwidth",
			fieldType: "text",
			input:     []any{"Tokyo２０２４", "test　file"},
			expected:  []any{"Tokyo2024", "test file"},
		},
		{
			name:      "textArea field - decomposed to composed",
			fieldType: "textArea",
			input:     []any{"\u30db\u309a\u30fc\u30eb"}, // ポール decomposed
			expected:  []any{"\u30dd\u30fc\u30eb"},       // ポール composed
		},
		{
			name:      "richText field - fullwidth symbols",
			fieldType: "richText",
			input:     []any{"ｆｉｌｅ．ｔｘｔ"},
			expected:  []any{"file.txt"},
		},
		{
			name:      "markdown field - mixed text",
			fieldType: "markdown",
			input:     []any{"Tokyo２０２４", "already normalized"},
			expected:  []any{"Tokyo2024", "already normalized"},
		},
		{
			name:      "select field - normalization",
			fieldType: "select",
			input:     []any{"Option　１", "Option　２"},
			expected:  []any{"Option 1", "Option 2"},
		},
		{
			name:      "tag field - normalization",
			fieldType: "tag",
			input:     []any{"tag１", "tag２"},
			expected:  []any{"tag1", "tag2"},
		},
		{
			name:      "geometryObject field - normalization",
			fieldType: "geometryObject",
			input:     []any{"Tokyo２０２４"},
			expected:  []any{"Tokyo2024"},
		},
		{
			name:      "geometryEditor field - normalization",
			fieldType: "geometryEditor",
			input:     []any{"Tokyo２０２４"},
			expected:  []any{"Tokyo2024"},
		},
		{
			name:      "non-text field - no normalization",
			fieldType: "integer",
			input:     []any{123, 456},
			expected:  []any{123, 456},
		},
		{
			name:      "number field - no normalization",
			fieldType: "number",
			input:     []any{123.45, 678.90},
			expected:  []any{123.45, 678.90},
		},
		{
			name:      "bool field - no normalization",
			fieldType: "bool",
			input:     []any{true, false},
			expected:  []any{true, false},
		},
		{
			name:      "mixed values - only strings normalized",
			fieldType: "text",
			input:     []any{"Tokyo２０２４", 123, nil},
			expected:  []any{"Tokyo2024", 123, nil},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := NormalizeStringValues(tt.fieldType, tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}
