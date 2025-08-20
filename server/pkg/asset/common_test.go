package asset

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExtensionForFormat(t *testing.T) {
	tests := []struct {
		name     string
		format   string
		expected string
	}{
		{"JSON format", "json", ".json"},
		{"GeoJSON format", "geojson", ".geojson"},
		{"CSV format", "csv", ".csv"},
		{"Unknown format", "unknown", ""},
		{"Empty format", "", ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := ExtensionForFormat(tt.format)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestContentTypeForFormat(t *testing.T) {
	tests := []struct {
		name     string
		format   string
		expected string
	}{
		{"JSON format", "json", JSONContentType},
		{"GeoJSON format", "geojson", GeoJSONContentType},
		{"CSV format", "csv", CSVContentType},
		{"Unknown format", "unknown", ""},
		{"Empty format", "", ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := ContentTypeForFormat(tt.format)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestGenerateExportFilename(t *testing.T) {
	tests := []struct {
		name     string
		basename string
		format   string
		expected string
	}{
		{"JSON export", "mymodel", "json", "mymodel.json"},
		{"GeoJSON export", "locations", "geojson", "locations.geojson"},
		{"CSV export", "data", "csv", "data.csv"},
		{"Unknown format", "test", "unknown", "test"},
		{"Empty format", "test", "", "test"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := GenerateExportFilename(tt.basename, tt.format)
			assert.Equal(t, tt.expected, result)
		})
	}
}
