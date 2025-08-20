package asset

import (
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

var (
	ErrNoProjectID = rerror.NewE(i18n.T("projectID is required"))
	ErrZeroSize    = rerror.NewE(i18n.T("file size cannot be zero"))
	ErrNoUser      = rerror.NewE(i18n.T("createdBy is required"))
	ErrNoThread    = rerror.NewE(i18n.T("thread is required"))
	ErrNoUUID      = rerror.NewE(i18n.T("uuid is required"))

	// Content Types
	GeoJSONContentType = "application/geo+json"
	JSONContentType    = "application/json"
	CSVContentType     = "text/csv"
)

// ExtensionForFormat returns the file extension for the given export format
func ExtensionForFormat(format string) string {
	switch format {
	case "json":
		return ".json"
	case "geojson":
		return ".geojson"
	case "csv":
		return ".csv"
	default:
		return ""
	}
}

// ContentTypeForFormat returns the MIME content type for the given export format
func ContentTypeForFormat(format string) string {
	switch format {
	case "json":
		return JSONContentType
	case "geojson":
		return GeoJSONContentType
	case "csv":
		return CSVContentType
	default:
		return ""
	}
}

// GenerateExportFilename generates a filename for export based on the given name and format
func GenerateExportFilename(name string, format string) string {
	ext := ExtensionForFormat(format)
	if ext == "" {
		return name
	}
	return name + ext
}
