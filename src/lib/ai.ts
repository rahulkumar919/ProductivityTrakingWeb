import { env } from "@/lib/env";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const FALLBACK_INSIGHTS = [
  "Protect your highest-energy coding block and finish one high-priority task before adding new work.",
  "Consistency is strongest when study, gym, and coding are scheduled as fixed daily anchors — not optional slots.",
  "Keep tomorrow's plan simple: one coding task, one study block, one recovery habit, and a short review at night.",
].join("\n\n");

/**
 * generateProductivityInsights
 *
 * Calls Groq (llama-3.3-70b-versatile by default) with the user's
 * productivity context and returns a coaching response.
 *
 * Falls back to static advice if the API key is missing or the call fails.
 */
export async function generateProductivityInsights(context: string): Promise<string> {
  if (!env.groqApiKey || env.groqApiKey.startsWith("your_") || env.groqApiKey.startsWith("gsk_your")) {
    return [
      "⚠️ Groq API key not configured yet. Add GROQ_API_KEY to your environment variables to enable live AI coaching.",
      "In the meantime, here is some general guidance:",
      FALLBACK_INSIGHTS,
    ].join("\n\n");
  }

  const systemPrompt = `You are DevTrack AI, a sharp and direct personal productivity coach.
Your job is to analyze the user's real data and give 3–5 specific, actionable insights.

Rules:
- Be concise. No fluff, no padding, no generic platitudes.
- Each insight must be grounded in the actual numbers/patterns in the data.
- Use plain text. No markdown headers, no bullet characters — just clear paragraphs.
- If a metric is missing or zero, skip it — don't make things up.
- End with one concrete "focus for today" recommendation.`;

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.groqApiKey}`,
      },
      body: JSON.stringify({
        model: env.groqModel,
        temperature: 0.55,
        max_tokens: 600,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here is my productivity data:\n\n${context}` },
        ],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`Groq API error ${res.status}:`, errBody);
      throw new Error(`Groq returned ${res.status}`);
    }

    const data = await res.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("Empty response from Groq");

    return text;
  } catch (err) {
    console.error("Groq insight generation failed:", err);
    return [
      "Live AI coaching is temporarily unavailable. Here is an offline review:",
      FALLBACK_INSIGHTS,
    ].join("\n\n");
  }
}
