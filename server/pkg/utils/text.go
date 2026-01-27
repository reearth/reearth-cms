package utils

import "golang.org/x/text/unicode/norm"

func NormalizeText(s string) string {
	return norm.NFKC.String(s)
}

type StringFieldType string

const (
	TypeText           StringFieldType = "text"
	TypeTextArea       StringFieldType = "textArea"
	TypeRichText       StringFieldType = "richText"
	TypeMarkdown       StringFieldType = "markdown"
	TypeSelect         StringFieldType = "select"
	TypeTag            StringFieldType = "tag"
	TypeGeometryObject StringFieldType = "geometryObject"
	TypeGeometryEditor StringFieldType = "geometryEditor"
)

func IsStringFieldType(fieldType string) bool {
	textFieldTypes := map[string]bool{
		string(TypeText):           true,
		string(TypeTextArea):       true,
		string(TypeRichText):       true,
		string(TypeMarkdown):       true,
		string(TypeSelect):         true,
		string(TypeTag):            true,
		string(TypeGeometryObject): true,
		string(TypeGeometryEditor): true,
	}
	return textFieldTypes[fieldType]
}

func NormalizeTextValues(fieldType string, values []any) []any {
	if !IsStringFieldType(fieldType) {
		return values
	}

	normalized := make([]any, len(values))
	for i, val := range values {
		if str, ok := val.(string); ok {
			normalized[i] = NormalizeText(str)
		} else {
			normalized[i] = val
		}
	}
	return normalized
}
