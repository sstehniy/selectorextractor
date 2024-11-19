package middleware

import (
	"context"
	"net/http"
	"selectorextractor_backend/internal/logging"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/time/rate"
)

type Middleware struct {
	limiter *rate.Limiter
}

func New(requestsPerMinute int) *Middleware {
	return &Middleware{
		limiter: rate.NewLimiter(rate.Every(time.Minute/time.Duration(requestsPerMinute)), requestsPerMinute),
	}
}

func (m *Middleware) RateLimit() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if !m.limiter.Allow() {
				logging.ErrorLogger.Printf("Rate limit exceeded for IP: %s", c.RealIP())
				return c.JSON(http.StatusTooManyRequests, map[string]string{
					"error": "Rate limit exceeded. Please try again later.",
				})
			}
			return next(c)
		}
	}
}

func (m *Middleware) RequestLogger() echo.MiddlewareFunc {
	return middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{
		LogURI:    true,
		LogStatus: true,
		LogValuesFunc: func(c echo.Context, v middleware.RequestLoggerValues) error {
			logging.InfoLogger.Printf("REQUEST: %s %s STATUS: %d LATENCY: %v",
				c.Request().Method, v.URI, v.Status, v.Latency)
			return nil
		},
	})
}

func (m *Middleware) Recover() echo.MiddlewareFunc {
	return middleware.RecoverWithConfig(middleware.RecoverConfig{
		LogLevel: 0,
		LogErrorFunc: func(c echo.Context, err error, stack []byte) error {
			logging.ErrorLogger.Printf("PANIC RECOVERED: %v\nStack: %s", err, string(stack))
			return nil
		},
	})
}

func (m *Middleware) Timeout(timeout time.Duration) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx, cancel := context.WithTimeout(c.Request().Context(), timeout)
			defer cancel()

			done := make(chan error, 1)
			go func() {
				done <- next(c)
			}()

			select {
			case <-ctx.Done():
				logging.ErrorLogger.Printf("Request timeout for %s %s", c.Request().Method, c.Request().URL.Path)
				return c.JSON(http.StatusGatewayTimeout, map[string]string{
					"error": "Request timeout",
				})
			case err := <-done:
				return err
			}
		}
	}
}

func (m *Middleware) CORS(allowedOrigins []string) echo.MiddlewareFunc {
	return middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: allowedOrigins,
		AllowMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodDelete,
			http.MethodOptions,
		},
		AllowHeaders: []string{
			echo.HeaderOrigin,
			echo.HeaderContentType,
			echo.HeaderAccept,
			echo.HeaderAuthorization,
		},
		MaxAge: 86400, // 24 hours
	})
}
