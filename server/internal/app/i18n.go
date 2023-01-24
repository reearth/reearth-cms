package app

import (
	"github.com/labstack/echo/v4"
	i18nFS "github.com/reearth/reearth-cms/server/i18n"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/log"
	"golang.org/x/text/language"
)

var (
	localeFS     = i18nFS.LocalsFS
	bundle       *i18n.Bundle
	localizerKey = "localizer"
)

func init() {
	bundle = i18n.NewBundle(language.English)
	err := bundle.LoadFS(localeFS, []string{"en.yml", "ja.yml"})
	if err != nil {
		log.Error("i18n: failed to load locales")
	}
}

func i18nMiddleware(cfg *ServerConfig) echo.MiddlewareFunc {
	return func(handlerFunc echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			lang := c.Request().Header.Get("Accept-Language")
			if lang == "" {
				if op := adapter.Operator(c.Request().Context()); op != nil && op.User != nil {
					u, err := cfg.Repos.User.FindByID(c.Request().Context(), *op.User)
					if err == nil && u.Lang() != language.Und {
						lang = u.Lang().String()
					}
				}
			}
			l := i18n.NewLocalizer(bundle, lang)
			c.Set(localizerKey, l)
			return handlerFunc(c)
		}
	}
}

func getI18nLocalizer(c echo.Context) *i18n.Localizer {
	lz, ok := c.Get(localizerKey).(*i18n.Localizer)
	if ok {
		return lz
	}
	return nil
}
