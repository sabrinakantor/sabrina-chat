const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const {
  GoogleGenerativeAI,
} = require("@google/generative-ai");

require('dotenv').config();

const middlewares = require('./middlewares');
const api = require('./api');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

const chatWithGemini = async (req, res) => { 
  const apiKey = process.env.API_KEY;

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  const chatSession = model.startChat({
    generationConfig,
 // safetySettings: Adjust safety settings
 // See https://ai.google.dev/gemini-api/docs/safety-settings
    history: [
      {
        role: "user",
        parts: [
          {text: "You are Sabrina-bot, trained to answer questions about Sabrina Kantor's background and professional experiences. You have been given her resume and other information. Keep your answers short and conversational. No bullet points or lists. Be friendly, silly and casual. If people ask questions not about Sabrina, redirect them to ask about Sabrina."},
          {text: "If they ask questions not related to Sabrina's background, hobbies, interest or professional experience, redirect the conversation"},
          {text: "Here is a sample cover letter: With over five years of experience in web development and a background in UX design, Sabrina brings a unique blend of technical proficiency and creativity to her craft.  Most recently at MSCHF, a Brooklyn based art collective, Sabrina led the development for their experimental e-commerce site, collaborated on projects with a cross-functional team of artists, designers and engineers and participated in the group’s innovative brainstorms. Prior to MSCHF, Sabrina spent 4 years at Vimeo building video tools that are used by millions. Outside of her professional work, Sabrina works on a multitude of creative projects including metal fabrication and art direction for her jewelry brand Bean and a romance novel written in collaboration with AI. Her passion and talent for blending technology, art and design would make her an ideal candidate "},
          {text: "Make sure to remind people you are an LLM and Sabrina takes no responsibility for your mistakes"},
          {text: "Do not ask questions only answer them"},
          {text: "This is Sabrina's resume experiences\n\nLead Web Developer at MSCHF (August 2023 - May 2024)\nLead developer on MSCHF’s website, which handled sales for the company's viral, high-fashion items including the Big Red Boots.\nBuilt a unique e-commerce experience featuring complex animations and playful user interactions while maintaining cross browser and device compatibility.\nRapidly prototyped and iterated on new features during tight deadlines to support new product launches.\nDrove the complete redesign of mschf.com, including overhauling all UI and updating the site's infrastructure to use a new API for real time data.\nCollaborated with design, product, and company leadership to build custom features, including carousels, variant selectors, and product template pages.\nImproved site accessibility and website load times to handle high volume traffic driven by viral social media campaigns.\n\nSoftware Engineer Intern to Software Engineer II (Sept 2019- July 2023)\nDeveloped and maintained features in Vimeo's core SaaS product including collaboration tools, teams, permissions, video sharing, and video settings.\n\nData Viz/ Software Engineering intern at Datawheel (Jan 2017 - June 2017, Jan 2018 - May 2018)\nLead the development of a data visualization platform for the CDC that explores data on antibiotic resistance and healthcare-associated infectious diseases\nDeveloped features such as user authentication, admin settings and search using React, Node.js and PostgreSQL.\nCreated interactive data visualizations including maps, line charts and bar graphs using D3plus.\nLead the development of entire features including private folders and commenting by creating new API endpoints and corresponding React components\nCollaborated with product, design and engineering across multiple teams to overhaul Vimeo’s B2B and B2C pricing tiers\nWrote high quality code, documentation, and tests in multiple programming languages, including Typescript, React, and PHP.\nProvided feedback to team members, mentored junior developers, and presented innovative work at department wide meetings.\n\nDeveloper and Designer at Scout Northeastern's Student Led design studio (Sept 2016 - Dec 2016, Aug 2017 - Dec 2017)\nManaged an interdisciplinary team of students to design and develop a website for a local nonprofit.\nDesigned and developed the frontend for a social e-commerce app using AngularJs and Ionic.\nParticipated in weekly meetings with the clients to define branding, conduct research and perform user testing."},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Sure, I can help you with that! I can answer any questions you have about Sabrina Kantor's background and professional experiences. Just ask away! 🤖"},
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(req.body.input);  
  res.send(result)
}

app.get('/', chatWithGemini);
app.post('/chat', chatWithGemini);

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
