import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { env } from "@/lib/env";

export async function POST(request: Request) {
    try {
        const { email, pendingCount } = await request.json() as { email: string; pendingCount: number };

        if (!email || typeof email !== "string") {
            return NextResponse.json({ error: "Valid email required." }, { status: 400 });
        }

        // Validate SMTP config
        if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
            return NextResponse.json({ error: "SMTP not configured." }, { status: 503 });
        }

        const transporter = nodemailer.createTransport({
            host: env.smtpHost,
            port: env.smtpPort,
            secure: env.smtpPort === 465,
            auth: { user: env.smtpUser, pass: env.smtpPass },
        });

        const today = new Date().toLocaleDateString("en-IN", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
        });

        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Task Reminder — DevTrack AI</title>
</head>
<body style="margin:0;padding:0;background:#f7f7f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f2;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #dfe4d6;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#16614f,#2f8f77);padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:28px;">📬</p>
            <h1 style="margin:12px 0 4px;color:#ffffff;font-size:22px;font-weight:900;">Task Reminder</h1>
            <p style="margin:0;color:rgba(255,255,255,0.7);font-size:14px;">${today}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 20px;font-size:16px;color:#171915;font-weight:700;">Hey there 👋</p>

            <p style="margin:0 0 24px;font-size:15px;color:#62685d;line-height:1.7;">
              You still have <strong style="color:#16614f;">${pendingCount} pending task${pendingCount !== 1 ? "s" : ""}</strong> that need your attention today.
              Don&apos;t let them pile up — even completing one task keeps the momentum going!
            </p>

            <!-- Stats box -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f7f7f2;border-radius:16px;border:1px solid #dfe4d6;margin-bottom:28px;">
              <tr>
                <td style="padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="text-align:center;padding:8px 0;">
                        <p style="margin:0;font-size:36px;font-weight:900;color:#ef4444;">${pendingCount}</p>
                        <p style="margin:4px 0 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#62685d;">
                          Pending Task${pendingCount !== 1 ? "s" : ""}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Tips -->
            <p style="margin:0 0 12px;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:#62685d;">
              Quick Tips
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              ${[
                "🎯 Start with your highest-priority task first",
                "⏱️ Use the Focus Timer for a 25-min Pomodoro session",
                "✅ Even completing 1 task builds momentum",
                "📊 Track your progress on the Dashboard",
            ].map(tip => `
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#62685d;line-height:1.5;">${tip}</td>
                </tr>`).join("")}
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="${env.appUrl}/tasks"
                    style="display:inline-block;background:linear-gradient(135deg,#16614f,#2f8f77);color:#ffffff;
                    text-decoration:none;font-weight:900;font-size:15px;padding:14px 36px;
                    border-radius:14px;letter-spacing:.02em;">
                    Open My Tasks →
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
              You requested this reminder from your Dashboard.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

        await transporter.sendMail({
            from: `"DevTrack AI" <${env.smtpUser}>`,
            to: email,
            subject: `⚡ You have ${pendingCount} pending task${pendingCount !== 1 ? "s" : ""} — DevTrack AI`,
            html,
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Reminder email error:", err);
        return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
    }
}
