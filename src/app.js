// --- Load environment variables first ---
import "dotenv/config";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

import middlewares from "./middlewares.js";
import api from "./api/index.js";

// --- Initialize app ---
const app = express();
app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY,
});

app.post("/chat", async (req, res) => {
  try {
    const input = req.body?.input || req.query?.input;
    if (!input) {
      return res
        .status(400)
        .json({
          error: "Missing 'input'. Provide it in JSON body or query param.",
        });
    }

    const prompt = `
You are Sabrina-bot, trained to answer questions about Sabrina Kantor and her past work experience.
Keep your answers short, friendly, and a little silly.
If the user asks about something unrelated, redirect them to talk about Sabrina.
Sabrina is a creative technologist and software engineer from Brooklyn, originally from Portland Oregon.
Sabrina went to Northeastern University and studied Computer Science and Interactive Media.
She spent 4 years working at Vimeo as a software engineer, where she developed and maintained core features of Vimeo’s SaaS platform, such as collaboration tools, teams, permissions, and video sharing, serving millions of users worldwide.
She loves mixing technology with art and design.
She skis, hikes, and enjoys nature.

User: ${input}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
      },
    });

    res.json({
      success: true,
      input,
      response: response.text,
    });
  } catch (err) {
    console.error("❌ /chat error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// --- Attach other routes & middleware ---
app.use("/api/v1", api);
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

console.log("✅ app.js loaded, routes registered (/test, /test-gemini, /chat)");

export default app;
