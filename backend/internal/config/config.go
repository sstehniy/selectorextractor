package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	Server   ServerConfig
	Security SecurityConfig
	AI       AIConfig
}

type ServerConfig struct {
	Port         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	IdleTimeout  time.Duration
}

type SecurityConfig struct {
	AllowedOrigins []string
	RateLimit      RateLimitConfig
}

type RateLimitConfig struct {
	Enabled bool
	Limit   int
	Window  time.Duration
}

type AIConfig struct {
	OpenRouterAPIKey string
	DefaultModel     string
	MaxTokens        int
	Temperature      float32
}

func Load() *Config {
	return &Config{
		Server: ServerConfig{
			Port:         getEnvOrDefault("PORT", "1323"),
			ReadTimeout:  getDurationEnvOrDefault("READ_TIMEOUT", 15*time.Second),
			WriteTimeout: getDurationEnvOrDefault("WRITE_TIMEOUT", 15*time.Second),
		},
		Security: SecurityConfig{
			AllowedOrigins: getSliceEnvOrDefault("ALLOWED_ORIGINS", []string{"*"}),
			RateLimit: RateLimitConfig{
				Enabled: getBoolEnvOrDefault("RATE_LIMIT_ENABLED", true),
				Limit:   getIntEnvOrDefault("RATE_LIMIT", 100),
				Window:  getDurationEnvOrDefault("RATE_LIMIT_WINDOW", time.Minute),
			},
		},
		AI: AIConfig{
			DefaultModel: getEnvOrDefault("DEFAULT_MODEL", "x-ai/grok-3-mini"),
			MaxTokens:    getIntEnvOrDefault("MAX_TOKENS", 8192),
			Temperature:  getFloatEnvOrDefault("TEMPERATURE", 0.4),
		},
	}
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getIntEnvOrDefault(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getFloatEnvOrDefault(key string, defaultValue float32) float32 {
	if value := os.Getenv(key); value != "" {
		if floatValue, err := strconv.ParseFloat(value, 32); err == nil {
			return float32(floatValue)
		}
	}
	return defaultValue
}

func getBoolEnvOrDefault(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

func getDurationEnvOrDefault(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}

func getSliceEnvOrDefault(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		return []string{value}
	}
	return defaultValue
}
