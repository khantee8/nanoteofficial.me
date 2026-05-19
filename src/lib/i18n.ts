import { cookies } from "next/headers";

export type Lang = "en" | "th";

export const LANG_COOKIE = "lang";
export const DEFAULT_LANG: Lang = "en";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const v = store.get(LANG_COOKIE)?.value;
  return v === "th" ? "th" : "en";
}

type UiKey =
  | "nav.about"
  | "nav.experience"
  | "nav.roadmap"
  | "nav.contact"
  | "nav.education"
  | "nav.certs"
  | "nav.projects"
  | "cta.hire"
  | "cta.roadmap"
  | "cta.contact"
  | "cta.email"
  | "cta.linkedin"
  | "cta.cvEn"
  | "cta.cvTh"
  | "cta.preview"
  | "cta.back"
  | "section.about.eyebrow"
  | "section.about.title"
  | "section.about.description"
  | "section.roadmap.eyebrow"
  | "section.roadmap.title"
  | "section.roadmap.description"
  | "section.experience.eyebrow"
  | "section.experience.title"
  | "section.education.eyebrow"
  | "section.education.title"
  | "section.skills.eyebrow"
  | "section.skills.title"
  | "section.hardSkills.eyebrow"
  | "section.hardSkills.title"
  | "section.certs.eyebrow"
  | "section.certs.title"
  | "section.projects.eyebrow"
  | "section.projects.title"
  | "section.contact.eyebrow"
  | "section.contact.title"
  | "contact.cta.title"
  | "contact.cta.description"
  | "hero.location"
  | "hero.available"
  | "hero.scrollHint"
  | "footer.builtWith"
  | "footer.linkedin"
  | "footer.github"
  | "footer.email"
  | "lang.toggle.label"
  | "nav.menu"
  | "nav.close"
  | "cta.backToTop"
  | "kb.private"
  | "kb.signin"
  | "kb.signinHint"
  | "kb.email"
  | "kb.password"
  | "kb.disabled"
  | "subdomain.plannedFeatures"
  | "subdomain.preview"
  | "subdomain.comingTo"
  | "subdomain.comingDescription"
  | "subdomain.status"
  | "subdomain.holdings"
  | "subdomain.risk"
  | "subdomain.pnl"
  | "subdomain.holdingsHint"
  | "subdomain.riskHint"
  | "subdomain.pnlHint"
  | "subdomain.liveFeed"
  | "status.Planned"
  | "status.In design"
  | "status.Prototyping"
  | "status.Live"
  | "subdomain.launchApp"
  | "subdomain.nowLive"
  | "subdomain.liveDescription"
  | "subdomain.prototypeDescription"
  | "subdomain.inPrototype"
  | "contact.form.title"
  | "contact.form.subtitle"
  | "subdomain.threatsToday"
  | "subdomain.criticalCount"
  | "subdomain.lastUpdated";

