# CodeLabAPITemplate

This is a template for creating a CodeLabAPI project. It is a simple project that can be used to create a new CodeLabAPI using a development setup for NestJS inside a Docker Container.

## Development

```bash
docker-compose up --build
```

## Testing

Attach to the running container and run the tests.

### Unit

```bash
    npm run test:cov
```

### E2E

Attach to the running container and run the tests.

```bash
    npm run test:e2e:cov
```

For not generating coverage reports, run without the `:cov` suffix.

## CI/CD

```bash

```
