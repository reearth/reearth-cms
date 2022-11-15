package app

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/log"
)

type WebConfig map[string]string

func webConfig(e *echo.Echo, wc WebConfig, a []AuthConfig) {
	config := map[string]string{}
	if len(a) > 0 {
		ac := a[0]
		if ac.ISS != "" {
			config["auth0Domain"] = strings.TrimSuffix(ac.ISS, "/")
		}
		if ac.ClientID != nil {
			config["auth0ClientId"] = *ac.ClientID
		}
		if len(ac.AUD) > 0 {
			config["auth0Audience"] = ac.AUD[0]
		}
	}
	for k, v := range wc {
		config[k] = v
	}

	e.GET("/reearth_config.json", func(c echo.Context) error {
		return c.JSON(http.StatusOK, config)
	})

	log.Printf("web: ReEarth web config endpoint is available")
}
