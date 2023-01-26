package app

import (
	"context"

	"github.com/labstack/echo/v4"
	i18nFS "github.com/reearth/reearth-cms/server/i18n"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/log"
	"golang.org/x/text/language"
)

var (
	// rerror
	_ = i18n.T("not found")
	_ = i18n.T("internal")
	_ = i18n.T("invalid params")
	_ = i18n.T("not implemented")

	localeFS     = i18nFS.LocalsFS
	bundle       *i18n.Bundle
	localizerKey = localizerKeyType{}
)

type localizerKeyType struct{}

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
			req := c.Request()
			ctx := req.Context()
			lang := req.Header.Get("Accept-Language")
			if lang == "" {
				if op := adapter.Operator(ctx); op != nil && op.User != nil {
					u, err := cfg.Repos.User.FindByID(ctx, *op.User)
					if err == nil && u.Lang() != language.Und {
						lang = u.Lang().String()
					}
				}
			}
			l := i18n.NewLocalizer(bundle, lang)
			ctx = context.WithValue(ctx, localizerKey, l)
			c.SetRequest(req.WithContext(ctx))
			return handlerFunc(c)
		}
	}
}

func getI18nLocalizer(c context.Context) *i18n.Localizer {
	lz, ok := c.Value(localizerKey).(*i18n.Localizer)
	if ok {
		return lz
	}
	return nil
}
