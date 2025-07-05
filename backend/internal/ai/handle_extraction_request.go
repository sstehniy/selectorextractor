package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"selectorextractor_backend/internal/config"
	"selectorextractor_backend/internal/logging"
	"strings"

	"github.com/revrost/go-openrouter"
	"github.com/revrost/go-openrouter/jsonschema"
)

func getSystemPrompt() string {
	prompt, err := os.ReadFile("internal/ai/SYSTEM_PROMPT.txt")
	if err != nil {
		panic(err)
	}
	return string(prompt)
}

func getPrompt() string {
	prompt, err := os.ReadFile("internal/ai/PROMPT.txt")
	if err != nil {
		panic(err)
	}
	return string(prompt)
}

type FieldToExtractSelectorsFor struct {
	Name           string `json:"name"`
	Type           string `json:"type"`
	AdditionalInfo string `json:"additionalInfo"`
}

var MODEL_LIST = []string{
	"x-ai/grok-3-mini",
	"google/gemini-2.5-flash",
	"google/gemini-2.5-flash-preview-05-20",
	"google/gemini-2.5-flash-lite-preview-06-17",
	"google/gemini-2.5-pro",
}

type ModelPrice struct {
	InputTokens  float64 `json:"input_tokens"`
	OutputTokens float64 `json:"output_tokens"`
}

var MODEL_PRICE_MAP = map[string]ModelPrice{
	"x-ai/grok-3-mini": {
		InputTokens:  0.3,
		OutputTokens: 0.5,
	},
	"google/gemini-2.5-flash": {
		InputTokens:  0.3,
		OutputTokens: 2.5,
	},
	"google/gemini-2.5-flash-preview-05-20": {
		InputTokens:  0.15,
		OutputTokens: 0.6,
	},
	"google/gemini-2.5-flash-lite-preview-06-17": {
		InputTokens:  0.1,
		OutputTokens: 0.4,
	},
	"google/gemini-2.5-pro": {
		InputTokens:  1.25,
		OutputTokens: 10,
	},
}

type SendExtractionMessageRequest struct {
	HTML                        string                       `json:"html"`
	FieldsToExtractSelectorsFor []FieldToExtractSelectorsFor `json:"fieldsToExtractSelectorsFor"`
	Model                       string                       `json:"model"`
}

type TokenUsage struct {
	InputTokens  int `json:"input_tokens"`
	OutputTokens int `json:"output_tokens"`
}

type OpenRouterResponseSchema struct {
	Fields []ExtractedSelector `json:"fields"`
}

type SendExtractionMessageResponse struct {
	Fields            []ExtractedSelector `json:"fields"`
	Usage             TokenUsage          `json:"usage"`
	PriceInputTokens  float64             `json:"priceInputTokens"`
	PriceOutputTokens float64             `json:"priceOutputTokens"`
	TotalPrice        float64             `json:"totalPrice"`
	Model             string              `json:"model"`
}

type FieldAnalysis struct {
	Observations            []string `json:"observations"`
	SelectorsConsidered     []string `json:"selectorsConsidered"`
	ChosenSelectorRationale string   `json:"chosenSelectorRationale"`
}

type ExtractedSelector struct {
	FieldAnalysis        FieldAnalysis `json:"fieldAnalysis"`
	Field                string        `json:"field"`
	Selector             string        `json:"selector"`
	AttributeToGet       string        `json:"attributeToGet"`
	Regex                string        `json:"regex"`
	RegexMatchIndexToUse int           `json:"regexMatchIndexToUse"`
	ExtractMethod        string        `json:"extractMethod"`
	RegexUse             string        `json:"regexUse"`
	JavaScriptFunction   string        `json:"javaScriptFunction"`
	TypeScriptFunction   string        `json:"typeScriptFunction"`
	PythonFunction       string        `json:"pythonFunction"`
	GoFunction           string        `json:"goFunction"`
}

