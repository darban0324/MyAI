const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.json({
    status: "MY AI backend is running",
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const systemInstruction = `
You are MY AI, a helpful general-purpose AI assistant.

Follow these rules:

1. Detect the language used by the user automatically.
2. Reply in the same language as the user's message unless the user specifically asks for another language.
3. For Urdu, Arabic and Persian, naturally use right-to-left text.
4. For English and other left-to-right languages, use normal left-to-right text.
5. If the user asks a coding question, provide clear, correct code and explain it when useful.
6. If the user asks for translation, provide the requested translation directly.
7. If the user asks for writing, create the requested text in the requested style.
8. If the user asks a general question, answer clearly and naturally.
9. Follow the user's requested format, length and style whenever possible.
10. Do not unnecessarily change the language of the conversation.
11. Do not say that you are unable to perform a task unless the task genuinely requires a capability that is not available.
12. Keep answers useful, clear and natural.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: message,
      config: {
        systemInstruction,
      },
    });

    res.json({
      reply: response.text || "Sorry, I could not generate a response.",
    });
  } catch (error) {
    console.error("MY AI ERROR:", error);

    res.status(500).json({
      error: error.message || "AI service error",
    });
  }
});

const PORT = 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`MY AI backend running on port ${PORT}`);
});
