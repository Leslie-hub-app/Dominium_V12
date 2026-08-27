import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini API client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey
    });
  }
  return genAIClient;
}

// AI Advisor Consultation Endpoint
app.post('/api/ai/consult', async (req, res) => {
  try {
    const { prompt, role, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({ 
        error: 'Gemini API is not configured or GEMINI_API_KEY is missing. Using heuristic advisory engine.' 
      });
    }

    const systemInstruction = `You are the executive strategic AI advisor in Dominium (a deep, interconnected life, business, macroeconomics, politics, and power simulation).
Your current assigned strategic role is: "${role || 'Senior Strategic Advisor'}".

STRICT RULES & CONSTRAINTS:
1. ADVISORY ONLY: You must never directly mutate or invent game state.
2. GROUNDED IN REALITY: Reference ONLY the actual values, percentages, company names, family members, political offices, decisions, and consequence records provided in the context. Never invent companies, people, or numbers that are not in the context.
3. PRECISE CAUSAL CITATION: When asked questions such as "What changed?", "Why did my net worth fall?", "What decisions caused this?", "What happened to my company?", "What are my biggest risks?", "What should I focus on?", "Why am I receiving more media attention?", "Why has my political influence changed?", or "How has my family situation changed?", you MUST provide concrete, mathematically sound explanations citing real metrics and diffs.
   Example format: "Your net worth has fallen 8.2% over the last three months, primarily because your technology holdings declined 11% and your largest company's valuation fell 6%."
4. STRUCTURED OUTPUT: Always return valid JSON matching the requested schema with a detailed analytical answer, a list of 3-5 concrete recommendations, a clear risk assessment, and a list of specific data points referenced.`;

    const userMessage = `PLAYER QUERY:
"${prompt}"

DETAILED GAME CONTEXT & SIMULATION STATE:
${typeof context === 'string' ? context : JSON.stringify(context, null, 2)}

Provide an authoritative, data-grounded consultation.`;

    // Timeout guard (12 seconds max) to prevent HeadersTimeoutError / socket hangs
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI generation timed out after 12000ms')), 12000);
    });

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userMessage,
      config: {
        systemInstruction,
        temperature: 0.2, // Low temperature for high factual precision
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: {
              type: Type.STRING,
              description: 'The in-depth analytical answer referencing exact values, diffs, and causal chains.'
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-5 concrete, actionable strategic recommendations.'
            },
            riskAssessment: {
              type: Type.STRING,
              description: 'Clear risk assessment label and 1-sentence risk summary.'
            },
            sourceRole: {
              type: Type.STRING,
              description: 'The title of the advising specialist.'
            },
            dataPointsReferenced: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key numerical figures, diff percentages, or event names cited in the answer.'
            }
          },
          required: ['answer', 'recommendations', 'riskAssessment', 'sourceRole', 'dataPointsReferenced']
        }
      }
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const responseText = response?.text;
    if (!responseText) {
      return res.status(502).json({ error: 'Empty response received from AI model' });
    }

    const parsed = JSON.parse(responseText);
    return res.json(parsed);
  } catch (error: any) {
    console.warn('AI Advisor consultation fell back to heuristic engine:', error?.message || error);
    return res.status(503).json({ 
      error: 'Upstream AI consultation temporarily unavailable', 
      details: error?.message || String(error) 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Vite middleware for dev / static server for prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dominium Simulation Server running on http://localhost:${PORT}`);
  });
}

startServer();
