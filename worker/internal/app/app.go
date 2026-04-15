package app

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/labstack/echo-opentelemetry"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	sns "github.com/robbiet480/go.sns"
)

func initEcho(_ context.Context, cfg *ServerConfig, handler *Handler) *echo.Echo {
	if cfg.Config == nil {
		log.Fatalf("ServerConfig.Config is nil")
	}

	e := echo.New()
	e.HTTPErrorHandler = errorHandler(echo.DefaultHTTPErrorHandler(false))

	logger := log.New()
	e.Logger = log.NewSlogLogger(logger)
	e.Use(
		log.AccessLoggerV5(logger),
		middleware.Recover(),
		echootel.NewMiddleware("reearth-cms/worker"),
	)

	awsSNSSubscriptionConfirmationMiddleware := awsSNSSubscriptionConfirmationMiddleware()

	api := e.Group("/api")

	api.GET("/ping", func(c *echo.Context) error { return c.JSON(http.StatusOK, "pong") })

	e.GET("/health", HealthCheck(cfg.Config, cfg.Version))

	t := handler.DecompressHandler()
	api.POST("/decompress", t, awsSNSSubscriptionConfirmationMiddleware)

	wh := handler.WebhookHandler()
	api.POST("/webhook", wh, awsSNSSubscriptionConfirmationMiddleware)

	return e
}

func errorMessage(err error, log func(string, ...interface{})) (int, string) {
	if httpErr, ok := errors.AsType[*echo.HTTPError](err); ok {
		if httpErr.Unwrap() != nil {
			log("echo internal err: %+v", httpErr)
		}
		return httpErr.Code, httpErr.Message
	}

	var sc echo.HTTPStatusCoder
	if errors.As(err, &sc) {
		if code := sc.StatusCode(); code != 0 {
			return code, http.StatusText(code)
		}
	}

	if errors.Is(err, rerror.ErrNotFound) {
		return http.StatusNotFound, "not found"
	}

	log("echo internal err: %+v", err)
	return http.StatusInternalServerError, "internal server error"
}

func errorHandler(next echo.HTTPErrorHandler) echo.HTTPErrorHandler {
	return func(c *echo.Context, err error) {
		resp, _ := echo.UnwrapResponse(c.Response())
		if resp != nil && resp.Committed {
			return
		}

		code, msg := errorMessage(err, func(f string, args ...interface{}) {
			log.Errorf(f, args...)
		})
		if err := c.JSON(code, map[string]string{
			"error": msg,
		}); err != nil {
			next(c, err)
		}
	}
}

func handleSubscriptionConfirmation(c *echo.Context) error {
	var payload sns.Payload
	if err := json.NewDecoder(c.Request().Body).Decode(&payload); err != nil {
		log.Errorf("failed to decode request body: %s", err.Error())
		return err
	}

	_, err := payload.Subscribe()
	if err != nil {
		log.Errorf("failed to subscribe confirmation: %s", err.Error())
		return err
	}

	return c.JSON(http.StatusOK, "OK")
}

func awsSNSSubscriptionConfirmationMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			if c.Request().Header.Get("X-Amz-Sns-Message-Type") == "SubscriptionConfirmation" {
				return handleSubscriptionConfirmation(c)
			}
			return next(c)
		}
	}
}