func createEmptyResponse(model string, usage TokenUsage) SendExtractionMessageResponse {
	priceInputTokens := float64(usage.InputTokens) / 1_000_000 * MODEL_PRICE_MAP[model].InputTokens
	priceOutputTokens := float64(usage.OutputTokens) / 1_000_000 * MODEL_PRICE_MAP[model].OutputTokens

	return SendExtractionMessageResponse{
		Fields:            []ExtractedSelector{},
		Usage:             usage,
		PriceInputTokens:  priceInputTokens,
		PriceOutputTokens: priceOutputTokens,
		TotalPrice:        priceInputTokens + priceOutputTokens,
		Model:             model,
	}
}

const MAX_TRIES = 3

func SendExtractionMessageOpenAI(request SendExtractionMessageRequest, apiKey string, config config.AIConfig) (SendExtractionMessageResponse, error) {
	// If no model specified, use a default model order
	model := request.Model
	if model == "" {
		model = MODEL_LIST[0]
	}

	try_count := 0
	total_input_tokens := 0
	total_output_tokens := 0
	var err error
	for try_count < MAX_TRIES {
		fmt.Println("Attempt", try_count+1)
		response, err := attemptExtractionWithModel(request, apiKey, config)
		if err == nil {
			fmt.Println("Success")
			return response, nil
		} else {
			fmt.Println("Error", err)
			total_input_tokens += response.Usage.InputTokens
			total_output_tokens += response.Usage.OutputTokens
			try_count++
		}
	}
	fmt.Println("Failed")
	// If it fails, return the last error
	return createEmptyResponse(request.Model, TokenUsage{
			InputTokens:  total_input_tokens,
			OutputTokens: total_output_tokens,
		}),
		fmt.Errorf("extraction failed with all models: last error was %v", err)
}

