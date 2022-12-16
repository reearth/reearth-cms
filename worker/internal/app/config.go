package app

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"

	"github.com/reearth/reearthx/appx"
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
	AuthM2M    AuthM2MConfig
}

type GCSConfig struct {
	BucketName              string `envconfig:"GCS_BUCKET_NAME"`
	AssetBaseURL            string `envconfig:"GCS_ASSET_BASE_URL"`
	PublicationCacheControl string
}

type GCPConfig struct {
	Project string
}

type PubSubConfig struct {
	Topic string `default:"decompress"`
}

type AuthM2MConfig struct {
	ISS   string
	AUD   []string
	ALG   *string
	TTL   *int
	Email string
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

func (a AuthM2MConfig) JWTProvider() []appx.JWTProvider {
	domain := a.ISS
	if a.ISS == "" {
		return nil
	}
	if !strings.HasPrefix(domain, "https://") && !strings.HasPrefix(domain, "http://") {
		domain = "https://" + domain
	}

	return []appx.JWTProvider{{
		ISS: domain,
		AUD: a.AUD,
		ALG: a.ALG,
		TTL: a.TTL,
	}}
}
