import { Hono } from "hono";
import { cors } from "hono/cors";
import { D1Database } from "@cloudflare/workers-types";

// Types
interface ShoppingNote {
  id: string;
  text: string;
  created_at: string;
}

interface MapNote {
  id: string;
  text: string;
  created_at: string;
}

interface CalendarNote {
  id: string;
  text: string;
  date: string;
  person: 1 | 2;
  created_at: string;
}

interface Word {
  id: string;
  english: string;
  japanese: string;
  chinese: string;
  emoji: string;
  created_at: string;
}

interface Idiom {
  id: string;
  emoji: string;
  chinese: string;
  japanese: string;
  created_at: string;
}

// D1データベースを使用するための型定義
interface Env {
  DB: D1Database;
}

// Initialize Hono app
const app = new Hono<{ Bindings: Env }>();

// CORSミドルウェア
app.use("*", cors({
  origin: (origin) => origin, // 全てのOriginを許可
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  exposeHeaders: ["Content-Length"],
  maxAge: 86400, // 24時間
  credentials: true,
}));

// Routes
app.get("/", (c) => {
  return c.json({ message: "Our Notes API is running!" });
});

// Shopping Notes API
// Get all shopping notes
app.get("/api/shopping-notes", async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM shopping_notes ORDER BY created_at DESC").all<ShoppingNote>();
    return c.json(results);
  } catch (error) {
    console.error("Error fetching shopping notes:", error);
    return c.json({ error: "Failed to fetch shopping notes" }, 500);
  }
});

// Create a shopping note
app.post("/api/shopping-notes", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.text) {
      return c.json({ error: "Text is required" }, 400);
    }

    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();

    await c.env.DB.prepare("INSERT INTO shopping_notes (id, text, created_at) VALUES (?, ?, ?)").bind(id, body.text, created_at).run();

    return c.json({ id, text: body.text, created_at }, 201);
  } catch (error) {
    console.error("Error creating shopping note:", error);
    return c.json({ error: "Failed to create shopping note" }, 500);
  }
});

// Delete a shopping note
app.delete("/api/shopping-notes/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const { meta } = await c.env.DB.prepare("DELETE FROM shopping_notes WHERE id = ?").bind(id).run();

    if (meta.changes === 0) {
      return c.json({ error: "Note not found" }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting shopping note:", error);
    return c.json({ error: "Failed to delete shopping note" }, 500);
  }
});

// Update a shopping note
app.put("/api/shopping-notes/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    if (!body.text) {
      return c.json({ error: "Text is required" }, 400);
    }

    const { meta } = await c.env.DB.prepare("UPDATE shopping_notes SET text = ? WHERE id = ?").bind(body.text, id).run();

    if (meta.changes === 0) {
      return c.json({ error: "Note not found" }, 404);
    }

    return c.json({ id, text: body.text, success: true });
  } catch (error) {
    console.error("Error updating shopping note:", error);
    return c.json({ error: "Failed to update shopping note" }, 500);
  }
});

// Map Notes API
// Get all map notes
app.get("/api/map-notes", async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM map_notes ORDER BY created_at DESC").all<MapNote>();
    return c.json(results);
  } catch (error) {
    console.error("Error fetching map notes:", error);
    return c.json({ error: "Failed to fetch map notes" }, 500);
  }
});

// Create a map note
app.post("/api/map-notes", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.text) {
      return c.json({ error: "Text is required" }, 400);
    }

    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();

    await c.env.DB.prepare("INSERT INTO map_notes (id, text, created_at) VALUES (?, ?, ?)").bind(id, body.text, created_at).run();

    return c.json({ id, text: body.text, created_at }, 201);
  } catch (error) {
    console.error("Error creating map note:", error);
    return c.json({ error: "Failed to create map note" }, 500);
  }
});

// Delete a map note
app.delete("/api/map-notes/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const { meta } = await c.env.DB.prepare("DELETE FROM map_notes WHERE id = ?").bind(id).run();

    if (meta.changes === 0) {
      return c.json({ error: "Note not found" }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting map note:", error);
    return c.json({ error: "Failed to delete map note" }, 500);
  }
});

// Update a map note
app.put("/api/map-notes/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    if (!body.text) {
      return c.json({ error: "Text is required" }, 400);
    }

    const { meta } = await c.env.DB.prepare("UPDATE map_notes SET text = ? WHERE id = ?").bind(body.text, id).run();

    if (meta.changes === 0) {
      return c.json({ error: "Note not found" }, 404);
    }

    return c.json({ id, text: body.text, success: true });
  } catch (error) {
    console.error("Error updating map note:", error);
    return c.json({ error: "Failed to update map note" }, 500);
  }
});

// Calendar Notes API
// Get all calendar notes
app.get("/api/calendar-notes", async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM calendar_notes ORDER BY date DESC").all<CalendarNote>();
    return c.json(results);
  } catch (error) {
    console.error("Error fetching calendar notes:", error);
    return c.json({ error: "Failed to fetch calendar notes" }, 500);
  }
});

// Create a calendar note
app.post("/api/calendar-notes", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.text || !body.date || !body.person) {
      return c.json({ error: "Text, date, and person are required" }, 400);
    }

    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();

    await c.env.DB.prepare("INSERT INTO calendar_notes (id, text, date, person, created_at) VALUES (?, ?, ?, ?, ?)").bind(id, body.text, body.date, body.person, created_at).run();

    return c.json({ id, text: body.text, date: body.date, person: body.person, created_at }, 201);
  } catch (error) {
    console.error("Error creating calendar note:", error);
    return c.json({ error: "Failed to create calendar note" }, 500);
  }
});

