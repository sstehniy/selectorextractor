package response

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type Response struct {
	Success bool           `json:"success"`
	Data    interface{}    `json:"data,omitempty"`
	Error   *ErrorResponse `json:"error,omitempty"`
}

type ErrorResponse struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func Success(c echo.Context, data interface{}) error {
	return c.JSON(http.StatusOK, Response{
		Success: true,
		Data:    data,
	})
}

func ErrorWithCode(c echo.Context, statusCode int, errorCode, message string) error {
	return c.JSON(statusCode, Response{
		Success: false,
		Error: &ErrorResponse{
			Code:    errorCode,
			Message: message,
		},
	})
}

func BadRequest(c echo.Context, message string) error {
	return ErrorWithCode(c, http.StatusBadRequest, "BAD_REQUEST", message)
}

func InternalError(c echo.Context, message string) error {
	return ErrorWithCode(c, http.StatusInternalServerError, "INTERNAL_ERROR", message)
}

func ValidationError(c echo.Context, message string) error {
	return ErrorWithCode(c, http.StatusUnprocessableEntity, "VALIDATION_ERROR", message)
}

func RateLimitError(c echo.Context) error {
	return ErrorWithCode(c, http.StatusTooManyRequests, "RATE_LIMIT_EXCEEDED", "Too many requests. Please try again later.")
}
