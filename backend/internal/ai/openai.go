package ai

import (
	"os"

	"github.com/sashabaranov/go-openai"
)

// GetOpenAIClient returns an OpenAI client configured for OpenRouter
func GetOpenAIClient() *openai.Client {
	apiKey := os.Getenv("OPENROUTER_API_KEY")
	if apiKey == "" {
		panic("OPENROUTER_API_KEY environment variable is not set")
	}

	config := openai.DefaultConfig(apiKey)
	config.BaseURL = "https://openrouter.ai/api/v1"

	return openai.NewClientWithConfig(config)
}
