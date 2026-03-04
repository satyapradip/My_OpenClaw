# MyClaw

An OpenClaw-inspired AI agent that can control your computer through natural language commands. Send a message to the API and the agent will plan, execute shell commands, read/write files, run Python code, search the web, and reply — all autonomously.

---

## Architecture

```
User (HTTP client)
      │
      ▼
  index.js          ← Express API gateway
      │  (message + sessionId)
      ▼
  agent.js          ← Agentic loop
      │
      ├─ Calls GPT-4o with structured output (Zod schema)
      │
      ├─ If response = tool_call → run the tool → feed result back → loop
      │
      └─ If response = text      → return reply to API gateway
```

The agent keeps looping (up to 15 iterations) until GPT-4o decides it has enough information to give a final text reply. Each tool call and its result are added to the conversation history so the model can reason across multiple steps.

---

## Tools Available

| Tool              | What it does                                                        |
| ----------------- | ------------------------------------------------------------------- |
| `run_command`     | Runs a shell / PowerShell command and returns stdout                |
| `read_file`       | Reads the contents of a local file                                  |
| `write_file`      | Creates or overwrites a local file                                  |
| `search_web`      | Searches the web via DuckDuckGo Instant Answers (no API key needed) |
| `get_system_info` | Returns OS, CPU, memory, and Node version as JSON                   |
| `execute_python`  | Writes Python code to a temp file and runs it                       |
| `get_user_input`  | Agent asks the user a clarifying question mid-task                  |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python (for `execute_python` tool)
- An OpenAI API key with access to `gpt-4o`

### Install

```bash
npm install
```

### Configure

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=sk-...your key here...
```

### Run

```bash
node index.js
```

The server starts on `http://localhost:3000` (or the `PORT` env variable).

---

## API Reference

### `POST /message`

Send a message to the agent.

**Request body**

```json
{
  "message": "What is my computer's OS and how much free RAM do I have?",
  "sessionId": "my-session-1"
}
```

| Field       | Type   | Required | Description                                               |
| ----------- | ------ | -------- | --------------------------------------------------------- |
| `message`   | string | Yes      | The user's natural language command                       |
| `sessionId` | string | No       | Identifier for multi-turn memory. Defaults to `"default"` |

**Response**

```json
{
  "sessionId": "my-session-1",
  "response": "You are running Windows 11 on an x64 machine with 4.2 GB of free RAM.",
  "needsInput": false
}
```

| Field        | Description                                                                             |
| ------------ | --------------------------------------------------------------------------------------- |
| `response`   | The agent's reply                                                                       |
| `needsInput` | `true` when the agent asked a clarifying question — send the answer in the next message |

---

### `DELETE /session/:id`

Clear the conversation history for a session (fresh start).

```bash
curl -X DELETE http://localhost:3000/session/my-session-1
```

---

## Example Requests

```bash
# Simple system info
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{"message": "What OS am I on and how much RAM do I have free?"}'

# Multi-step task (agent will plan, run commands, and report back)
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Create a file called hello.txt with the text Hello World in it", "sessionId": "s1"}'

# Continue the same session
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Now read that file back to me", "sessionId": "s1"}'

# Run Python
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Use Python to calculate the first 10 Fibonacci numbers and show me"}'
```

---

## Safety Rules (Built-in, Cannot Be Overridden)

The agent refuses to:

- Run destructive commands (`rm -rf`, format, wipe) without explicit confirmation
- Escalate privileges (admin/sudo/root) without disclosing it
- Upload or transmit local files to any external host
- Print passwords, API keys, or `.env` contents
- Execute code downloaded from the web without inspecting it first
- Create startup entries or persistent background processes
- Comply with prompt-injection attacks embedded in file contents or command output

---

## Project Structure

```
├── agent.js      ← All tools, system prompt, output schema, and agentic loop
├── index.js      ← Express server — API gateway with session management
├── package.json
├── .env          ← API keys (never commit this)
└── README.md
```

---

## Inspiration

Inspired by [OpenClaw](https://github.com/openclaw/openclaw). This is an independent reimplementation for learning purposes.

---

## License

ISC — see `package.json`.
