import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";

/**
 * POST /api/tasks/delete-notify
 * Body: { email: string, task: { title, category, priority, deadline, status } }
 *
 * Sends a notification email when the user deletes a task that was not yet completed,
 * especially if it was overdue — so there's a record and a nudge to reschedule.
 */
export async function POST(request: Request) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
        // Silently skip if SMTP not configured — don't block the delete action
        return NextResponse.json({ ok: true, skipped: true });
    }

    const body = await request.json() as {
        email: string;
        task: {
            title: string;
            category: string;
            priority: string;
            deadline: string;
            status: string;
        };
    };

    if (!body.email || !body.task?.title) {
        return NextResponse.json({ error: "email and task are required." }, { status: 400 });
    }

    const { email, task } = body;
    const today = new Date().toISOString().slice(0, 10);
    const isOverdue = task.deadline < today && task.status !== "Completed";
    const deadlineFormatted = new Date(task.deadline).toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const deletedAt = new Date().toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });

    const PRIORITY_COLOR: Record<string, string> = {
        High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e",
    };
    const priorityColor = PRIORITY_COLOR[task.priority] ?? "#6366f1";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Task Deleted — DevTrack AI</title>
</head>
<body style="margin:0;padding:0;background:#f7f7f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f2;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
        style="background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #dfe4d6;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,${isOverdue ? "#991b1b,#ef4444" : "#1e3a5f,#3b82f6"});padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:32px;">${isOverdue ? "⚠️" : "🗑️"}</p>
            <h1 style="margin:12px 0 4px;color:#ffffff;font-size:22px;font-weight:900;">
              Task ${isOverdue ? "Deleted (Overdue)" : "Deleted"}
            </h1>
            <p style="margin:0;color:rgba(255,255,255,0.75);font-size:14px;">${deletedAt}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 6px;font-size:16px;color:#171915;font-weight:700;">Hey ${email.split("@")[0]} 👋</p>
            <p style="margin:0 0 24px;font-size:14px;color:#62685d;line-height:1.7;">
              ${isOverdue
            ? "You deleted a task that had already passed its deadline without being completed. Here's a record of it — consider rescheduling it if it still matters."
            : "You deleted a task from your DevTrack AI board. Here's a record of what was removed."}
            </p>

            <!-- Task details card -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f7f7f2;border-radius:16px;border:1px solid #dfe4d6;margin-bottom:28px;">
              <tr>
                <td style="padding:20px 24px;">

                  <p style="margin:0 0 4px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#aeb7a7;">Task Title</p>
                  <p style="margin:0 0 16px;font-size:17px;font-weight:900;color:#171915;line-height:1.3;">${task.title}</p>

                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:33%;padding:0 8px 0 0;vertical-align:top;">
                        <p style="margin:0 0 3px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#aeb7a7;">Category</p>
                        <p style="margin:0;font-size:13px;font-weight:700;color:#171915;">${task.category}</p>
                      </td>
                      <td style="width:33%;padding:0 8px;vertical-align:top;">
                        <p style="margin:0 0 3px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#aeb7a7;">Priority</p>
                        <p style="margin:0;font-size:13px;font-weight:700;color:${priorityColor};">${task.priority}</p>
                      </td>
                      <td style="width:33%;padding:0 0 0 8px;vertical-align:top;">
                        <p style="margin:0 0 3px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#aeb7a7;">Status at Delete</p>
                        <p style="margin:0;font-size:13px;font-weight:700;color:#62685d;">${task.status}</p>
                      </td>
                    </tr>
                  </table>

                  <div style="margin-top:16px;padding-top:16px;border-top:1px solid #dfe4d6;">
                    <p style="margin:0 0 3px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#aeb7a7;">Original Deadline</p>
                    <p style="margin:0;font-size:13px;font-weight:700;color:${isOverdue ? "#ef4444" : "#171915"};">
                      ${deadlineFormatted}${isOverdue ? " (Overdue)" : ""}
                    </p>
                  </div>

                </td>
              </tr>
            </table>

            ${isOverdue ? `
            <!-- Overdue warning box -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#fef2f2;border-radius:12px;border:1px solid #fecaca;margin-bottom:28px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 6px;font-size:13px;font-weight:900;color:#991b1b;">⚠️ This task was overdue</p>
                  <p style="margin:0;font-size:13px;color:#7f1d1d;line-height:1.6;">
                    The deadline had already passed. If this task still needs to be done,
                    consider adding it back with a new deadline.
                  </p>
                </td>
              </tr>
            </table>` : ""}

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="${env.appUrl}/tasks"
                    style="display:inline-block;background:linear-gradient(135deg,#16614f,#2f8f77);color:#ffffff;
                    text-decoration:none;font-weight:900;font-size:15px;padding:14px 36px;
                    border-radius:14px;letter-spacing:.02em;">
                    ${isOverdue ? "Reschedule Task →" : "View My Tasks →"}
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f7f7f2;padding:20px 40px;text-align:center;border-top:1px solid #dfe4d6;">
            <p style="margin:0;font-size:12px;color:#aeb7a7;">
              Sent by <strong style="color:#16614f;">DevTrack AI</strong> · Your personal discipline OS
            </p>
            <p style="margin:6px 0 0;font-size:11px;color:#aeb7a7;">
              This email was triggered automatically when you deleted a task.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    try {
        const transporter = nodemailer.createTransport({
            host: env.smtpHost,
            port: env.smtpPort,
            secure: env.smtpPort === 465,
            auth: { user: env.smtpUser, pass: env.smtpPass },
        });

        await transporter.sendMail({
            from: `"DevTrack AI" <${env.smtpUser}>`,
            to: email,
            subject: isOverdue
                ? `⚠️ Overdue task deleted: "${task.title}" — DevTrack AI`
                : `🗑️ Task deleted: "${task.title}" — DevTrack AI`,
            html,
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Delete notify email error:", err);
        // Don't return 500 — the task was already deleted, email is best-effort
        return NextResponse.json({ ok: true, emailError: true });
    }
}
