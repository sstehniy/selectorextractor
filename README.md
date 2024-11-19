# Selector Extractor

A web application that helps developers extract and analyze CSS selectors from HTML content. Built with React and Go, this tool provides intelligent selector suggestions and analysis for web scraping and automation tasks.

## 🚀 Features

- Extract optimal CSS selectors from HTML content
- Intelligent selector analysis and recommendations
- Real-time selector validation
- Support for multiple AI models (OpenRouter API integration)
- Modern, responsive UI built with React and Tailwind CSS
- RESTful API backend written in Go

## 🏗️ Architecture

The application is split into two main components:

### Frontend (./client)
- Built with React 18, TypeScript, and Vite
- Uses Tailwind CSS for styling
- Components from Radix UI
- State management with React Query
- Containerized with Nginx for production deployment

### Backend (./backend)
- Written in Go
- Echo framework for HTTP routing
- OpenRouter API integration for AI-powered analysis
- Containerized for easy deployment

## 🛠️ Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Go 1.23+ (for local development)
- Bun 1.1.25+ (for building frontend)

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/selectorextractor.git
cd selectorextractor
```

2. Set up environment variables:
Create a `.env` file in the backend directory with:
```env
OPENROUTER_API_KEY=your_openrouter_api_key
```

3. Start the application using Docker Compose:
```bash
docker compose up --build
```

The application will be available at:
- Frontend: http://localhost:1881
- Backend API: http://localhost:1323

## 💻 Development Setup

### Frontend
```bash
cd client
bun install
bun run dev
```

### Backend
```bash
cd backend
go mod download
go run cmd/main.go
```

## 🔧 Configuration

### Frontend Configuration
- Port: 1881 (configurable in vite.config.ts)
- API Proxy: Configured to forward /api requests to backend
- Environment variables can be set in the docker-compose.yml file

### Backend Configuration
- Port: 1323
- Logging: Logs are stored in ./backend/logs
- API Keys: Required for OpenRouter API integration

## 🐳 Docker Configuration

The application uses multi-stage builds for both frontend and backend:

### Frontend Container
- Build stage: Uses Bun for building the React application
- Production stage: Nginx for serving static files and handling API proxying

### Backend Container
- Single stage build using Go Alpine
- Minimal production image

## 📝 API Documentation

The backend provides the following endpoints:

- `POST /extract`: Extract selectors from HTML content
  - Request body: HTML content and extraction parameters
  - Response: Analyzed selectors with explanations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
