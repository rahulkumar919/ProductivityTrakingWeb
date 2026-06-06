import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

export async function generateProductivityInsights(context: string) {
  if (!env.geminiApiKey) {
    return [
      "Gemini API is not configured yet. Add GEMINI_API_KEY to enable live coaching.",
      "Based on your current sample data, protect your highest-energy coding block and finish one high-priority task before adding new work.",
      "Your consistency is strongest when study, gym, and coding are scheduled as fixed anchors.",
    ].join("\n\n");
  }

  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(`You are DevTrack AI, a practical personal productivity coach. Give concise, specific advice from this data:\n${context}`);
  return result.response.text();
}
