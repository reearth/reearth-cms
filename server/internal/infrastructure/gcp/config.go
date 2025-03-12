package gcp

type TaskConfig struct {
	GCPProject              string `pp:",omitempty"`
	GCPRegion               string `pp:",omitempty"`
	Topic                   string `pp:",omitempty"`
	GCSHost                 string `pp:",omitempty"`
	GCSBucket               string `pp:",omitempty"`
	DecompressorImage       string `default:"reearth/reearth-cms-decompressor"`
	DecompressorTopic       string `default:"decompress"`
	DecompressorGzipExt     string `default:"gml"`
	DecompressorMachineType string `default:"E2_HIGHCPU_8"`
	DecompressorDiskSideGb  int64  `default:"2000"`
	CopierImage             string `default:"reearth/reearth-cms-copier"`
	DBSecretName            string `default:"reearth-cms-db"`
	AccountDBSecretName     string `default:"reearth-cms-db-users"`
	DBName                  string `pp:",omitempty"`
	AccountDBName           string `pp:",omitempty"`
	CmsImage                string `default:"reearth/reearth-cms"`
	BuildServiceAccount     string `pp:",omitempty"`
	WorkerPool              string `pp:",omitempty"`
}
