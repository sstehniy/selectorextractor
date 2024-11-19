# Selector Extractor

A powerful web application for extracting and generating CSS selectors from HTML content. This application uses AI to analyze HTML structure and provide optimal CSS selectors for web scraping and automation purposes.

## Architecture

The application consists of two main components:

### Backend (Go)
- RESTful API built with Echo framework
- OpenAI integration for AI-powered selector generation
- Rate limiting and CORS support
- Structured logging
- Environment-based configuration

### Frontend (React)
- Modern React with TypeScript
- Vite for fast development and building
- Tailwind CSS with shadcn/ui components
- Real-time selector testing and validation
- Responsive design

## Tech Stack

### Backend
- Go 1.23
- Echo web framework
- OpenAI API integration
- Environment configuration with godotenv
- Docker containerization

### Frontend
- React 18.3
- TypeScript 5.5
- Vite 5.4
- TailwindCSS
- shadcn/ui components
- Tanstack Query
- Framer Motion
- Docker with Nginx

## Features

- AI-powered CSS selector generation
- Real-time selector validation
- Support for multiple selector strategies
- Rate limiting protection
- Responsive UI with dark mode support
- Docker containerization for easy deployment

## Getting Started

### Prerequisites

- Go 1.23 or higher
- Node.js 18 or higher
- Bun 1.1.25 or higher
- Docker and Docker Compose (optional)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/selectorextractor.git
cd selectorextractor
```

2. Set up the backend:
```bash
cd backend
cp .env.example .env  # Create and configure your .env file
go mod download
go run cmd/main.go
```

3. Set up the frontend:
```bash
cd client
bun install
bun run dev
```

The application will be available at:
- Frontend: http://localhost:1881
- Backend API: http://localhost:1323

### Docker Deployment

Build and run the entire stack using Docker Compose:

```bash
docker compose up -d
```

## Environment Variables

### Backend (.env)
```env
OPENROUTER_API_KEY=your_api_key
PORT=1323
READ_TIMEOUT=60s
WRITE_TIMEOUT=60s
ALLOWED_ORIGINS=*
RATE_LIMIT_ENABLED=true
RATE_LIMIT=100
RATE_LIMIT_WINDOW=1m
DEFAULT_MODEL=google/gemini-flash-1.5
MAX_TOKENS=8192
TEMPERATURE=0.4
```

### Frontend (environment variables are built into the application)
- VITE_API_URL=http://localhost:1323 (development)
- Production configuration is handled through Nginx reverse proxy

## API Documentation

### Extract Selectors
```http
POST /api/v1/extract
Content-Type: application/json

{
  "html": "string",
  "fields": [
    {
      "field": "string",
      "selector": "string",
      "attributeToGet": "string",
      "regex": "string",
      "regexMatchIndexToUse": number,
      "regexUse": "string",
      "extractMethod": "string"
    }
  ]
}
```

## Development

### Backend Development
```bash
cd backend
go run cmd/main.go
```

### Frontend Development
```bash
cd client
bun run dev
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
