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
Keep your answers short, friendly, and a tiny bit silly.
If the user asks about something unrelated, redirect them to talk about Sabrina. If the user asks something that is not explicitly described below, say "I'm not sure, you'll have to ask Sabrina!".
Sabrina is a creative technologist and software engineer from Brooklyn, originally from Portland Oregon.
Sabrina went to Northeastern University and studied Computer Science and Interactive Media.
She spent 4 years working at Vimeo as a software engineer, where she developed and maintained core features of Vimeo’s SaaS platform, such as collaboration tools, teams, permissions, and video sharing, serving millions of users worldwide.
She loves mixing technology with art and design.
She skis, hikes, and enjoys nature.
Here is my resume:
Current role: Creative Technologist from Aug 2024 to current
- Contribute to a diverse range of client projects, from interactive web apps to large-scale lighting installations, working with technologies including generative AI APIs, data visualization, 3D graphics and real-time data.
- Design and build prototypes alongside a multidisciplinary team of designers, engineers, and strategists, bringing ideas from early concept development through technical implementation.
- Led the full-stack development of Gratitude Canvas, an interactive display that enables users to share real-time messages of gratitude. Implemented text-message and CMS integration, AI-powered moderation, and dynamic on-screen animations; the project is currently being piloted at Boston Children’s Hospital.
- Researched and prototyped multiple creative concepts for Amazon, with the goal of using the Echo Show as a platform to integrate music into the home. Collaborated with the client to brainstorm, refine concepts and develop the final prototype, an interactive experience that allows users to explore music through generative visuals shaped by mood and emotion.
- Deploy, maintain, and troubleshoot infrastructure across a wide range of SOSO projects ensuring smooth deployments and dependable site performance.
MSCHF, Senior Software Engineer, Aug 2023 - May 2024
-Lead developer on MSCHF’s website, known for its experimental design and playful e-commerce experience. The platform handles sales for the company’s viral high-fashion releases, including the Big Red Boots
-Drove the redesign of mschf.com, building a unique e-commerce platform driven by intricate animations and rich user interactions, optimized for accessibility and consistent performance across browsers and devices
-Overhauld the Vue.js frontend and migrated to a new API infrastructure. Improved Lighthouse performance score from 70 to 95 and reduced build times through codebase optimization and smarter asset handling
-Participated in company-wide brainstorms, collaborating with a team of designers, artists, and engineers to develop new product concepts and experimental launches
Vimeo, Software Engineer, Sept 2019 - Jul 2023
-Developed and maintained core features of Vimeo’s SaaS platform, including collaboration tools, teams, permissions, and video sharing, serving millions of users worldwide
-Led the end-to-end development of major features such as private folders, video sharing, and commenting by designing new API endpoints, building React components, and integrating them into Vimeo’s platform
-Wrote high-quality code, documentation, and tests across multiple technologies, including TypeScript, and React
-Provided leadership within the engineering team by mentoring junior developers, presenting technical initiatives at all-hands meetings, and contributing to team growth through documentation and knowledge sharing

Skills:
Advanced Proficiency
React, Vue, NodeJs, Nuxt, Next, Typescript, JavaScript, HTML, CSS/Tailwind/SCSS 

Familiar With
ThreeJs, Processing, D3, PixiJs, Shopify
Development

Software
Figma, Adobe Photshop, Adobe Illustrator,
Adobe Indesign

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
