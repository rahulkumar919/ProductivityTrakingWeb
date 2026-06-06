export const env = {
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET ?? "devtrack-local-secret-change-me",
  geminiApiKey: process.env.GEMINI_API_KEY,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  reminderEmailTo: process.env.REMINDER_EMAIL_TO,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};