// Delete a calendar note
app.delete("/api/calendar-notes/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const { meta } = await c.env.DB.prepare("DELETE FROM calendar_notes WHERE id = ?").bind(id).run();

    if (meta.changes === 0) {
      return c.json({ error: "Note not found" }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting calendar note:", error);
    return c.json({ error: "Failed to delete calendar note" }, 500);
  }
});

// Update a calendar note
app.put("/api/calendar-notes/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    if (!body.text || !body.date || !body.person) {
      return c.json({ error: "Text, date, and person are required" }, 400);
    }

    const { meta } = await c.env.DB.prepare("UPDATE calendar_notes SET text = ?, date = ?, person = ? WHERE id = ?").bind(body.text, body.date, body.person, id).run();

    if (meta.changes === 0) {
      return c.json({ error: "Note not found" }, 404);
    }

    return c.json({ id, text: body.text, date: body.date, person: body.person, success: true });
  } catch (error) {
    console.error("Error updating calendar note:", error);
    return c.json({ error: "Failed to update calendar note" }, 500);
  }
});

// Words API (単語帳: 英語・日本語・中国語)
// Get all words
app.get("/api/words", async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM words ORDER BY created_at DESC").all<Word>();
    return c.json(results);
  } catch (error) {
    console.error("Error fetching words:", error);
    return c.json({ error: "Failed to fetch words" }, 500);
  }
});

// Create a word
app.post("/api/words", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.english || !body.japanese || !body.chinese) {
      return c.json({ error: "English, japanese, and chinese are required" }, 400);
    }

    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const emoji = body.emoji ?? "";

    await c.env.DB.prepare("INSERT INTO words (id, english, japanese, chinese, emoji, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(id, body.english, body.japanese, body.chinese, emoji, created_at).run();

    return c.json({ id, english: body.english, japanese: body.japanese, chinese: body.chinese, emoji, created_at }, 201);
  } catch (error) {
    console.error("Error creating word:", error);
    return c.json({ error: "Failed to create word" }, 500);
  }
});

// Delete a word
app.delete("/api/words/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const { meta } = await c.env.DB.prepare("DELETE FROM words WHERE id = ?").bind(id).run();

    if (meta.changes === 0) {
      return c.json({ error: "Word not found" }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting word:", error);
    return c.json({ error: "Failed to delete word" }, 500);
  }
});

// Update a word
app.put("/api/words/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    if (!body.english || !body.japanese || !body.chinese) {
      return c.json({ error: "English, japanese, and chinese are required" }, 400);
    }

    const emoji = body.emoji ?? "";

    const { meta } = await c.env.DB.prepare("UPDATE words SET english = ?, japanese = ?, chinese = ?, emoji = ? WHERE id = ?").bind(body.english, body.japanese, body.chinese, emoji, id).run();

    if (meta.changes === 0) {
      return c.json({ error: "Word not found" }, 404);
    }

    return c.json({ id, english: body.english, japanese: body.japanese, chinese: body.chinese, emoji, success: true });
  } catch (error) {
    console.error("Error updating word:", error);
    return c.json({ error: "Failed to update word" }, 500);
  }
});

// Idioms API (四字熟語クイズ: 絵文字→四字熟語)
// Get all idioms
app.get("/api/idioms", async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM idioms ORDER BY created_at DESC").all<Idiom>();
    return c.json(results);
  } catch (error) {
    console.error("Error fetching idioms:", error);
    return c.json({ error: "Failed to fetch idioms" }, 500);
  }
});

// Create an idiom
app.post("/api/idioms", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.emoji || !body.chinese || !body.japanese) {
      return c.json({ error: "Emoji, chinese, and japanese are required" }, 400);
    }

    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();

    await c.env.DB.prepare("INSERT INTO idioms (id, emoji, chinese, japanese, created_at) VALUES (?, ?, ?, ?, ?)").bind(id, body.emoji, body.chinese, body.japanese, created_at).run();

    return c.json({ id, emoji: body.emoji, chinese: body.chinese, japanese: body.japanese, created_at }, 201);
  } catch (error) {
    console.error("Error creating idiom:", error);
    return c.json({ error: "Failed to create idiom" }, 500);
  }
});

// Delete an idiom
app.delete("/api/idioms/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const { meta } = await c.env.DB.prepare("DELETE FROM idioms WHERE id = ?").bind(id).run();

    if (meta.changes === 0) {
      return c.json({ error: "Idiom not found" }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting idiom:", error);
    return c.json({ error: "Failed to delete idiom" }, 500);
  }
});

// Update an idiom
app.put("/api/idioms/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    if (!body.emoji || !body.chinese || !body.japanese) {
      return c.json({ error: "Emoji, chinese, and japanese are required" }, 400);
    }

    const { meta } = await c.env.DB.prepare("UPDATE idioms SET emoji = ?, chinese = ?, japanese = ? WHERE id = ?").bind(body.emoji, body.chinese, body.japanese, id).run();

    if (meta.changes === 0) {
      return c.json({ error: "Idiom not found" }, 404);
    }

    return c.json({ id, emoji: body.emoji, chinese: body.chinese, japanese: body.japanese, success: true });
  } catch (error) {
    console.error("Error updating idiom:", error);
    return c.json({ error: "Failed to update idiom" }, 500);
  }
});

export default app;
