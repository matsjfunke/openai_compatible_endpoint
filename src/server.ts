import express, { Request, Response } from "express";

const app = express();
const PORT = 3333;

app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (Object.keys(req.body ?? {}).length > 0) {
    console.log(JSON.stringify(req.body, null, 2));
  }
  next();
});

// --- Types ---

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

// --- Helpers ---

function buildReply(authorization?: string): string {
  const token = authorization ?? "(no token)";
  return `This is a demo response from demo-nemo. Your token: ${token}`;
}

function makeChunkId() {
  return `chatcmpl-${Date.now()}`;
}

// Chat completions
app.post("/chat/completions", (req: Request, res: Response) => {
  const body = req.body as ChatCompletionRequest;
  const { model, messages, stream } = body;

  if (model !== "demo-nemo") {
    res.status(404).json({
      error: {
        message: `The model '${model}' does not exist. Use 'demo-nemo'.`,
        type: "invalid_request_error",
        code: "model_not_found",
      },
    });
    return;
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({
      error: {
        message: "messages is required",
        type: "invalid_request_error",
      },
    });
    return;
  }

  if (!stream) {
    res.json({
      id: makeChunkId(),
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: "no streaming chunk" },
          finish_reason: "stop",
        },
      ],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    });
    return;
  }

  const replyText = buildReply(req.headers.authorization);
  const id = makeChunkId();
  const created = Math.floor(Date.now() / 1000);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const words = replyText.split(" ");
  let i = 0;

  const send = () => {
    if (i < words.length) {
      const delta = i === 0 ? words[i] : ` ${words[i]}`;
      const chunk = {
        id,
        object: "chat.completion.chunk",
        created,
        model,
        choices: [
          {
            index: 0,
            delta: { role: "assistant", content: delta },
            finish_reason: null,
          },
        ],
      };
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      i++;
      setTimeout(send, 30);
    } else {
      const done = {
        id,
        object: "chat.completion.chunk",
        created,
        model,
        choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
      };
      res.write(`data: ${JSON.stringify(done)}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  };

  send();
});

app.listen(PORT, () => {
  console.log(`OpenAI-compatible server running on http://localhost:${PORT}`);
  console.log(`  POST /chat/completions`);
});
