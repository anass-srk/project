# Transport Management Platform

A microservices-based transport management platform built with Node.js, React, and PostgreSQL.

## Features

- **User authentication and authorization**
- **Route and trip management**
- **Real-time driver location tracking**
- **Ticket booking and management**
- **Subscription plans**
- **Email notifications**
- **Admin dashboard**

## Architecture

The platform consists of the following microservices:

- **Frontend** (React + Vite)
- **User Service** (Authentication & User Management)
- **Route Service** (Routes & Trips)
- **Payment Service** (Tickets)
- **Subscription Service** (Subscription Plans)
- **Notification Service** (Email & SMS)

## API Documentation

Each microservice has its own OpenAPI/Swagger documentation:

- User Service API
- Route Service API
- Payment Service API
- Subscription Service API
- Notification Service API

These can be viewed using the Swagger Editor or any OpenAPI-compatible tool.

## Testing

The User Service has complete test coverage including:

- **Unit tests**
- **Integration tests**
- **E2E tests**

Run tests with:

```console
cd user-service
npm test
```

## Deployment

### Docker Compose

The application can be deployed using Docker Compose:
`docker compose up -d`

This will start all microservice and their dependencies.

### Kubernetes

The `k8s` and `_k8s` folders contain Kubernetes configuration files. Note that these are currently non-working examples and need to be properly configured for production use.

## Development

1. Clone the repository.
2. Install dependencies for each microservice:

```console
cd [microservice-name]
npm install
```

3. Start the auxiliary services (Kong,Consul,RabbitMQ,Postfix):

> **Important:** Please use docker-compose.yaml.back for this particular task

`docker compose up -d`

4. Run the microservice:

`npm run dev`

## License

MIT
