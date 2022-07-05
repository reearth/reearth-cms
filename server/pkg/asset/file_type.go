package asset

type FileType string

const (
	FileTypeJpeg      FileType = "jpeg"
	FileTypePng       FileType = "png"
	FileTypeTiff      FileType = "tiff"
	FileTypeJson      FileType = "json"
	FileTypeCsv       FileType = "csv"
	FileTypeGeojson   FileType = "geojson"
	FileTypeTopojson  FileType = "topojson"
	FileTypeShapefile FileType = "shapefile"
	FileTypeKml       FileType = "kml"
	FileTypeCzml      FileType = "czml"
	FileTypeGml       FileType = "gml"
	FileTypeGlb       FileType = "glb"
	FileTypeZip       FileType = "zip"
	FileTypeSvg       FileType = "svg"
)
