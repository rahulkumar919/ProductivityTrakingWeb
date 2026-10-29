import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";

/**
 * POST /api/tasks/scan
 * Body: { imageBase64: string }  — data URL, any image format, max 3 MB
 * Returns: { title, description, category, priority, deadline }
 *
 * Flow:
 *  1. Upload image to Cloudinary with OCR enabled → get extracted text
 *  2. Send OCR text to Groq llama-3.3-70b-versatile → parse into task JSON
 *
 * This works entirely with your existing credentials — no vision model needed.
 */
export async function POST(request: Request) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!env.groqApiKey || env.groqApiKey.startsWith("your_")) {
        return NextResponse.json({ error: "Groq API key not configured." }, { status: 503 });
    }

    if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
        return NextResponse.json({ error: "Cloudinary not configured." }, { status: 503 });
    }

    let body: { imageBase64: string };
    try {
        body = await request.json() as typeof body;
    } catch {
        return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    if (!body.imageBase64) {
        return NextResponse.json({ error: "imageBase64 is required." }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);

    /* ──────────────────────────────────────────────────────────────
       STEP 1 — Upload to Cloudinary with OCR add-on
       Cloudinary's OCR extracts all visible text from any image.
    ────────────────────────────────────────────────────────────── */
    let extractedText = "";

    try {
        // Build multipart form data for Cloudinary upload API
        const formData = new FormData();
        formData.append("file", body.imageBase64);
        formData.append("upload_preset", ""); // will use signed upload below
        formData.append("ocr", "adv_ocr");    // Cloudinary OCR add-on
        formData.append("folder", "devtrack/scan-temp");

        // Signed upload (server-side) using api_key + api_secret
        const timestamp = Math.floor(Date.now() / 1000);
        const paramsToSign = `folder=devtrack/scan-temp&ocr=adv_ocr&timestamp=${timestamp}`;

        // Generate SHA-1 signature
        const encoder = new TextEncoder();
        const data = encoder.encode(paramsToSign + env.cloudinaryApiSecret);
        const hashBuffer = await crypto.subtle.digest("SHA-1", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        const uploadFormData = new FormData();
        uploadFormData.append("file", body.imageBase64);
        uploadFormData.append("api_key", env.cloudinaryApiKey!);
        uploadFormData.append("timestamp", String(timestamp));
        uploadFormData.append("signature", signature);
        uploadFormData.append("folder", "devtrack/scan-temp");
        uploadFormData.append("ocr", "adv_ocr");

        const cloudRes = await fetch(
            `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`,
            { method: "POST", body: uploadFormData }
        );

        if (cloudRes.ok) {
            const cloudData = await cloudRes.json() as {
                info?: { ocr?: { adv_ocr?: { data?: Array<{ textAnnotations?: Array<{ description?: string }> }> } } };
                tags?: string[];
                context?: { custom?: Record<string, string> };
                public_id?: string;
                original_filename?: string;
            };

            // Try OCR text first
            const annotations = cloudData.info?.ocr?.adv_ocr?.data?.[0]?.textAnnotations;
            if (annotations && annotations.length > 0) {
                extractedText = annotations[0]?.description ?? "";
            }

            // Fallback: use tags + filename as context for Groq
            if (!extractedText && cloudData.tags?.length) {
                extractedText = `Image tags: ${cloudData.tags.join(", ")}`;
            }
            if (!extractedText && cloudData.original_filename) {
                extractedText = `Image filename: ${cloudData.original_filename}`;
            }

            // Clean up — delete the temp upload (fire-and-forget)
            if (cloudData.public_id) {
                const delTimestamp = Math.floor(Date.now() / 1000);
                const delParams = `public_id=${cloudData.public_id}&timestamp=${delTimestamp}`;
                const delData = encoder.encode(delParams + env.cloudinaryApiSecret);
                const delHashBuffer = await crypto.subtle.digest("SHA-1", delData);
                const delHash = Array.from(new Uint8Array(delHashBuffer));
                const delSig = delHash.map(b => b.toString(16).padStart(2, "0")).join("");

                const delForm = new FormData();
                delForm.append("public_id", cloudData.public_id);
                delForm.append("api_key", env.cloudinaryApiKey!);
                delForm.append("timestamp", String(delTimestamp));
                delForm.append("signature", delSig);

                fetch(`https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/destroy`, {
                    method: "POST", body: delForm,
                }).catch(() => { });
            }
        }
    } catch (err) {
        console.warn("Cloudinary OCR failed, proceeding with description-only mode:", err);
    }

    /* ──────────────────────────────────────────────────────────────
       STEP 2 — Send extracted text (or fallback description) to Groq
       Groq text model parses it into structured task fields.
    ────────────────────────────────────────────────────────────── */
    const context = extractedText.trim()
        ? `Extracted text from image:\n"""\n${extractedText.slice(0, 1500)}\n"""`
        : "The image was scanned but no text could be extracted. Please infer a generic task.";

    const prompt = `You are a task extraction assistant.

${context}

Based on the text above, extract the most important task and return ONLY a valid JSON object — no markdown, no explanation:

{
  "title": "<actionable task title starting with a verb, max 80 chars>",
  "description": "<brief description, max 200 chars, empty string if unclear>",
  "category": "<exactly one of: Coding, Study, College, Gym, Personal, Other>",
  "priority": "<exactly one of: High, Medium, Low>",
  "deadline": "<YYYY-MM-DD — extract any date from the text, default to ${today} if none found>"
}

Rules:
- Pick the single most important/prominent task if multiple are present.
- category: Coding for programming, Study for learning/reading, College for academic work, Gym for fitness, Personal for errands, Other as fallback.
- priority: High if urgent/deadline soon, Medium if normal work, Low if optional.
- Return ONLY the JSON. Nothing else.`;

    try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${env.groqApiKey}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                temperature: 0.1,
                max_tokens: 300,
                messages: [{ role: "user", content: prompt }],
            }),
        });

        if (!groqRes.ok) {
            const errText = await groqRes.text();
            console.error("Groq error:", errText);
            let msg = `Groq API error (${groqRes.status})`;
            try { const j = JSON.parse(errText) as { error?: { message?: string } }; if (j.error?.message) msg = j.error.message; } catch { /**/ }
            return NextResponse.json({ error: msg }, { status: 502 });
        }

        const groqData = await groqRes.json() as {
            choices?: Array<{ message?: { content?: string } }>;
        };

        const rawText = groqData.choices?.[0]?.message?.content?.trim() ?? "";
        if (!rawText) return NextResponse.json({ error: "AI returned empty response." }, { status: 422 });

        const jsonMatch = rawText.match(/\{[\s\S]*?\}/);
        if (!jsonMatch) return NextResponse.json({ error: "Could not extract task. Try a clearer image." }, { status: 422 });

        let parsed: { title?: string; description?: string; category?: string; priority?: string; deadline?: string };
        try { parsed = JSON.parse(jsonMatch[0]) as typeof parsed; }
        catch { return NextResponse.json({ error: "Could not parse AI response." }, { status: 422 }); }

        const VALID_CATEGORIES = ["Coding", "Study", "College", "Gym", "Personal", "Other"];
        const VALID_PRIORITIES = ["High", "Medium", "Low"];

        return NextResponse.json({
            title: (parsed.title ?? "").slice(0, 80).trim(),
            description: (parsed.description ?? "").slice(0, 200).trim(),
            category: VALID_CATEGORIES.includes(parsed.category ?? "") ? parsed.category! : "Other",
            priority: VALID_PRIORITIES.includes(parsed.priority ?? "") ? parsed.priority! : "Medium",
            deadline: /^\d{4}-\d{2}-\d{2}$/.test(parsed.deadline ?? "") ? parsed.deadline! : today,
        });

    } catch (err) {
        console.error("Scan route error:", err);
        return NextResponse.json({ error: "Scan failed. Please try again." }, { status: 500 });
    }
}
