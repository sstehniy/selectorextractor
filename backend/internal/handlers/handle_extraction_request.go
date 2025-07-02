package handlers

import (
	"fmt"
	"selectorextractor_backend/internal/ai"
	"selectorextractor_backend/internal/config"
	"selectorextractor_backend/internal/helpers"
	"selectorextractor_backend/internal/logging"
	"selectorextractor_backend/internal/response"

	"github.com/labstack/echo/v4"
)

func HandleHealthCheck(c echo.Context) error {
	return response.Success(c, map[string]string{
		"status":  "healthy",
		"version": "1.0.0",
	})
}

func HandleExtractionRequest(c echo.Context, cfg config.AIConfig) error {
	logging.InfoLogger.Println("Received extraction request")

	var body ai.SendExtractionMessageRequest
	if err := c.Bind(&body); err != nil {
		logging.ErrorLogger.Printf("Failed to bind request body: %v", err)
		return response.ValidationError(c, "Invalid request body")
	}

	// Validate request
	if err := validateExtractionRequest(body); err != nil {
		logging.ErrorLogger.Printf("Request validation failed: %v", err)
		return response.ValidationError(c, err.Error())
	}

	// Clean HTML
	cleanedHTML := helpers.PrepareHtmlForExtraction(body.HTML)
	body.HTML = cleanedHTML

	logging.InfoLogger.Printf("Processing extraction request with model: %s", body.Model)

	// Process request
	result, err := ai.SendExtractionMessageOpenAI(body, cfg)
	if err != nil {
		logging.ErrorLogger.Printf("Failed to process extraction request: %v", err)
		return response.InternalError(c, "Failed to process extraction request")
	}

	logging.InfoLogger.Printf("Successfully processed extraction request. Total tokens used: %d",
		result.Usage.InputTokens+result.Usage.OutputTokens)

	return response.Success(c, result)
}

func validateExtractionRequest(req ai.SendExtractionMessageRequest) error {
	if req.HTML == "" {
		return fmt.Errorf("HTML is required")
	}

	if len(req.FieldsToExtractSelectorsFor) == 0 {
		return fmt.Errorf("Fields to extract selectors for is required")
	}

	if req.Model == "" {
		return fmt.Errorf("Model is required")
	}

	validModel := false
	for _, model := range ai.MODEL_LIST {
		if model == req.Model {
			validModel = true
			break
		}
	}
	if !validModel {
		return fmt.Errorf("Invalid model specified")
	}

	return nil
}
