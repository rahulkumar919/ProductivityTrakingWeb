import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";

// Configure once — safe to call multiple times (cloudinary is a singleton)
cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
});

/**
 * Upload a base64 data URL or remote URL to Cloudinary.
 * Returns { public_id, secure_url }.
 */
export async function uploadToCloudinary(
    source: string,   // base64 data URL or https URL
    folder = "devtrack/notebooks"
) {
    const result = await cloudinary.uploader.upload(source, {
        folder,
        resource_type: "image",
        quality: "auto:good",
        fetch_format: "auto",
    });
    return { publicId: result.public_id, url: result.secure_url };
}

/** Delete an image from Cloudinary by its public_id */
export async function deleteFromCloudinary(publicId: string) {
    await cloudinary.uploader.destroy(publicId);
}
