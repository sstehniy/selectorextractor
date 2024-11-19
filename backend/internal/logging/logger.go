package logging

import (
	"log"
	"os"
	"path/filepath"
)

var (
	InfoLogger  *log.Logger
	ErrorLogger *log.Logger
)

func InitLoggers() error {
	// Create logs directory if it doesn't exist
	err := os.MkdirAll("logs", 0755)
	if err != nil {
		return err
	}

	// Open log files
	infoFile, err := os.OpenFile(filepath.Join("logs", "info.log"), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		return err
	}

	errorFile, err := os.OpenFile(filepath.Join("logs", "error.log"), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		return err
	}

	// Initialize loggers
	InfoLogger = log.New(infoFile, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
	ErrorLogger = log.New(errorFile, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)

	return nil
}
