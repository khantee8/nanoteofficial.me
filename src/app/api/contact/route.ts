import { NextResponse } from "next/server";
import { Resend } from "resend";

const TO = process.env.CONTACT_EMAIL ?? "khantee9@gmail.com";

const MAX_NAME = 100;
const MAX_EMAIL = 320;
const MAX_MSG = 2000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body as Record<string, unknown>;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string"
    ) {
      return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
    }

    const n = name.trim();
    const e = email.trim();
    const m = message.trim();

    if (n.length < 2 || n.length > MAX_NAME) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (e.length < 5 || e.length > MAX_EMAIL || !e.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (m.length < 10 || m.length > MAX_MSG) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: "nanoteofficial.me <onboarding@resend.dev>",
      to: TO,
      replyTo: e,
      subject: `[nanoteofficial.me] Message from ${n}`,
      text: `Name: ${n}\nEmail: ${e}\n\n${m}`,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 422 });
    }

    return NextResponse.json({ ok: true, id: result.data?.id });
  } catch {
    return NextResponse.json(
      { error: "Failed to send" },
      { status: 500 },
    );
  }
}
