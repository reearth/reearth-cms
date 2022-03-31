package app

import (
	"os"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
	"github.com/reearth/reearth-cms/server/pkg/log"
)

const configPrefix = "reearth"

type Config struct {
	Port    string `default:"8080" envconfig:"PORT"`
	Dev     bool
	Origins []string
	DB      string `default:"mongodb://localhost"`
}

func ReadConfig(debug bool) (*Config, error) {
	// load .env
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
