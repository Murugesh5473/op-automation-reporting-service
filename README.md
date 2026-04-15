# OP Automation Reporting Service

A high-performance Node.js service for synchronizing and managing automation reports with real-time data persistence. Built with Fastify, MongoDB, and Google Cloud Platform integration.

## Overview

This service provides:
- **Real-time data synchronization** from external SDKs
- **RESTful APIs** for accessing automation reports
- **Periodic background synchronization** with exponential backoff retry logic
- **MongoDB** integration for robust data persistence
- **Google Cloud Storage** support for file management
- **Health checks** and comprehensive monitoring
- **Swagger/OpenAPI** documentation
- **Docker support** for containerized deployment

## Features

- ✅ Periodic fetching from external SDK sources
- ✅ Data transformation and validation
- ✅ Automatic retry with exponential backoff
- ✅ Sync history tracking
- ✅ Health check and status endpoints
- ✅ Structured logging with Winston
- ✅ Fastify metrics and monitoring
- ✅ CORS support
- ✅ Multi-tenant ready architecture
- ✅ Kubernetes-ready with Helm charts

## Prerequisites

- **Node.js** 22+ (as per Docker image configuration)
- **MongoDB** 4.0+ (local or cloud instance)
- **npm** or **yarn**
- (Optional) **Google Cloud credentials** for GCS integration
- (Optional) **Docker** for containerized deployment

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd op-automation-reporting-service
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/

# Server Configuration
NODE_ENV=development
PORT=3000

# Google Cloud (Optional)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

## Running the Service

### Development Mode

```bash
npm run dev
```

This starts the service with hot-reload via `nodemon`.

### Production Mode

```bash
npm start
```

## API Documentation

Once the service is running, API documentation is available at:

```
http://localhost:3000/documentation
```

The API includes:

- **GET** `/automation-service/health` - Health check endpoint
- **GET** `/automation-service/status` - Service status
- Additional routes loaded from configured modules

## Project Structure

```
.
├── server.js                 # Main application entry point
├── config/
│   ├── index.js             # Configuration aggregator
│   ├── storage-config.js    # MongoDB & GCS setup
│   └── modules-config.js    # Module configuration
├── routes/
│   └── index.js             # Route registration and module loading
├── common/
│   ├── logger/              # Winston logger configuration
│   ├── schemas/             # JSON schemas for validation
│   └── util/                # Utility functions (error handling)
├── test/                    # Test files (Mocha)
├── .helm/                   # Kubernetes Helm charts
├── Dockerfile               # Docker image definition
├── Jenkinsfile              # CI/CD pipeline configuration
└── package.json             # Dependencies and scripts
```

## Configuration

### MongoDB Configuration

The service connects to MongoDB using the `MONGODB_URI` environment variable. Default connection pool sizes:
- **maxPoolSize**: 10
- **minPoolSize**: 5

### Modules Configuration

Modules are registered via `config/modules-config.js` and are dynamically loaded at startup. Each module can define:
- Routes
- Plugins
- Initialization logic

## Docker

### Build the Docker image

```bash
docker build -t op-automation-reporting:latest .
```

### Run a container

```bash
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/ \
  op-automation-reporting:latest
```

## Kubernetes Deployment

The service includes Helm charts for Kubernetes deployment:

```bash
helm install op-automation-reporting ./.helm \
  --namespace default \
  --values ./.helm/values.yaml
```

### Probes Configuration

- **Startup Probe**: Waits up to 150s (30 failures × 5s)
- **Readiness Probe**: Checks health every 10s
- **Liveness Probe**: Checks health every 3s

## Testing

Run the test suite:

```bash
npm test
```

## Code Quality

### Format code

```bash
npm run format
```

## Available Scripts

| Command | Description |
|---------|---|
| `npm start` | Run production server |
| `npm run dev` | Run development server with hot reload |
| `npm test` | Run test suite (Mocha) |
| `npm run format` | Format code with Prettier |
| `npm run gcloud-install` | Install dependencies with Google Artifact Registry auth |

## Monitoring

The service includes built-in monitoring via:
- **Fastify Metrics**: Prometheus-compatible metrics
- **Winston Logger**: Structured logging
- **Datadog Integration**: Environment variables for Datadog APM

## Security

- Private npm registry authentication via `.npmrc`
- Environment-based credential management
- No global npm packages in production image (CVE mitigation)
- Strict request validation with AJV

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB URI in .env
# Verify MongoDB is running and accessible
# Check connection pool configuration in config/storage-config.js
```

### Port Already in Use

```bash
# Change PORT environment variable or kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Module Loading Errors

Check `config/modules-config.js` to ensure all module paths are correct and modules export valid route definitions.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Format code: `npm run format`
5. Submit a pull request

## License

ISC
