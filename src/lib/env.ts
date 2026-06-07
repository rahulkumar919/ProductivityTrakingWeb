function optionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export const env = {
  mongodbUri: optionalEnv("MONGODB_URI"),
  mongodbDb: optionalEnv("MONGODB_DB") ?? "devtrack_ai",
  jwtSecret: optionalEnv("JWT_SECRET") ?? "devtrack-local-secret-change-me",
  geminiApiKey: optionalEnv("GEMINI_API_KEY"),
  geminiModel: optionalEnv("GEMINI_MODEL") ?? "gemini-2.0-flash",
  smtpHost: optionalEnv("SMTP_HOST"),
  smtpPort: Number(optionalEnv("SMTP_PORT") ?? 587),
  smtpUser: optionalEnv("SMTP_USER"),
  smtpPass: optionalEnv("SMTP_PASS"),
  reminderEmailTo: optionalEnv("REMINDER_EMAIL_TO"),
  appUrl: optionalEnv("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
};
