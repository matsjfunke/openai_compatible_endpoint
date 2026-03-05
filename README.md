# OpenAI-Compatible API Server

A minimal Node.js server that implements the OpenAI REST API shape.

## Setup

```bash
pnpm install
```

## Run

```bash
# Development (auto-reload)
pnpm dev

# Production
pnpm start
```

## Endpoints

### `GET /v1/models`

Returns the list of available models.

```bash
curl http://localhost:3000/v1/models
```

### `POST /v1/chat/completions`

Accepts an OpenAI-style chat completion request.

```bash
# Non-streaming
curl http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "my-model",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# Streaming
curl http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "my-model",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

## Customising

Replace the `buildReply` function in `src/server.ts` with your own logic — call a local model, a database, another API, etc.
