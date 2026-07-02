import "server-only";

const SIGNIN_URL = "https://nanoteofficial.me/plan/signin";
const FROM = "NaNote Plan <noreply@nanoteofficial.me>";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

/** Bilingual invite email. Contains no token or secret — it points at the
 *  normal magic-link sign-in page. Returns false on any failure. */
export async function sendInviteEmail(to: string, invitedBy: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const btn = `display:inline-block;background:#3B4FBF;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none`;
  const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="margin:0 0 8px">You&rsquo;re invited to Plan</h2>
  <p style="color:#555">${esc(invitedBy)} invited you to the Plan workspace on nanoteofficial.me. Sign in with this email address to get started.</p>
  <p><a href="${SIGNIN_URL}" style="${btn}">Sign in</a></p>
  <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
  <h2 style="margin:0 0 8px">คุณได้รับเชิญเข้าร่วม Plan</h2>
  <p style="color:#555">${esc(invitedBy)} เชิญคุณเข้าร่วมพื้นที่ทำงาน Plan บน nanoteofficial.me ลงชื่อเข้าใช้ด้วยอีเมลนี้เพื่อเริ่มต้น</p>
  <p><a href="${SIGNIN_URL}" style="${btn}">เข้าสู่ระบบ</a></p>
</div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject: "You're invited to Plan · คุณได้รับเชิญเข้าร่วม Plan",
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
