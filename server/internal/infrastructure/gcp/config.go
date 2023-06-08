package gcp

type TaskConfig struct {
	GCPProject          string
	GCPRegion           string
	Topic               string
	GCSHost             string
	GCSBucket           string
	DecompressorImage   string `default:"reearth/reearth-cms-decompressor"`
	DecompressorTopic   string `default:"decompress"`
	DecompressorGzipExt string `default:"gml"`
}
