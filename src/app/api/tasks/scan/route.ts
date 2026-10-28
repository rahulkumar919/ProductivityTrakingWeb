import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";

// Increase body size limit — base64 of a 10MB image is ~13.3MB.
// Vercel Serverless cap is 4.5MB for request body, so we restrict the
// client to ~3MB images (4MB base64) which fits within Vercel's limit.
export const config = {
    api: { bodyParser: { sizeLimit: "5mb" } },
};

/**
 * POST /api/tasks/scan
 * Body: { imageBase64: string }  — data URL or raw base64, any image format
 * Returns: { title, description, category, priority, deadline }
 *
 * Uses Gemini Vision to extract task fields from a screenshot, handwritten note,
 * assignment sheet, or any image containing task information.
 */
export async function POST(request: Request) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!env.geminiApiKey) {
        return NextResponse.json({ error: "Gemini API key not configured." }, { status: 503 });
    }

    const body = await request.json() as { imageBase64: string };
    if (!body.imageBase64) {
        return NextResponse.json({ error: "imageBase64 is required." }, { status: 400 });
    }

    // Strip data URL prefix if present — we only need the raw base64
    const raw = body.imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
    // Detect MIME type from the prefix
    const mimeMatch = body.imageBase64.match(/^data:(image\/[a-z]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    const today = new Date().toISOString().slice(0, 10);

    const prompt = `You are a task extraction assistant. Analyze the image and extract task information from it.
The image may be a screenshot of a task list, assignment, to-do item, reminder, handwritten note, or any content describing work to be done.

Extract and return ONLY a valid JSON object (no markdown, no explanation) with these exact keys:
{
  "title": "<concise task title, max 80 chars>",
  "description": "<brief description of what needs to be done, max 200 chars, empty string if unclear>",
  "category": "<one of: Coding, Study, College, Gym, Personal, Other>",
  "priority": "<one of: High, Medium, Low>",
  "deadline": "<YYYY-MM-DD format, use today (${today}) if no date is visible>"
}

Rules:
- title must be actionable and specific (start with a verb if possible)
- category: use Coding for programming/dev tasks, Study for learning/reading, College for academic/assignments, Gym for fitness, Personal for personal errands, Other as fallback
- priority: High if urgent/important/due soon, Medium if normal, Low if optional/someday
- deadline: extract any date mentioned, convert to YYYY-MM-DD. If no date, use ${today}
- Return ONLY the JSON object. No other text.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`;

    const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: prompt },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: raw,
                        },
                    },
                ],
            }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 512,
            },
        }),
    });

    if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        console.error("Gemini API error:", errText);
        return NextResponse.json({ error: "AI scan failed. Please fill in manually." }, { status: 502 });
    }

    const geminiData = await geminiRes.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Extract JSON from the response — Gemini sometimes wraps in markdown fences
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        return NextResponse.json({ error: "Could not parse task from image. Please fill in manually." }, { status: 422 });
    }

    let parsed: {
        title?: string;
        description?: string;
        category?: string;
        priority?: string;
        deadline?: string;
    };
    try {
        parsed = JSON.parse(jsonMatch[0]) as typeof parsed;
    } catch {
        return NextResponse.json({ error: "Could not parse task from image. Please fill in manually." }, { status: 422 });
    }

    const VALID_CATEGORIES = ["Coding", "Study", "College", "Gym", "Personal", "Other"];
    const VALID_PRIORITIES = ["High", "Medium", "Low"];

    return NextResponse.json({
        title: (parsed.title ?? "").slice(0, 80).trim(),
        description: (parsed.description ?? "").slice(0, 200).trim(),
        category: VALID_CATEGORIES.includes(parsed.category ?? "") ? parsed.category : "Other",
        priority: VALID_PRIORITIES.includes(parsed.priority ?? "") ? parsed.priority : "Medium",
        deadline: /^\d{4}-\d{2}-\d{2}$/.test(parsed.deadline ?? "") ? parsed.deadline : today,
    });
}
