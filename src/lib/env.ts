function optionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export const env = {
  mongodbUri: optionalEnv("MONGODB_URI"),
  mongodbDb: optionalEnv("MONGODB_DB") ?? "devtrack_ai",
  jwtSecret: optionalEnv("JWT_SECRET") ?? "devtrack-local-secret-change-me",
  geminiApiKey: optionalEnv("GEMINI_API_KEY"),   // kept for backward compat, not used by any route
  geminiModel: optionalEnv("GEMINI_MODEL") ?? "gemini-2.0-flash",
  groqApiKey: optionalEnv("GROQ_API_KEY"),      // ALL AI features — insights + image scan
  groqModel: optionalEnv("GROQ_MODEL") ?? "llama-3.3-70b-versatile",
  smtpHost: optionalEnv("SMTP_HOST"),
  smtpPort: Number(optionalEnv("SMTP_PORT") ?? 587),
  smtpUser: optionalEnv("SMTP_USER"),
  smtpPass: optionalEnv("SMTP_PASS"),
  reminderEmailTo: optionalEnv("REMINDER_EMAIL_TO"),
  appUrl: optionalEnv("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
  // Cloudinary
  cloudinaryCloudName: optionalEnv("CLOUDINARY_CLOUD_NAME"),
  cloudinaryApiKey: optionalEnv("CLOUDINARY_API_KEY"),
  cloudinaryApiSecret: optionalEnv("CLOUDINARY_API_SECRET"),
  // Public env vars (safe to expose to browser)
  cloudinaryPublicCloudName: optionalEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
  cloudinaryUploadPreset: optionalEnv("NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET"),
};
