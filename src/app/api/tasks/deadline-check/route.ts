import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getCurrentUser } from "@/lib/auth";
import { auth } from "@/lib/next-auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import { env } from "@/lib/env";

async function resolveUserId(): Promise<string | null> {
    const jwtUser = await getCurrentUser();
    if (jwtUser?.userId) return jwtUser.userId;
    const session = await auth();
    const u = session?.user as { id?: string } | undefined;
    return u?.id ?? null;
}

/**
 * POST /api/tasks/deadline-check
 *
 * Called automatically by the TaskBoard on page load (with a 24h cooldown per device).
 * Body: { tasks: Array<{ id, title, category, priority, deadline, status }> }
 *
 * Finds all tasks whose deadline has passed and status is NOT "Completed",
 * then sends a single summary email to the logged-in user's email address.
 */
export async function POST(request: Request) {
    const userId = await resolveUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
        return NextResponse.json({ ok: true, skipped: true, reason: "smtp_not_configured" });
    }

    const body = await request.json() as {
        tasks: Array<{
            id: string;
            title: string;
            category: string;
            priority: string;
            deadline: string;
            status: string;
        }>;
    };

    if (!Array.isArray(body.tasks)) {
        return NextResponse.json({ error: "tasks array required." }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);

    // Filter: deadline passed + not completed
    const overdue = body.tasks.filter(
        t => t.deadline < today && t.status !== "Completed"
    );

    if (overdue.length === 0) {
        return NextResponse.json({ ok: true, skipped: true, reason: "no_overdue_tasks" });
    }

    // Get user email from DB
    await connectToDatabase();
    const user = await User.findById(userId).select("email name").lean() as
        | { email?: string; name?: string }
        | null;

    if (!user?.email) {
        return NextResponse.json({ ok: true, skipped: true, reason: "no_user_email" });
    }

    const userName = (user.name ?? user.email.split("@")[0]) as string;
    const userEmail = user.email as string;

    const PRIORITY_COLOR: Record<string, string> = {
        High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e",
    };
    const CAT_EMOJI: Record<string, string> = {
        Coding: "💻", Study: "📚", College: "🎓", Gym: "🏋️",
        Personal: "👤", Other: "📌",
    };

    const sentAt = new Date().toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

    // Build task rows for the email table
    const taskRows = overdue.map(t => {
        const daysAgo = Math.floor(
            (new Date(today).getTime() - new Date(t.deadline).getTime()) / 86400000
        );
        const deadlineLabel = new Date(t.deadline).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
        });
        const pColor = PRIORITY_COLOR[t.priority] ?? "#6366f1";
        const emoji = CAT_EMOJI[t.category] ?? "📌";

        return `
        <tr style="border-bottom:1px solid #dfe4d6;">
          <td style="padding:14px 16px;vertical-align:top;">
            <div style="display:flex;align-items:flex-start;gap:10px;">
              <span style="font-size:18px;line-height:1;">${emoji}</span>
              <div>
                <p style="margin:0 0 4px;font-size:14px;font-weight:800;color:#171915;line-height:1.3;">${t.title}</p>
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                  <span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;
                    background:rgba(239,68,68,0.1);color:#ef4444;">
                    ⏰ ${daysAgo === 0 ? "Due today" : `${daysAgo}d overdue`}
                  </span>
                  <span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;
                    background:${pColor}18;color:${pColor};">
                    ${t.priority}
                  </span>
                  <span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;
                    background:#f7f7f2;color:#62685d;">
                    ${t.category}
                  </span>
                </div>
              </div>
            </div>
          </td>
          <td style="padding:14px 16px;text-align:right;vertical-align:top;white-space:nowrap;">
            <p style="margin:0;font-size:12px;font-weight:700;color:#ef4444;">${deadlineLabel}</p>
            <p style="margin:3px 0 0;font-size:11px;color:#aeb7a7;">${t.status}</p>
          </td>
        </tr>`;
    }).join("");

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>You have unfinished tasks — DevTrack AI</title>
</head>
<body style="margin:0;padding:0;background:#f7f7f2;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0"
    style="background:#f7f7f2;padding:40px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:24px;overflow:hidden;
        border:1px solid #dfe4d6;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

        <!-- ── Header ── -->
        <tr>
          <td style="background:linear-gradient(135deg,#16614f 0%,#1a7a62 50%,#5ec4a8 100%);
            padding:36px 40px;text-align:center;">
            <div style="font-size:40px;margin-bottom:12px;">📋</div>
            <h1 style="margin:0 0 6px;color:#fff;font-size:24px;font-weight:900;
              letter-spacing:-0.3px;">
              You have unfinished tasks!
            </h1>
            <p style="margin:0;color:rgba(255,255,255,0.75);font-size:14px;">
              ${sentAt}
            </p>
          </td>
        </tr>

        <!-- ── Greeting ── -->
        <tr>
          <td style="padding:32px 40px 0;">
            <p style="margin:0 0 8px;font-size:17px;font-weight:800;color:#171915;">
              Hey ${userName} 👋
            </p>
            <p style="margin:0;font-size:14px;color:#62685d;line-height:1.75;">
              You have
              <strong style="color:#ef4444;">${overdue.length} incomplete task${overdue.length !== 1 ? "s" : ""}</strong>
              that ${overdue.length === 1 ? "has" : "have"} passed ${overdue.length === 1 ? "its" : "their"} deadline.
              Don't let them pile up — even finishing one today keeps your momentum going! 💪
            </p>
          </td>
        </tr>

        <!-- ── Stats banner ── -->
        <tr>
          <td style="padding:20px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:linear-gradient(135deg,#fef2f2,#fff7ed);
              border-radius:16px;border:1px solid #fecaca;">
              <tr>
                <td style="padding:20px 24px;text-align:center;">
                  <p style="margin:0;font-size:44px;font-weight:900;color:#ef4444;
                    line-height:1;">${overdue.length}</p>
                  <p style="margin:4px 0 0;font-size:12px;font-weight:800;
                    text-transform:uppercase;letter-spacing:.08em;color:#62685d;">
                    Overdue Task${overdue.length !== 1 ? "s" : ""}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Task list ── -->
        <tr>
          <td style="padding:0 40px 8px;">
            <p style="margin:0 0 12px;font-size:12px;font-weight:800;
              text-transform:uppercase;letter-spacing:.08em;color:#aeb7a7;">
              Pending Tasks
            </p>
            <table width="100%" cellpadding="0" cellspacing="0"
              style="border:1px solid #dfe4d6;border-radius:16px;overflow:hidden;">
              ${taskRows}
            </table>
          </td>
        </tr>

        <!-- ── Motivational tips ── -->
        <tr>
          <td style="padding:20px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f7f7f2;border-radius:14px;border:1px solid #dfe4d6;">
              <tr>
                <td style="padding:18px 22px;">
                  <p style="margin:0 0 12px;font-size:12px;font-weight:800;
                    text-transform:uppercase;letter-spacing:.08em;color:#aeb7a7;">
                    Quick Wins
                  </p>
                  ${[
                    "🎯 Pick the smallest task and finish it first",
                    "⏱️ Set a 25-min focus timer — no distractions",
                    "✅ Mark tasks done as you go to see progress",
                    "📅 Reschedule tasks you can't do today",
                ].map(tip => `
                  <p style="margin:0 0 8px;font-size:13px;color:#62685d;line-height:1.6;">
                    ${tip}
                  </p>`).join("")}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── CTA ── -->
        <tr>
          <td style="padding:8px 40px 36px;text-align:center;">
            <a href="${env.appUrl}/tasks"
              style="display:inline-block;
              background:linear-gradient(135deg,#16614f,#2f8f77);
              color:#fff;text-decoration:none;font-weight:900;font-size:15px;
              padding:15px 40px;border-radius:14px;letter-spacing:.02em;
              box-shadow:0 4px 16px rgba(22,97,79,0.3);">
              Complete My Tasks →
            </a>
          </td>
        </tr>

        <!-- ── Footer ── -->
        <tr>
          <td style="background:#f7f7f2;padding:18px 40px;text-align:center;
            border-top:1px solid #dfe4d6;">
            <p style="margin:0;font-size:12px;color:#aeb7a7;">
              Sent by <strong style="color:#16614f;">DevTrack AI</strong>
              · Your personal discipline OS
            </p>
            <p style="margin:5px 0 0;font-size:11px;color:#aeb7a7;">
              This reminder is sent automatically when you have overdue tasks.
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
            to: userEmail,
            subject: `📋 You have ${overdue.length} unfinished task${overdue.length !== 1 ? "s" : ""} — DevTrack AI`,
            html,
        });

        return NextResponse.json({ ok: true, emailedTo: userEmail, count: overdue.length });
    } catch (err) {
        console.error("Deadline check email error:", err);
        return NextResponse.json({ ok: true, emailError: true });
    }
}
