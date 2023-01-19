package app

import (
	"embed"

	"github.com/labstack/echo/v4"
	"github.com/nicksnyder/go-i18n/v2/i18n"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearthx/log"
	"golang.org/x/text/language"
	"gopkg.in/yaml.v3"
)

var (
	//go:embed i18n/locale.*.yaml
	localeFS     embed.FS
	bundle       *i18n.Bundle
	localizerKey string = "localizer"
)

func init() {
	bundle = i18n.NewBundle(language.English)
	bundle.RegisterUnmarshalFunc("yaml", yaml.Unmarshal)
	_, err := bundle.LoadMessageFileFS(localeFS, "i18n/locale.ja.yaml")
	if err != nil {
		log.Error("i18n: failed to load locales")
	}

}

func I18n(cfg *ServerConfig) echo.MiddlewareFunc {
	return func(handlerFunc echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			var lang string
			if op := adapter.Operator(c.Request().Context()); op != nil && op.User != nil {
				u, err := cfg.Repos.User.FindByID(c.Request().Context(), *op.User)
				if err == nil && u.Lang() != language.Und {
					lang = u.Lang().String()
				}
			}
			if lang == "" {
				lang = c.Request().Header.Get("Accept-Language")
			}
			l := i18n.NewLocalizer(bundle, lang)
			c.Set(localizerKey, l)
			return handlerFunc(c)
		}
	}
}

func t(c echo.Context) *i18n.Localizer {
	lz, ok := c.Get(localizerKey).(*i18n.Localizer)
	if ok {
		return lz
	}
	return nil
}
