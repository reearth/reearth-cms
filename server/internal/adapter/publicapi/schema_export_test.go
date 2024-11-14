package publicapi

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestDetermineTypeAndFormat(t *testing.T) {
	tests := []struct {
		input    value.Type
		wantType string
		wantFmt  string
	}{
		{value.TypeText, "string", ""},
		{value.TypeTextArea, "string", ""},
		{value.TypeRichText, "string", ""},
		{value.TypeMarkdown, "string", ""},
		{value.TypeSelect, "string", ""},
		{value.TypeTag, "string", ""},
		{value.TypeReference, "string", ""},
		{value.TypeInteger, "integer", ""},
		{value.TypeNumber, "number", ""},
		{value.TypeBool, "boolean", ""},
		{value.TypeDateTime, "string", "date-time"},
		{value.TypeURL, "string", "uri"},
		{value.TypeAsset, "string", "binary"},
		{value.TypeGroup, "array", ""},
		{value.TypeGeometryObject, "object", ""},
		{value.TypeGeometryEditor, "object", ""},
		{"unknown", "string", ""},
	}

	for _, tt := range tests {
		t.Run(string(tt.input), func(t *testing.T) {
			gotType, gotFmt := determineTypeAndFormat(tt.input)
			assert.Equal(t, tt.wantType, gotType)
			assert.Equal(t, tt.wantFmt, gotFmt)
		})
	}
}