const dict: Record<UiKey, Record<Lang, string>> = {
  "nav.about": { en: "About", th: "เกี่ยวกับ" },
  "nav.experience": { en: "Experience", th: "ประสบการณ์" },
  "nav.roadmap": { en: "Roadmap", th: "โรดแมป" },
  "nav.contact": { en: "Contact", th: "ติดต่อ" },
  "nav.education": { en: "Education", th: "การศึกษา" },
  "nav.certs": { en: "Certifications", th: "ใบรับรอง" },
  "nav.projects": { en: "Projects", th: "โปรเจกต์" },
  "cta.hire": { en: "Say hello", th: "ทักทาย" },
  "cta.roadmap": { en: "See the roadmap", th: "ดูโรดแมป" },
  "cta.contact": { en: "Get in touch", th: "ติดต่อผม" },
  "cta.email": { en: "Email", th: "อีเมล" },
  "cta.linkedin": { en: "LinkedIn", th: "ลิงก์อิน" },
  "cta.cvEn": { en: "Download CV (EN)", th: "ดาวน์โหลด CV (EN)" },
  "cta.cvTh": { en: "Download CV (TH)", th: "ดาวน์โหลด CV (TH)" },
  "cta.preview": { en: "Explore preview", th: "ดูตัวอย่าง" },
  "cta.back": { en: "Back to home", th: "กลับหน้าแรก" },
  "section.about.eyebrow": { en: "About", th: "เกี่ยวกับ" },
  "section.about.title": {
    en: "Strategy meets execution.",
    th: "กลยุทธ์พบการลงมือทำ",
  },
  "section.about.description": {
    en: "I bridge technology strategy with hands-on delivery — aligning cybersecurity, enterprise transformation, and business objectives to create resilient organizations.",
    th: "ผมเชื่อมกลยุทธ์เทคโนโลยีเข้ากับการส่งมอบงานจริง — ประสานความมั่นคงปลอดภัยไซเบอร์ การเปลี่ยนผ่านองค์กร และเป้าหมายธุรกิจ เพื่อสร้างองค์กรที่แข็งแกร่ง",
  },
  "section.roadmap.eyebrow": { en: "Roadmap", th: "โรดแมป" },
  "section.roadmap.title": { en: "What I'm building.", th: "สิ่งที่กำลังสร้าง" },
  "section.roadmap.description": {
    en: "Four projects, each with its own subdomain. The first two are the work I sell. The third I keep for myself. The fourth is for the part of me the others don't reach.",
    th: "สี่โปรเจกต์ แต่ละตัวมีซับโดเมนของตัวเอง สองตัวแรกเป็นงานที่ใช้ในวิชาชีพ ตัวที่สามไว้ใช้ส่วนตัว และตัวสุดท้ายเป็นพื้นที่สำหรับด้านที่อีกสามตัวเอื้อมไม่ถึง",
  },
  "section.experience.eyebrow": { en: "Experience", th: "ประสบการณ์" },
  "section.experience.title": { en: "Where I've worked.", th: "เส้นทางการทำงาน" },
  "section.education.eyebrow": { en: "Education", th: "การศึกษา" },
  "section.education.title": { en: "Academic background.", th: "ประวัติการศึกษา" },
  "section.skills.eyebrow": { en: "Working Style", th: "วิธีการทำงาน" },
  "section.skills.title": { en: "How I operate.", th: "แนวทางการทำงาน" },
  "section.hardSkills.eyebrow": { en: "Competencies", th: "สมรรถนะ" },
  "section.hardSkills.title": { en: "Core capabilities.", th: "ความสามารถหลัก" },
  "section.certs.eyebrow": { en: "Certifications", th: "ใบรับรอง" },
  "section.certs.title": { en: "Industry credentials.", th: "ประกาศนียบัตรในสายงาน" },
  "section.projects.eyebrow": { en: "Projects", th: "โปรเจกต์ที่ผ่านมา" },
  "section.projects.title": { en: "Selected clients.", th: "ลูกค้าที่ได้ร่วมงาน" },
  "section.contact.eyebrow": { en: "Contact", th: "ติดต่อ" },
  "section.contact.title": { en: "Let's talk.", th: "พูดคุยกันได้เลย" },
  "contact.cta.title": {
    en: "Got a project, a question, or a portfolio to review?",
    th: "มีโปรเจกต์ คำถาม หรือพอร์ตที่อยากให้ช่วยดู?",
  },
  "contact.cta.description": {
    en: "The fastest way to reach me is email. I usually reply within a day.",
    th: "ช่องทางที่เร็วที่สุดคืออีเมล ผมมักตอบกลับภายในหนึ่งวัน",
  },
  "hero.location": { en: "Bangkok, Thailand", th: "กรุงเทพมหานคร, ประเทศไทย" },
  "hero.available": { en: "open to a conversation", th: "เปิดรับการพูดคุย" },
  "hero.scrollHint": { en: "Scroll to explore", th: "เลื่อนเพื่อดูเพิ่มเติม" },
  "footer.builtWith": {
    en: "Built with Next.js & Tailwind.",
    th: "สร้างด้วย Next.js และ Tailwind",
  },
  "footer.linkedin": { en: "LinkedIn", th: "ลิงก์อิน" },
  "footer.github": { en: "GitHub", th: "กิตฮับ" },
  "footer.email": { en: "Email", th: "อีเมล" },
  "lang.toggle.label": { en: "Language", th: "ภาษา" },
  "nav.menu": { en: "Menu", th: "เมนู" },
  "nav.close": { en: "Close menu", th: "ปิดเมนู" },
  "cta.backToTop": { en: "Back to top", th: "กลับขึ้นด้านบน" },
  "kb.private": { en: "Private access", th: "การเข้าถึงเฉพาะเจ้าของ" },
  "kb.signin": { en: "Sign in", th: "เข้าสู่ระบบ" },
  "kb.signinHint": {
    en: "This knowledge base is private. Auth is not yet wired up — this is a visual placeholder for the planned login form.",
    th: "ฐานความรู้นี้เป็นแบบส่วนตัว ระบบยืนยันตัวตนยังไม่เปิดใช้งาน หน้านี้เป็นเพียงตัวอย่างของแบบฟอร์มเข้าสู่ระบบ",
  },
  "kb.email": { en: "Email", th: "อีเมล" },
  "kb.password": { en: "Password", th: "รหัสผ่าน" },
  "kb.disabled": {
    en: "Sign in (disabled in preview)",
    th: "เข้าสู่ระบบ (ปิดใช้ในโหมดพรีวิว)",
  },
  "subdomain.plannedFeatures": { en: "Planned features", th: "ฟีเจอร์ที่วางแผนไว้" },
  "subdomain.preview": { en: "Preview", th: "ตัวอย่าง" },
  "subdomain.comingTo": { en: "Coming to", th: "กำลังจะมาที่" },
  "subdomain.comingDescription": {
    en: "This is a public preview of what will live on the dedicated subdomain. The production app will be deployed separately and linked from here.",
    th: "นี่คือตัวอย่างสาธารณะของสิ่งที่จะอยู่บนซับโดเมนเฉพาะ แอปจริงจะถูกดีพลอยแยกและเชื่อมต่อกลับมาที่นี่",
  },
  "subdomain.status": { en: "Status:", th: "สถานะ:" },
  "subdomain.holdings": { en: "Holdings", th: "สินทรัพย์" },
  "subdomain.risk": { en: "Risk score", th: "คะแนนความเสี่ยง" },
  "subdomain.pnl": { en: "Daily P/L", th: "กำไร/ขาดทุนรายวัน" },
  "subdomain.holdingsHint": { en: "live portfolio sync", th: "ซิงก์พอร์ตแบบเรียลไทม์" },
  "subdomain.riskHint": {
    en: "volatility & concentration",
    th: "ความผันผวนและการกระจุกตัว",
  },
  "subdomain.pnlHint": { en: "vs cost basis", th: "เทียบกับต้นทุน" },
  "subdomain.liveFeed": { en: "Live feed (preview)", th: "ฟีดสด (พรีวิว)" },
  "status.Planned": { en: "Planned", th: "วางแผน" },
  "status.In design": { en: "In design", th: "ออกแบบ" },
  "status.Prototyping": { en: "Prototyping", th: "ทำต้นแบบ" },
  "status.Live": { en: "Live", th: "ใช้งานจริง" },
  "subdomain.launchApp": { en: "Open Finance App", th: "เปิดแอป Finance" },
  "subdomain.nowLive": { en: "Now live", th: "ใช้งานจริงแล้ว" },
  "subdomain.liveDescription": {
    en: "The full platform is deployed and ready. Advisor and client portals, portfolio analytics, Monte Carlo simulations, and the AI assistant are all live.",
    th: "แพลตฟอร์มเต็มรูปแบบถูกดีพลอยและพร้อมใช้งานแล้ว ทั้งพอร์ทัลที่ปรึกษา พอร์ทัลลูกค้า การวิเคราะห์พอร์ต การจำลอง Monte Carlo และผู้ช่วย AI",
  },
  "subdomain.prototypeDescription": {
    en: "The platform is in active prototype phase — core features are being validated with early users. Portfolio analytics, risk evaluation, and the dashboard are under development.",
    th: "แพลตฟอร์มอยู่ในระยะต้นแบบ — ฟีเจอร์หลักกำลังถูกทดสอบกับผู้ใช้กลุ่มแรก การวิเคราะห์พอร์ต การประเมินความเสี่ยง และแดชบอร์ดอยู่ระหว่างการพัฒนา",
  },
  "subdomain.inPrototype": { en: "Prototype phase", th: "ระยะต้นแบบ" },
  "contact.form.title": {
    en: "Or send a message directly",
    th: "หรือส่งข้อความถึงผมได้โดยตรง",
  },
  "contact.form.subtitle": {
    en: "I'll get back to you within one business day.",
    th: "ผมจะตอบกลับภายในหนึ่งวันทำการ",
  },
  "subdomain.threatsToday": { en: "Threats today", th: "ภัยคุกคามวันนี้" },
  "subdomain.criticalCount": { en: "Critical", th: "วิกฤต" },
  "subdomain.lastUpdated": { en: "Last updated", th: "อัปเดตล่าสุด" },
};

export function t(key: UiKey, lang: Lang): string {
  return dict[key][lang];
}
