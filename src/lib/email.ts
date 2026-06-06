import nodemailer from "nodemailer";
import { env } from "@/lib/env";

export async function sendDailySummaryEmail(summary: {
  productivityScore: number;
  tasksCompleted: number;
  codingHours: number;
  studyHours: number;
  streak: number;
}) {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass || !env.reminderEmailTo) {
    return { skipped: true, reason: "SMTP environment variables are not configured." };
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: { user: env.smtpUser, pass: env.smtpPass },
  });

  await transporter.sendMail({
    from: env.smtpUser,
    to: env.reminderEmailTo,
    subject: "DevTrack AI Daily Summary",
    html: `<h1>Daily Summary</h1><p>Productivity Score: <strong>${summary.productivityScore}%</strong></p><p>Tasks Completed: ${summary.tasksCompleted}</p><p>Coding Hours: ${summary.codingHours}</p><p>Study Hours: ${summary.studyHours}</p><p>Current Streak: ${summary.streak}</p>`,
  });

  return { skipped: false };
}

export function startReminderCron() {
  if (typeof window !== "undefined") return;
  import("node-cron").then((cron) => {
    cron.schedule("0 21 * * *", () => {
      void sendDailySummaryEmail({ productivityScore: 0, tasksCompleted: 0, codingHours: 0, studyHours: 0, streak: 0 });
    });
  });
}
