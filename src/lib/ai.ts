import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

const fallbackInsights = [
  "Based on your current productivity data, protect your highest-energy coding block and finish one high-priority task before adding new work.",
  "Your consistency is strongest when study, gym, and coding are scheduled as fixed anchors.",
  "Keep tomorrow's plan simple: one coding task, one study block, one recovery habit, and a short review at night.",
].join("\n\n");

export async function generateProductivityInsights(context: string) {
  if (!env.geminiApiKey) {
    return [
      "Gemini API is not configured yet. Add GEMINI_API_KEY to enable live coaching.",
      fallbackInsights,
    ].join("\n\n");
  }

  try {
    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: env.geminiModel });
    const result = await model.generateContent(`You are DevTrack AI, a practical personal productivity coach. Give concise, specific advice from this data:\n${context}`);
    return result.response.text() || fallbackInsights;
  } catch (error) {
    console.error("Gemini insight generation failed", error);
    return [
      "Live Gemini coaching is temporarily unavailable, so here is an offline review.",
      fallbackInsights,
    ].join("\n\n");
  }
}
