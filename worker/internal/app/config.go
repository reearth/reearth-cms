package app

import (
	"os"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"

	"github.com/reearth/reearthx/log"
)

const configPrefix = "reearthCmsWorker"

type Config struct {
	Port       string `default:"8080" envconfig:"PORT"`
	ServerHost string
	Dev        bool
	GCS        GCSConfig
}

type GCSConfig struct {
	BucketName              string `default:"asset.cms.test.reearth.dev" envconfig:"GCS_BUCKET_NAME"` //TODO: fix here later
	AssetBaseURL            string `default:"https://asset.cms.test.reearth.dev" envconfig:"GCS_ASSET_BASE_URL"`
	PublicationCacheControl string
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
