package app

import (
	"os"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"

	"github.com/reearth/reearthx/log"
)

const configPrefix = "reearth"

type Config struct {
	Port         string `default:"8080" envconfig:"PORT"`
	ServerHost   string
	Dev          bool
	Host_Web     string
	AssetBaseURL string `default:"http://localhost:8080/assets"`
	GCS          GCSConfig
}

type GCSConfig struct {
	BucketName              string
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
