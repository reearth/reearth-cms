package app

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

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
	GraphQL      GraphQLConfig
	Origins      []string
	DB           string `default:"mongodb://localhost"`
	Mailer       string
	SMTP         SMTPConfig
	SendGrid     SendGridConfig
	SignupSecret string
	GCS          GCSConfig
	AssetBaseURL string `default:"http://localhost:8080/assets"`
	// auth
	Auth          AuthConfigs
	Auth0         Auth0Config
	Auth_ISS      string
	Auth_AUD      string
	Auth_ALG      *string
	Auth_TTL      *int
	Auth_ClientID *string
}

type AuthConfig struct {
	ISS      string
	AUD      []string
	ALG      *string
	TTL      *int
	ClientID *string
}

type GraphQLConfig struct {
	ComplexityLimit int `default:"6000"`
}

type AuthConfigs []AuthConfig

type Auth0Config struct {
	Domain       string
	Audience     string
	ClientID     string
	ClientSecret string
	WebClientID  string
}

type SendGridConfig struct {
	Email string
	Name  string
	API   string
}

type SMTPConfig struct {
	Host         string
	Port         string
	SMTPUsername string
	Email        string
	Password     string
}

type GCSConfig struct {
	BucketName              string
	PublicationCacheControl string
}

func (c Config) Auths() (res []AuthConfig) {
	if ac := c.Auth0.AuthConfig(); ac != nil {
		res = append(res, *ac)
	}
	if c.Auth_ISS != "" {
		var aud []string
		if len(c.Auth_AUD) > 0 {
			aud = append(aud, c.Auth_AUD)
		}
		res = append(res, AuthConfig{
			ISS:      c.Auth_ISS,
			AUD:      aud,
			ALG:      c.Auth_ALG,
			TTL:      c.Auth_TTL,
			ClientID: c.Auth_ClientID,
		})
	}

	return append(res, c.Auth...)
}

func (c Auth0Config) AuthConfig() *AuthConfig {
	domain := c.Domain
	if c.Domain == "" {
		return nil
	}
	if !strings.HasPrefix(domain, "https://") && !strings.HasPrefix(domain, "http://") {
		domain = "https://" + domain
	}
	if !strings.HasSuffix(domain, "/") {
		domain = domain + "/"
	}
	aud := []string{}
	if c.Audience != "" {
		aud = append(aud, c.Audience)
	}
	return &AuthConfig{
		ISS: domain,
		AUD: aud,
	}
}

// Decode is a custom decoder for AuthConfigs
func (ipd *AuthConfigs) Decode(value string) error {
	if value == "" {
		return nil
	}

	var providers []AuthConfig

	err := json.Unmarshal([]byte(value), &providers)
	if err != nil {
		return fmt.Errorf("invalid identity providers json: %w", err)
	}

	*ipd = providers
	return nil
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
