FROM golang:1.23-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN go build -o main ./cmd/main.go

# Create logs directory
RUN mkdir -p /app/logs

# Expose port
EXPOSE 1323

# Run the application
CMD ["./main"] 