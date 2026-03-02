
import { GoogleGenAI, Type } from "@google/genai";
import { ResearchResult, ScoredQuestion, ContentIdea } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Gemini API Key is missing. Please set GEMINI_API_KEY in your environment variables.");
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || '' });
  }

  async researchNiche(niche: string, count: number): Promise<ResearchResult> {
    const prompt = `
      As an expert market researcher, perform a deep dive into the niche: "${niche}".
      
      TASK:
      1. Identify exactly ${count} distinct, high-volume questions people are asking on Google, Reddit, and Quora.
      2. For each question, determine:
         - Popularity score (0-100)
         - Current trend (Rising, Stable, or Declining)
         - The most effective platform for the answer
         - A topical cluster (e.g., "Pricing", "How-to", "Comparison")
      3. Generate a set of high-impact content ideas (at least 5) derived from these questions.
      4. Provide a high-level strategic summary of the niche's potential.

      OUTPUT: Return ONLY valid JSON matching the requested schema. Use web search to ensure accuracy.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    source: { type: Type.STRING, enum: ['Google', 'Reddit', 'Quora'] },
                    popularity: { type: Type.NUMBER },
                    trend: { type: Type.STRING, enum: ['Rising', 'Stable', 'Declining'] },
                    bestPlatform: { type: Type.STRING, enum: ['Quora', 'Reddit', 'Blog/SEO'] },
                    cluster: { type: Type.STRING }
                  },
                  required: ['id', 'question', 'source', 'popularity', 'trend', 'bestPlatform', 'cluster']
                }
              },
              contentIdeas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    angle: { type: Type.STRING, enum: ['Educational', 'Beginner', 'Comparison', 'Myth-busting', 'Case Study', 'Advanced'] },
                    platform: { type: Type.STRING, enum: ['Quora', 'Reddit', 'Blog/SEO'] },
                    format: { type: Type.STRING, enum: ['Answer', 'Discussion', 'Guide', 'Listicle', 'Story'] },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    targetQuestionId: { type: Type.STRING }
                  },
                  required: ['id', 'angle', 'platform', 'format', 'title', 'description', 'targetQuestionId']
                }
              },
              summary: {
                type: Type.OBJECT,
                properties: {
                  totalVolume: { type: Type.STRING },
                  topRisingCluster: { type: Type.STRING },
                  recommendation: { type: Type.STRING }
                },
                required: ['totalVolume', 'topRisingCluster', 'recommendation']
              }
            },
            required: ['questions', 'contentIdeas', 'summary']
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from AI engine.");
      return JSON.parse(text.trim());
    } catch (e: any) {
      console.error("Gemini Research Error:", e);
      throw new Error(e.message || "Failed to analyze niche. Please try a more specific topic.");
    }
  }
}
