package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"selectorextractor_backend/internal/logging"
	"strings"

	"github.com/sashabaranov/go-openai"
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
	"anthropic/claude-3-5-haiku",
	"anthropic/claude-3.7-sonnet",
	"openai/gpt-4o",
	"openai/gpt-4o-mini",
	"google/gemini-2.0-flash-001",
	"google/gemini-2.0-flash-lite-001",
}

type ModelPrice struct {
	InputTokens  float64 `json:"input_tokens"`
	OutputTokens float64 `json:"output_tokens"`
}

var MODEL_PRICE_MAP = map[string]ModelPrice{
	"anthropic/claude-3-5-haiku": {
		InputTokens:  1.0,
		OutputTokens: 5.0,
	},
	"anthropic/claude-3.7-sonnet": {
		InputTokens:  3.0,
		OutputTokens: 15.0,
	},
	"openai/gpt-4o": {
		InputTokens:  2.5,
		OutputTokens: 10,
	},
	"openai/gpt-4o-mini": {
		InputTokens:  1.25,
		OutputTokens: 5.0,
	},
	"google/gemini-2.0-flash-001": {
		InputTokens:  0.1,
		OutputTokens: 0.4,
	},
	"google/gemini-2.0-flash-lite-001": {
		InputTokens:  0.075,
		OutputTokens: 0.3,
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

func SendExtractionMessageOpenAI(request SendExtractionMessageRequest) (SendExtractionMessageResponse, error) {
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
		response, err := attemptExtractionWithModel(request)
		if err == nil {
			fmt.Println("Success")
			return response, nil
		} else {
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
func attemptExtractionWithModel(request SendExtractionMessageRequest) (SendExtractionMessageResponse, error) {
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

	client := GetOpenAIClient()
	systemPrompt := getSystemPrompt()
	prompt := getPrompt()

	prompt = strings.Replace(prompt, "{{HTML}}", request.HTML, 1)
	prompt = strings.Replace(prompt, "{{FIELDS_TO_EXTRACT}}", fieldsToExtractString, 1)

	logging.InfoLogger.Printf("Sending request to AI API with %d characters of HTML using model %s",
		len(request.HTML), request.Model)

	messages := []openai.ChatCompletionMessage{
		{
			Role:    openai.ChatMessageRoleSystem,
			Content: systemPrompt,
		},
		{
			Role:    openai.ChatMessageRoleUser,
			Content: prompt,
		},
	}

	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model:       request.Model,
			Messages:    messages,
			MaxTokens:   8192,
			Temperature: 0.4,
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

	logging.InfoLogger.Printf("Received response from AI API. Prompt tokens: %d, Completion tokens: %d",
		resp.Usage.PromptTokens, resp.Usage.CompletionTokens)

	// Save full response to file
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

	// Extract content between <output_json> tags
	responseText := resp.Choices[0].Message.Content

	startTag := "<output_json>"
	endTag := "</output_json>"
	startIndex := strings.Index(responseText, startTag)
	endIndex := strings.Index(responseText, endTag)

	if startIndex == -1 || endIndex == -1 {
		logging.ErrorLogger.Printf("Could not find output_json tags in response")
		return createEmptyResponse(request.Model, usage), fmt.Errorf("could not find output_json tags in response")
	}

	jsonStr := responseText[startIndex+len(startTag) : endIndex]

	var response SendExtractionMessageResponse
	err = json.Unmarshal([]byte(jsonStr), &response)
	if err != nil {
		logging.ErrorLogger.Printf("Failed to unmarshal response JSON: %v", err)
		return createEmptyResponse(request.Model, usage), fmt.Errorf("failed to unmarshal response: %v", err)
	}

	// Calculate usage and pricing
	response.Usage = usage
	response.Model = request.Model
	response.PriceInputTokens = float64(resp.Usage.PromptTokens) / 1_000_000 * MODEL_PRICE_MAP[request.Model].InputTokens
	response.PriceOutputTokens = float64(resp.Usage.CompletionTokens) / 1_000_000 * MODEL_PRICE_MAP[request.Model].OutputTokens
	response.TotalPrice = response.PriceInputTokens + response.PriceOutputTokens

	logging.InfoLogger.Printf("Extraction completed successfully. Total price: $%.6f", response.TotalPrice)

	return response, nil
}
