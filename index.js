import express from "express";
import { run } from "./agent.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ── HEALTH CHECK ───────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── IN-MEMORY SESSION STORE ────────────────────────────────────────────────
// Maps sessionId → conversation history array  (resets on server restart)
const sessions = new Map();

/**
 * POST /message
 * Body: { message: string, sessionId?: string }
 *
 * Pass a consistent sessionId to maintain multi-turn conversation memory.
 * Omit it (or use "default") for a stateless single-turn exchange.
 */
app.post("/message", async (req, res) => {
  const { message, sessionId = "default" } = req.body;

  if (!message) {
    return res.status(400).json({ error: "message field is required" });
  }

  // Load existing history for this session (empty array for new sessions)
  const history = sessions.get(sessionId) ?? [];

  try {
    const { reply, updatedHistory, needsInput } = await run(message, history);

    // Save updated history back so next turn has full context
    sessions.set(sessionId, updatedHistory);

    return res.json({
      sessionId,
      response: reply,
      needsInput: needsInput ?? false, // true when agent asked a clarifying question
    });
  } catch (err) {
    console.error("Agent error:", err);
    return res.status(500).json({
      error: "Agent encountered an internal error.",
      detail: err.message,
    });
  }
});

/**
 * DELETE /session/:id
 * Clear conversation history for a given session (fresh start).
 */
app.delete("/session/:id", (req, res) => {
  sessions.delete(req.params.id);
  return res.json({ message: `Session "${req.params.id}" cleared.` });
});

app.listen(PORT, () => {
  console.log(`MyClaw server running on http://localhost:${PORT}`);
});
