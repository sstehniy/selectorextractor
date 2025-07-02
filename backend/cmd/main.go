package main

import (
	"fmt"
	"log"
	"net/http"
	"selectorextractor_backend/internal/config"
	"selectorextractor_backend/internal/handlers"
	"selectorextractor_backend/internal/logging"
	"selectorextractor_backend/internal/middleware"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
)

func main() {
	// Initialize logging
	if err := logging.InitLoggers(); err != nil {
		log.Fatalf("Failed to initialize loggers: %v", err)
	}

	// Load environment variables
	if err := godotenv.Load(); err != nil {
		logging.ErrorLogger.Printf("Error loading .env file: %v", err)
	}

	// Load configuration
	cfg := config.Load()

	// Initialize Echo
	e := echo.New()

	// Initialize middleware
	m := middleware.New(cfg.Security.RateLimit.Limit)

	// Apply middleware
	e.Use(m.RequestLogger())
	e.Use(m.Recover())
	e.Use(m.Timeout(cfg.Server.WriteTimeout))
	e.Use(m.CORS(cfg.Security.AllowedOrigins))

	if cfg.Security.RateLimit.Enabled {
		e.Use(m.RateLimit())
	}

	// API v1 routes
	v1 := e.Group("/api/v1")
	{
		v1.GET("/health", handlers.HandleHealthCheck)
		v1.POST("/extract", func(c echo.Context) error {
			logging.InfoLogger.Println("Received extraction request")
			return handlers.HandleExtractionRequest(c, cfg.AI)
		})
	}

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	logging.InfoLogger.Printf("Server starting on port %s", cfg.Server.Port)

	s := &http.Server{
		Addr:         addr,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
		IdleTimeout:  cfg.Server.IdleTimeout,
	}

	if err := e.StartServer(s); err != nil {
		logging.ErrorLogger.Fatalf("Server failed to start: %v", err)
	}
}
