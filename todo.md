# MyClaw — Beginner Setup Guide

Follow each step in order. Do not skip any step.

---

## STEP 1 — Install Node.js

Node.js is the runtime that runs your JavaScript code outside the browser.

1. Go to **https://nodejs.org**
2. Download the **LTS** version (the one that says "Recommended for most users")
3. Run the installer and click Next all the way through
4. When done, open a terminal (PowerShell on Windows, Terminal on Mac/Linux) and run:

```bash
node -v
```

You should see something like `v20.x.x`. If you do, Node.js is installed correctly.

---

## STEP 2 — Install Python (needed for the `execute_python` tool)

1. Go to **https://www.python.org/downloads/**
2. Download the latest stable version
3. During install, **check the box that says "Add Python to PATH"** — this is important
4. After install, verify in your terminal:

```bash
python --version
```

You should see `Python 3.x.x`.

---

## STEP 3 — Get an OpenAI API Key

The agent uses GPT-4o from OpenAI. You need an account and API key.

1. Go to **https://platform.openai.com/signup** and create a free account
2. After signing in, go to **https://platform.openai.com/api-keys**
3. Click **"Create new secret key"**
4. Give it a name (e.g. `MyClaw`)
5. **Copy the key immediately** — you will not be able to see it again
6. The key looks like: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

> **Note:** GPT-4o requires a paid plan. Add a payment method at https://platform.openai.com/settings/organization/billing. Even $5 credit is more than enough to get started.

---

## STEP 4 — Download the Project

If you got the code as a ZIP:
1. Unzip it to a folder, e.g. `E:\MyOpenClaw`

If you are cloning from GitHub:
```bash
git clone https://github.com/satyapradip/My_OpenClaw.git
cd My_OpenClaw
```

---

## STEP 5 — Create the `.env` File

The `.env` file stores secret keys. It never gets shared or uploaded.

1. Open the project folder
2. Create a new file called exactly `.env` (just the dot and "env", no other extension)
3. Paste this inside, replacing the placeholder with your real key from Step 3:

```env
OPENAI_API_KEY=sk-proj-your-real-key-here
```

4. Save the file

> **Windows tip:** If Windows hides file extensions, open Notepad, paste the content, then use **File → Save As**, set "Save as type" to "All Files", and name it `.env`.

---

## STEP 6 — Install Dependencies

Dependencies are the external packages the project needs to run.

1. Open your terminal
2. Navigate into the project folder:

```bash
cd E:\MyOpenClaw
```

3. Run:

```bash
npm install
```

This reads `package.json` and downloads everything automatically into a `node_modules` folder. It takes 1–2 minutes.

When it finishes you should see something like `added 120 packages`.

---

## STEP 7 — Start the Server

```bash
node index.js
```

You should see:

```
MyClaw server running on http://localhost:3000
```

The server is now running. Keep this terminal open — closing it stops the server.

---

## STEP 8 — Send Your First Message

Open a **second** terminal window and run this command:

**Windows (PowerShell):**
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/message `
  -ContentType "application/json" `
  -Body '{"message": "What OS am I on and how much RAM do I have?"}'
```

**Mac / Linux:**
```bash
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{"message": "What OS am I on and how much RAM do I have?"}'
```

You should get back a JSON response with the agent's answer.

---

## STEP 9 — Test Each Tool

Try these one by one to make sure everything works:

### Run a command
```json
{ "message": "Run the command 'echo Hello from MyClaw' and show me the output" }
```

### Read a file
```json
{ "message": "Read the file package.json and tell me what dependencies are listed" }
```

### Write a file
```json
{ "message": "Create a file called test.txt with the content 'MyClaw works!'" }
```

### Search the web
```json
{ "message": "Search the web for what Node.js is and give me a short summary" }
```

### Get system info
```json
{ "message": "Tell me my CPU count, total RAM, and Node version" }
```

### Run Python code
```json
{ "message": "Use Python to print the numbers 1 to 10" }
```

---

## STEP 10 — Use Multi-Turn Conversation (Memory)

Pass the same `sessionId` across multiple messages to give the agent memory:

```json
{ "message": "Create a file called notes.txt and write 'My first note' in it", "sessionId": "chat1" }
```

Then follow up in the same session:
```json
{ "message": "Now read notes.txt back to me", "sessionId": "chat1" }
```

The agent remembers everything in the same session.

To start fresh, clear the session:

**PowerShell:**
```powershell
Invoke-RestMethod -Method Delete -Uri http://localhost:3000/session/chat1
```

**curl:**
```bash
curl -X DELETE http://localhost:3000/session/chat1
```

---

## STEP 11 — (Optional) Use Postman Instead of curl

Postman is a visual tool for sending HTTP requests — easier than typing curl commands.

1. Download from **https://www.postman.com/downloads/**
2. Install and open it
3. Click **"New Request"**
4. Set method to **POST**, URL to `http://localhost:3000/message`
5. Click the **Body** tab → select **raw** → set type to **JSON**
6. Paste your message:
   ```json
   { "message": "Hello, what can you do?" }
   ```
7. Click **Send**

---

## Common Errors & Fixes

| Error | What it means | Fix |
|-------|---------------|-----|
| `OPENAI_API_KEY is not set` | `.env` file is missing or wrong | Re-check Step 5 |
| `Cannot find module` | `npm install` was not run | Run `npm install` again |
| `EADDRINUSE: port 3000` | Another process is using port 3000 | Kill the other process or change `PORT` in `.env` |
| `python is not recognized` | Python not in PATH | Reinstall Python with "Add to PATH" checked |
| `401 Unauthorized` from OpenAI | Invalid API key | Re-copy the key from the OpenAI dashboard |
| `429 Too Many Requests` | Rate limited or no billing | Add a payment method at platform.openai.com |

---

## Quick Reference — All API Endpoints

| Method | URL | What it does |
|--------|-----|-------------|
| `POST` | `/message` | Send a message to the agent |
| `DELETE` | `/session/:id` | Clear a session's conversation history |

**POST /message body fields:**

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `message` | Yes | — | What you want the agent to do |
| `sessionId` | No | `"default"` | ID to group messages in one conversation |

---

## What's Next (Ideas to Extend the Project)

- [ ] Add a `list_directory(path)` tool so the agent can browse folders
- [ ] Add a `download_file(url, save_path)` tool with safety checks
- [ ] Swap the in-memory session store in `index.js` for a database (MongoDB is already in your dependencies!)
- [ ] Build a simple chat UI in HTML that calls your API
- [ ] Add rate limiting to the Express server so no one can spam your OpenAI account
- [ ] Deploy to a cloud service like Railway, Render, or a VPS
