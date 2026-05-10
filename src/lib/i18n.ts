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
  | "status.Live";

const dict: Record<UiKey, Record<Lang, string>> = {
  "nav.about": { en: "About", th: "เกี่ยวกับ" },
  "nav.experience": { en: "Experience", th: "ประสบการณ์" },
  "nav.roadmap": { en: "Roadmap", th: "โรดแมป" },
  "nav.contact": { en: "Contact", th: "ติดต่อ" },
  "nav.education": { en: "Education", th: "การศึกษา" },
  "nav.certs": { en: "Certifications", th: "ใบรับรอง" },
  "nav.projects": { en: "Projects", th: "โปรเจกต์" },
  "cta.hire": { en: "Hire me", th: "ร่วมงาน" },
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
    en: "Two disciplines, one mindset.",
    th: "สองศาสตร์ หนึ่งวิธีคิด",
  },
  "section.about.description": {
    en: "I treat security and personal finance as the same kind of problem: identify exposure, decide what's worth defending, then build systems that hold up when conditions change.",
    th: "ผมมองงานความมั่นคงปลอดภัยไซเบอร์และการเงินส่วนบุคคลเป็นปัญหาเดียวกัน คือ ระบุความเสี่ยง ตัดสินใจว่าจะปกป้องอะไร แล้วออกแบบระบบที่ยังเชื่อถือได้เมื่อสภาพแวดล้อมเปลี่ยน",
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
  "section.skills.eyebrow": { en: "Personality", th: "บุคลิก" },
  "section.skills.title": { en: "How I work.", th: "วิธีการทำงาน" },
  "section.hardSkills.eyebrow": { en: "Hard skills", th: "ทักษะเฉพาะด้าน" },
  "section.hardSkills.title": { en: "Technical depth.", th: "ความเชี่ยวชาญทางเทคนิค" },
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
  "hero.available": { en: "available for new opportunities", th: "เปิดรับโอกาสใหม่ ๆ" },
  "hero.scrollHint": { en: "Scroll to explore", th: "เลื่อนเพื่อดูเพิ่มเติม" },
  "footer.builtWith": {
    en: "Built with Next.js & Tailwind.",
    th: "สร้างด้วย Next.js และ Tailwind",
  },
  "footer.linkedin": { en: "LinkedIn", th: "ลิงก์อิน" },
  "footer.github": { en: "GitHub", th: "กิตฮับ" },
  "footer.email": { en: "Email", th: "อีเมล" },
  "lang.toggle.label": { en: "Language", th: "ภาษา" },
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
};

export function t(key: UiKey, lang: Lang): string {
  return dict[key][lang];
}
