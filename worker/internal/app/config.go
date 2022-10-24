package app

import (
	"os"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"

	"github.com/reearth/reearthx/log"
)

const configPrefix = "REEARTH_CMS_WORKER"

type Config struct {
	Port       string `default:"8080" envconfig:"PORT"`
	ServerHost string
	Dev        bool
	GCS        GCSConfig
	PubSub     PubSubConfig
	GCP        GCPConfig `envconfig:"GCP"`
}

type GCSConfig struct {
	BucketName              string `default:"asset.cms.test.reearth.dev" envconfig:"GCS_BUCKET_NAME"`
	AssetBaseURL            string `default:"https://asset.cms.test.reearth.dev" envconfig:"GCS_ASSET_BASE_URL"`
	PublicationCacheControl string
}

type GCPConfig struct {
	Project string
}

type PubSubConfig struct {
	Topic string `default:"decompress"`
}

func ReadConfig(debug bool) (*Config, error) {
	if err := godotenv.Load(".env"); err != nil && !os.IsNotExist(err) {
		return nil, err
	} else if err == nil {
		log.Infof("config: .env loaded")
	}

	var c Config
	err := envconfig.Process(configPrefix, &c)

	if debug {
		c.Dev = true
	}

	return &c, err
}
