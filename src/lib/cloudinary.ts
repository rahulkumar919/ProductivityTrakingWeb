/**
 * Cloudinary REST API helpers — no SDK, no lodash, no webpack issues.
 * Uses fetch + Web Crypto SHA-1 for signed requests.
 */
import { env } from "@/lib/env";

async function sha1(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Upload a base64 data URL or remote URL to Cloudinary.
 * Returns { publicId, url }.
 */
export async function uploadToCloudinary(
    source: string,
    folder = "devtrack/notebooks"
): Promise<{ publicId: string; url: string }> {
    if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
        throw new Error("Cloudinary not configured.");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = await sha1(paramsToSign + env.cloudinaryApiSecret);

    const form = new FormData();
    form.append("file", source);
    form.append("api_key", env.cloudinaryApiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);
    form.append("folder", folder);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`,
        { method: "POST", body: form }
    );

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Cloudinary upload failed: ${err}`);
    }

    const data = await res.json() as { public_id: string; secure_url: string };
    return { publicId: data.public_id, url: data.secure_url };
}

/**
 * Delete an image from Cloudinary by its public_id.
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
    if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) return;

    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
    const signature = await sha1(paramsToSign + env.cloudinaryApiSecret);

    const form = new FormData();
    form.append("public_id", publicId);
    form.append("api_key", env.cloudinaryApiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);

    await fetch(
        `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/destroy`,
        { method: "POST", body: form }
    );
}
