import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, context } = req.body;
      
      const systemInstruction = `
        Ты — старший бизнес-аналитик внутри системы AI-аудита. 
        Отвечаешь коротко и по делу, без вступлений и без похвалы. 
        Опираешься только на переданные данные. 
        Никогда не выдумываешь цифры. 
        Отвечаешь на русском языке.
        
        ТЕКУЩИЙ КОНТЕКСТ:
        ${JSON.stringify(context)}
      `;

      // Convert messages to Interaction format
      // Note: ai.interactions.create uses 'input' for the current turn.
      // For history, we might need a different approach or just pass it in prompt
      // but let's try to follow the simple pattern for now.
      
      const lastMessage = messages[messages.length - 1].content;
      const historyText = messages.slice(0, -1).map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
      
      const interaction = await genAI.interactions.create({
        model: "gemini-3.8-flash",
        input: historyText ? `История:\n${historyText}\n\nВопрос: ${lastMessage}` : lastMessage,
        system_instruction: systemInstruction
      });

      res.json({ text: interaction.output_text });
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