// New helper function to attempt extraction with a single model
func attemptExtractionWithModel(request SendExtractionMessageRequest, apiKey string, config config.AIConfig) (SendExtractionMessageResponse, error) {
	if apiKey == "" {
		return createEmptyResponse(request.Model, TokenUsage{}),
			fmt.Errorf("API key is required")
	}
	// Validate the model is in the allowed list
	var modelFound bool
	for _, allowedModel := range MODEL_LIST {
		if request.Model == allowedModel {
			modelFound = true
			break
		}
	}
	if !modelFound {
		return createEmptyResponse(request.Model, TokenUsage{}),
			fmt.Errorf("unsupported model: %s", request.Model)
	}

	// Existing extraction logic from the original function
	fieldsToExtractBytes, err := json.Marshal(request.FieldsToExtractSelectorsFor)
	if err != nil {
		logging.ErrorLogger.Printf("Failed to marshal fields to extract: %v", err)
		return createEmptyResponse(request.Model, TokenUsage{}), err
	}
	fieldsToExtractString := string(fieldsToExtractBytes)

	client := openrouter.NewClient(apiKey)
	systemPrompt := getSystemPrompt()
	prompt := getPrompt()

	prompt = strings.Replace(prompt, "{{HTML}}", request.HTML, 1)
	prompt = strings.Replace(prompt, "{{FIELDS_TO_EXTRACT}}", fieldsToExtractString, 1)

	logging.InfoLogger.Printf("Sending request to AI API with %d characters of HTML using model %s",
		len(request.HTML), request.Model)

	messages := []openrouter.ChatCompletionMessage{
		{
			Role: openrouter.ChatMessageRoleSystem,
			Content: openrouter.Content{
				Text: systemPrompt,
			},
		},
		{
			Role: openrouter.ChatMessageRoleUser,
			Content: openrouter.Content{
				Text: prompt,
			},
		},
	}

	var response OpenRouterResponseSchema
	schema, err := jsonschema.GenerateSchemaForType(response)
	if err != nil {
		logging.ErrorLogger.Printf("Failed to generate schema for type: %v", err)
		return createEmptyResponse(request.Model, TokenUsage{}), err
	}

	maxReasoningTokens := 5000
	exclude := false
	sorting := openrouter.ProviderSortingThroughput
	if request.Model == "x-ai/grok-3-mini" {
		sorting = openrouter.ProviderSortingPrice
	}
	resp, err := client.CreateChatCompletion(
		context.Background(),
		openrouter.ChatCompletionRequest{
			Model:    request.Model,
			Messages: messages,
			ResponseFormat: &openrouter.ChatCompletionResponseFormat{
				Type: openrouter.ChatCompletionResponseFormatTypeJSONSchema,
				JSONSchema: &openrouter.ChatCompletionResponseFormatJSONSchema{
					Name:        "extraction_response",
					Strict:      true,
					Description: "The response from the AI API",
					Schema:      schema,
				},
			},
			Provider: &openrouter.ChatProvider{
				DataCollection: openrouter.DataCollectionAllow,
				Sort:           sorting,
			},
			Reasoning: &openrouter.ChatCompletionReasoning{
				MaxTokens: &maxReasoningTokens,
				Exclude:   &exclude,
			},
			MaxTokens:   config.MaxTokens,
			Temperature: config.Temperature,
		},
	)
	if err != nil {
		logging.ErrorLogger.Printf("AI API request failed for model %s: %v", request.Model, err)
		return createEmptyResponse(request.Model, TokenUsage{}), err
	}

	usage := TokenUsage{
		InputTokens:  resp.Usage.PromptTokens,
		OutputTokens: resp.Usage.CompletionTokens,
	}

	b, _ := json.MarshalIndent(resp, "", "\t")
	log.Printf("Response: %s", string(b))
	responseBytes, err := json.MarshalIndent(resp, "", "  ")
	if err != nil {
		logging.ErrorLogger.Printf("Failed to marshal response: %v", err)
		return createEmptyResponse(request.Model, usage), fmt.Errorf("failed to marshal response: %v", err)
	}
	err = os.WriteFile("response.json", responseBytes, 0644)
	if err != nil {
		logging.ErrorLogger.Printf("Failed to save response to file: %v", err)
		return createEmptyResponse(request.Model, usage), fmt.Errorf("failed to save response: %v", err)
	}

	jsonStr := resp.Choices[0].Message.Content.Text

	err = json.Unmarshal([]byte(jsonStr), &response)
	if err != nil {
		logging.ErrorLogger.Printf("Failed to unmarshal response JSON: %v", err)
		return createEmptyResponse(request.Model, usage), fmt.Errorf("failed to unmarshal response: %v", err)
	}

	priceInputTokens := float64(resp.Usage.PromptTokens) / 1_000_000 * MODEL_PRICE_MAP[request.Model].InputTokens
	priceOutputTokens := float64(resp.Usage.CompletionTokens)/1_000_000*MODEL_PRICE_MAP[request.Model].OutputTokens + float64(resp.Usage.CompletionTokenDetails.ReasoningTokens)/1_000_000*MODEL_PRICE_MAP[request.Model].OutputTokens
	apiResponse := SendExtractionMessageResponse{
		Fields:            response.Fields,
		Usage:             usage,
		Model:             request.Model,
		TotalPrice:        priceInputTokens + priceOutputTokens,
		PriceInputTokens:  priceInputTokens,
		PriceOutputTokens: priceOutputTokens,
	}

	for _, field := range apiResponse.Fields {
		field.JavaScriptFunction = strings.TrimSpace(field.JavaScriptFunction)
		field.TypeScriptFunction = strings.TrimSpace(field.TypeScriptFunction)
		field.PythonFunction = strings.TrimSpace(field.PythonFunction)
		field.GoFunction = strings.TrimSpace(field.GoFunction)
		field.Regex = strings.TrimSpace(field.Regex)
		field.Selector = strings.TrimSpace(field.Selector)
		field.AttributeToGet = strings.TrimSpace(field.AttributeToGet)
		field.Field = strings.TrimSpace(field.Field)
		field.FieldAnalysis.ChosenSelectorRationale = strings.TrimSpace(field.FieldAnalysis.ChosenSelectorRationale)
	}
	logging.InfoLogger.Printf("Extraction completed successfully. Total price: $%.6f", apiResponse.TotalPrice)

	return apiResponse, nil
}
