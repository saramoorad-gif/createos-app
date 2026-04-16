import { NextRequest, NextResponse } from "next/server";

// Email sending via Resend API
// Set RESEND_API_KEY in Vercel env vars
// Sign up at resend.com for free (100 emails/day)

export async function POST(req: NextRequest) {
  const { to, subject, body } = await req.json();

  if (!to || !subject || !body) {
    return NextResponse.json({ error: "Missing to, subject, or body" }, { status: 400 });
  }

  const apiKey = (process.env.RESEND_API_KEY || "").trim();

  if (!apiKey) {
    // If no email API configured, just log it
    console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
    return NextResponse.json({ sent: false, message: "Email API not configured — logged to console" });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Create Suite <noreply@createsuite.co>",
        to: [to],
        subject,
        html: body,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.message || "Email send failed" }, { status: 500 });
    }

    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }
}
