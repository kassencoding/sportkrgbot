import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI клиент
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ======================
//     AI ROUTE
// ======================
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Новый правильный метод responses.create()
    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Ты — официальный ИИ-ассистент Управления физической культуры и спорта Карагандинской области. " +
            "Отвечай кратко, официально, сжато и по делу."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    const answer = completion.output[0]?.content[0]?.text || "Нет ответа.";

    res.json({ answer });

  } catch (e) {
    console.error("AI ERROR:", e);
    res.status(500).json({ error: "AI backend error" });
  }
});

// ======================
//     TEST ROUTE
// ======================
app.get("/", (req, res) => {
  res.send("GiDCity AI backend работает.");
});

// ======================
//     START SERVER
// ======================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("AI backend listening on port", PORT);
});
