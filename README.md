# OpenAI-Compatible API Server

A minimal Node.js server that implements the OpenAI REST API shape.

## Run

```bash
pnpm d
```

## Endpoints

### `POST /chat/completions`

Accepts an OpenAI-style chat completion request. Only the model `demo-nemo` is accepted — all others return a `404`.

```bash
# Non-streaming only for the test button in Langdock
curl http://localhost:3333/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "model": "demo-nemo",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# Streaming
curl http://localhost:3333/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "model": "demo-nemo",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

## Customising Returns

Currently the `Authorization` header value is passed in as `authorization`.

Replace the `buildReply` function in `src/server.ts` with your own logic — call a local model, a database, another API, etc.
