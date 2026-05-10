import type { Lang } from "@/lib/i18n";

type LStr = Record<Lang, string>;

export type Experience = {
  role: LStr;
  company: LStr;
  period: LStr;
  location?: LStr;
  bullets: LStr[];
};

export type Education = {
  school: LStr;
  degree: LStr;
  period: string;
  gpa?: string;
  notes?: LStr[];
};

export type SkillGroup = {
  group: LStr;
  items: LStr[];
};

export type HardSkill = { label: LStr; pct: number };

export type ProjectGroup = {
  role: LStr;
  period: string;
  clients: LStr[];
};

export type RoadmapItem = {
  key: "finance" | "cyber" | "kb" | "art";
  subdomain: string;
  title: LStr;
  tagline: LStr;
  description: LStr;
  features: LStr[];
  status: "Planned" | "In design" | "Prototyping" | "Live";
  accent: string;
  href: string;
};

export const profile = {
  name: { en: "Saksit Jantila", th: "ศักดิ์สิทธิ์ จันทิหล้า" } as LStr,
  handle: "nanoteofficial",
  headline: {
    en: "Senior Account Engineer — Cybersecurity",
    th: "Senior Account Engineer — ความมั่นคงปลอดภัยไซเบอร์",
  } as LStr,
  location: {
    en: "Bangkok, Thailand",
    th: "กรุงเทพมหานคร, ประเทศไทย",
  } as LStr,
  email: "saksit.jantila@gmail.com",
  linkedin: "https://www.linkedin.com/in/saksit-jantila-83b32614b/",
  github: "https://github.com/khantee8",
  summary: {
    en: "My career has equipped me with critical skills such as adaptability, resilience, and advanced problem-solving. I am passionate about connecting with the professional community, sharing knowledge, and contributing to successful project outcomes in the ever-changing world of IT, cybersecurity, and AI.",
    th: "เส้นทางอาชีพหล่อหลอมทักษะสำคัญให้ผม ทั้งการปรับตัว ความยืดหยุ่น และการแก้ปัญหาขั้นสูง ผมหลงใหลในการเชื่อมต่อกับ Community วิชาชีพ แบ่งปันความรู้ และร่วมสร้างความสำเร็จให้กับโครงการต่าง ๆ ในโลกของไอที ความมั่นคงปลอดภัยไซเบอร์ และ AI ที่เปลี่ยนแปลงอย่างรวดเร็ว",
  } as LStr,
  about: [
    {
      en: "Cybersecurity practitioner across SIEM, SOAR, SOC-as-a-Service, and Managed Security (MSSP) — with hands-on delivery for Thai government, banking, and critical-infrastructure clients.",
      th: "ผู้ปฏิบัติงานด้านความมั่นคงปลอดภัยไซเบอร์ ครอบคลุม SIEM, SOAR, SOC-as-a-Service และบริการ MSSP — ส่งมอบงานจริงให้กับลูกค้าภาครัฐ ธนาคาร และโครงสร้างพื้นฐานสำคัญของประเทศไทย",
    },
    {
      en: "Network & SDN architect with deep Cisco, Palo Alto, and Fortinet experience — translating vendor capability into outcomes that map to NIST and ISO 27001.",
      th: "สถาปนิกเครือข่ายและ SDN ที่มีประสบการณ์ลึกกับ Cisco, Palo Alto และ Fortinet — แปลงความสามารถของผลิตภัณฑ์ให้กลายเป็นผลลัพธ์ที่สอดคล้องกับ NIST และ ISO 27001",
    },
    {
      en: "MBA candidate at NIDA in Finance & MIS, exploring how applied AI shortens the loop between signal and decision for security and personal finance alike.",
      th: "กำลังศึกษาปริญญาโท MBA ที่ NIDA สาขาการเงินและระบบสารสนเทศเพื่อการจัดการ — ค้นคว้าเรื่อง AI ที่ช่วยย่นเวลาจากสัญญาณสู่การตัดสินใจ ทั้งในงานความปลอดภัยและการเงินส่วนบุคคล",
    },
  ],
  experience: [
    {
      role: {
        en: "Senior Account Engineer — Cybersecurity",
        th: "Senior Account Engineer — ความมั่นคงปลอดภัยไซเบอร์",
      },
      company: {
        en: "Advanced Information Technology PCL. (AIT)",
        th: "บริษัท แอดวานซ์ อินฟอร์เมชั่น เทคโนโลยี จำกัด (มหาชน) (AIT)",
      },
      period: { en: "Apr 2024 — Present", th: "เม.ย. 2024 — ปัจจุบัน" },
      bullets: [
        {
          en: "Lead cybersecurity project coordination across SIEM, SOAR, and SOC-as-a-Service engagements with strategic partners.",
          th: "นำการประสานงานโครงการด้านความมั่นคงปลอดภัยไซเบอร์ ครอบคลุม SIEM, SOAR และ SOC-as-a-Service ร่วมกับพันธมิตรเชิงกลยุทธ์",
        },
        {
          en: "Advise clients on best-practice compliance with NIST, ISO 27001, and Thai NCSA regulatory guidance.",
          th: "ให้คำปรึกษาด้าน Best Practice ตามมาตรฐาน NIST, ISO 27001 และข้อกำหนดของ สกมช. แก่ลูกค้า",
        },
        {
          en: "Design SOC and SOC-as-a-Service workflow processes that ensure high-quality MSSP delivery.",
          th: "ออกแบบกระบวนการทำงานของ SOC และ SOC-as-a-Service เพื่อยกระดับคุณภาพบริการ MSSP",
        },
      ],
    },
    {
      role: {
        en: "Senior Account Engineer — Government",
        th: "Senior Account Engineer — ลูกค้าภาครัฐ",
      },
      company: {
        en: "Advanced Information Technology PCL. (AIT)",
        th: "บริษัท แอดวานซ์ อินฟอร์เมชั่น เทคโนโลยี จำกัด (มหาชน) (AIT)",
      },
      period: { en: "Apr 2019 — Apr 2024", th: "เม.ย. 2019 — เม.ย. 2024" },
      bullets: [
        {
          en: "Designed and rolled out enhancements to Software-Defined Networks for Thai government enterprises.",
          th: "ออกแบบและขยายระบบ Software-Defined Network ให้กับองค์กรภาครัฐของไทย",
        },
        {
          en: "Led project-based deployment and maintenance of Cisco SD-Access and Cisco Firepower stacks.",
          th: "นำการติดตั้งและบำรุงรักษาเทคโนโลยี Cisco SD-Access และ Cisco Firepower ในโครงการต่าง ๆ",
        },
        {
          en: "Provided network-security expertise across Palo Alto, Fortinet, and Palo Alto Cortex XDR endpoint solutions.",
          th: "ให้ความเชี่ยวชาญด้านความปลอดภัยเครือข่าย ครอบคลุม Palo Alto, Fortinet และ Cortex XDR สำหรับปลายทาง",
        },
      ],
    },
    {
      role: { en: "Outsource Engineer", th: "วิศวกรเอาท์ซอร์ส" },
      company: {
        en: "Advanced Information Technology PCL. (AIT)",
        th: "บริษัท แอดวานซ์ อินฟอร์เมชั่น เทคโนโลยี จำกัด (มหาชน) (AIT)",
      },
      period: { en: "Oct 2016 — Apr 2019", th: "ต.ค. 2016 — เม.ย. 2019" },
      bullets: [
        {
          en: "Implemented core network and security infrastructure on-site for enterprise clients.",
          th: "ติดตั้งโครงสร้างเครือข่ายหลักและระบบความปลอดภัยให้ลูกค้าองค์กรในสถานที่จริง",
        },
        {
          en: "Provided SLA-covered maintenance and on-call technical support, reducing system failure rates.",
          th: "ให้บริการบำรุงรักษาตาม SLA และตอบสนองทางเทคนิคแบบ On-call ลดอัตราความล้มเหลวของระบบ",
        },
      ],
    },
  ] as Experience[],
  education: [
    {
      school: {
        en: "National Institute of Development Administration (NIDA)",
        th: "สถาบันบัณฑิตพัฒนบริหารศาสตร์ (NIDA)",
      },
      degree: {
        en: "M.B.A. — Finance & Management Information Systems",
        th: "ปริญญาโท บริหารธุรกิจ — สาขาการเงินและระบบสารสนเทศเพื่อการจัดการ",
      },
      period: "2024 — 2026",
      gpa: "3.68",
    },
    {
      school: { en: "Khon Kaen University (KKU)", th: "มหาวิทยาลัยขอนแก่น" },
      degree: {
        en: "M.Eng. — Computer Engineering",
        th: "ปริญญาโท วิศวกรรมศาสตร์ สาขาวิศวกรรมคอมพิวเตอร์",
      },
      period: "2014 — 2016",
      gpa: "3.50",
      notes: [
        {
          en: "Software-defined networking and IT security research.",
          th: "วิจัยด้านเครือข่ายที่กำหนดด้วยซอฟต์แวร์และความปลอดภัยของไอที",
        },
        {
          en: 'Published "A Security Analysis of a Hybrid Mechanism to Defend DDoS Attacks" — iEECON 2016.',
          th: 'เผยแพร่บทความวิจัย "A Security Analysis of a Hybrid Mechanism to Defend DDoS Attacks" ในงาน iEECON 2016',
        },
      ],
    },
    {
      school: { en: "Khon Kaen University (KKU)", th: "มหาวิทยาลัยขอนแก่น" },
      degree: {
        en: "B.Eng. — Computer Engineering",
        th: "ปริญญาตรี วิศวกรรมศาสตร์ สาขาวิศวกรรมคอมพิวเตอร์",
      },
      period: "2010 — 2014",
      gpa: "3.21",
      notes: [
        {
          en: "Coursework focused on network and signaling communication, software development.",
          th: "เน้นการศึกษาด้านการสื่อสารเครือข่ายและสัญญาณ และการพัฒนาซอฟต์แวร์",
        },
      ],
    },
  ] as Education[],
  certifications: [
    "CISSP",
    "CEH",
    "CCNP-Enterprise",
    "CCNP-Security",
    "Fortinet FCP",
    "PCNSE",
    "PMI-ACP",
    "SAL1",
    "CompTIA CySA+",
    "AI Solutions on Cisco Infrastructure Essentials",
  ],
  awards: [
    {
      en: "Great Employee of the Year — AIT (2024)",
      th: "พนักงานดีเด่นแห่งปี — AIT (2024)",
    },
    { en: "CSAI Development Team", th: "ทีมพัฒนาของ CSAI" },
    { en: "AI Literacy Instructor", th: "ผู้สอนความรู้พื้นฐานด้าน AI" },
  ],
  personality: {
    group: { en: "Personality", th: "บุคลิก" },
    items: [
      { en: "Critical Thinking", th: "การคิดเชิงวิพากษ์" },
      { en: "Problem Solving", th: "การแก้ปัญหา" },
      { en: "Motivation & Self-Awareness", th: "แรงจูงใจและการรู้จักตนเอง" },
      { en: "Agility", th: "ความคล่องตัว" },
      { en: "Creative Thinking", th: "ความคิดสร้างสรรค์" },
      { en: "Self-Taught", th: "เรียนรู้ด้วยตัวเอง" },
      { en: "Leadership", th: "ภาวะผู้นำ" },
      { en: "Empathy & Active Listening", th: "เห็นอกเห็นใจและรับฟังอย่างตั้งใจ" },
    ],
  } satisfies SkillGroup,
  hardSkills: [
    { label: { en: "Network & Cybersecurity", th: "เครือข่ายและไซเบอร์ซีเคียวริตี้" }, pct: 95 },
    { label: { en: "Project Management", th: "บริหารโครงการ" }, pct: 90 },
    { label: { en: "SOC & MSSP", th: "SOC และ MSSP" }, pct: 85 },
    { label: { en: "Standards & Compliance", th: "มาตรฐานและการกำกับ" }, pct: 70 },
    { label: { en: "AI & Data Analytics", th: "AI และการวิเคราะห์ข้อมูล" }, pct: 70 },
    { label: { en: "Cloud Security", th: "Cloud Security" }, pct: 60 },
  ] as HardSkill[],
  projects: [
    {
      role: {
        en: "Sr. Account Engineer — Cybersecurity",
        th: "Senior Account Engineer — ความมั่นคงปลอดภัยไซเบอร์",
      },
      period: "2024 — Present",
      clients: [
        {
          en: "Secretariat of the House of Representatives (Thai Parliament)",
          th: "สำนักงานเลขาธิการสภาผู้แทนราษฎร (รัฐสภาไทย)",
        },
        { en: "Bank of Thailand (BOT)", th: "ธนาคารแห่งประเทศไทย (ธปท.)" },
        {
          en: "National Cyber Security Agency (NCSA)",
          th: "สำนักงานความมั่นคงปลอดภัยไซเบอร์แห่งชาติ (สกมช.)",
        },
        { en: "Department of Lands (DOL)", th: "กรมที่ดิน" },
        {
          en: "Geo-Informatics & Space Technology Development Agency (GISTDA)",
          th: "สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ (สทอภ.)",
        },
      ],
    },
    {
      role: {
        en: "Sr. Account Engineer — Government",
        th: "Senior Account Engineer — ลูกค้าภาครัฐ",
      },
      period: "2019 — 2024",
      clients: [
        {
          en: "Digital Government Development Agency (DGA)",
          th: "สำนักงานพัฒนารัฐบาลดิจิทัล (DGA)",
        },
        {
          en: "National Science & Technology Development Agency (NSTDA)",
          th: "สำนักงานพัฒนาวิทยาศาสตร์และเทคโนโลยีแห่งชาติ (สวทช.)",
        },
        { en: "Deposit Protection Agency (DPA)", th: "สถาบันคุ้มครองเงินฝาก (DPA)" },
        { en: "Government Lottery Office (GLO)", th: "สำนักงานสลากกินแบ่งรัฐบาล (GLO)" },
        { en: "Thai Red Cross Society (TRCS)", th: "สภากาชาดไทย (TRCS)" },
        {
          en: "King Chulalongkorn Memorial Hospital (KCMH)",
          th: "โรงพยาบาลจุฬาลงกรณ์ สภากาชาดไทย (KCMH)",
        },
        { en: "Ministry of Finance (MOF)", th: "กระทรวงการคลัง (MOF)" },
        {
          en: "Metropolitan Waterworks Authority (MWA)",
          th: "การประปานครหลวง (MWA)",
        },
      ],
    },
    {
      role: { en: "Outsource Engineer", th: "วิศวกรเอาท์ซอร์ส" },
      period: "2016 — 2019",
      clients: [
        {
          en: "Department of Provincial Administration (DOPA)",
          th: "กรมการปกครอง (DOPA)",
        },
      ],
    },
  ] as ProjectGroup[],
};

export const roadmap: RoadmapItem[] = [
  {
    key: "finance",
    subdomain: "finance.nanoteofficial.me",
    title: { en: "Finance", th: "การเงิน" },
    tagline: {
      en: "Client portfolio analytics & financial planning",
      th: "วิเคราะห์พอร์ตลูกค้าและวางแผนการเงิน",
    },
    description: {
      en: "A member-only platform for clients I consult — to monitor portfolio performance, run risk scenarios, and stay informed with curated market news.",
      th: "แพลตฟอร์มสำหรับลูกค้าที่ปรึกษาเท่านั้น — ติดตามผลตอบแทนพอร์ต ทดสอบสถานการณ์ความเสี่ยง และติดตามข่าวตลาดที่คัดสรรมาเฉพาะตัว",
    },
    features: [
      {
        en: "Portfolio dashboard with cost basis & P/L tracking",
        th: "แดชบอร์ดพอร์ตที่ติดตามต้นทุนและกำไร/ขาดทุน",
      },
      {
        en: "Risk evaluation (volatility, concentration, currency)",
        th: "ประเมินความเสี่ยง (ผันผวน กระจุกตัว สกุลเงิน)",
      },
      {
        en: "Curated financial news filtered by holdings",
        th: "ข่าวการเงินคัดสรรตามหุ้นในพอร์ต",
      },
      {
        en: "Client login & multi-account workspace",
        th: "ระบบเข้าใช้งานสำหรับลูกค้า รองรับหลายบัญชี",
      },
    ],
    status: "Prototyping",
    accent: "from-emerald-500/20 to-emerald-500/0 border-emerald-500/30",
    href: "/finance",
  },
  {
    key: "cyber",
    subdomain: "cyber.nanoteofficial.me",
    title: { en: "Cyber", th: "ไซเบอร์" },
    tagline: {
      en: "Real-time threat monitoring for security professionals",
      th: "ติดตามภัยคุกคามไซเบอร์แบบเรียลไทม์สำหรับมืออาชีพ",
    },
    description: {
      en: "A live feed of cyber threats and industry-impacting events, designed to compress the time between detection and informed analysis for SOC teams and consultants.",
      th: "ฟีดสดของภัยคุกคามไซเบอร์และเหตุการณ์ที่กระทบอุตสาหกรรม ออกแบบมาเพื่อย่นเวลาระหว่างการตรวจจับและการวิเคราะห์ของทีม SOC และที่ปรึกษา",
    },
    features: [
      {
        en: "Live threat & CVE feed with severity scoring",
        th: "ฟีดภัยคุกคามและ CVE พร้อมคะแนนความรุนแรง",
      },
      {
        en: "Industry-tagged impact analysis",
        th: "วิเคราะห์ผลกระทบแยกตามอุตสาหกรรม",
      },
      { en: "Vendor advisory aggregation", th: "รวมคำแนะนำจาก Vendor หลายเจ้า" },
      { en: "Searchable incident history", th: "ค้นหาประวัติเหตุการณ์ย้อนหลังได้" },
    ],
    status: "In design",
    accent: "from-sky-500/20 to-sky-500/0 border-sky-500/30",
    href: "/cyber",
  },
  {
    key: "kb",
    subdomain: "kb.nanoteofficial.me",
    title: { en: "Knowledge Base", th: "ฐานความรู้" },
    tagline: {
      en: "Personal learning archive (private)",
      th: "คลังความรู้ส่วนตัว (เข้าใช้เฉพาะเจ้าของ)",
    },
    description: {
      en: "My private knowledge base — Claude Code recipes, vendor product setup notes, network and security install guides. Login required.",
      th: "ฐานความรู้ส่วนตัว — เคล็ดลับการใช้ Claude Code บันทึกการติดตั้งผลิตภัณฑ์ของ Vendor และคู่มือเครือข่าย/ความปลอดภัย ต้องเข้าสู่ระบบเพื่อเข้าใช้",
    },
    features: [
      {
        en: "Private — single-user authentication",
        th: "ส่วนตัว — ยืนยันตัวตนสำหรับผู้ใช้คนเดียว",
      },
      { en: "Markdown-based notes with tags", th: "บันทึกแบบ Markdown พร้อมแท็ก" },
      {
        en: "Vendor & product setup playbooks",
        th: "Playbook การติดตั้งผลิตภัณฑ์ของ Vendor",
      },
      { en: "Search across the entire archive", th: "ค้นหาภายในคลังทั้งหมด" },
    ],
    status: "Planned",
    accent: "from-amber-500/20 to-amber-500/0 border-amber-500/30",
    href: "/kb",
  },
  {
    key: "art",
    subdomain: "art.nanoteofficial.me",
    title: { en: "Art & Soul", th: "ศิลปะและจิตใจ" },
    tagline: {
      en: "Creative space — visual art and short-form video",
      th: "พื้นที่สร้างสรรค์ — ศิลปะภาพและวิดีโอสั้น",
    },
    description: {
      en: "A personal space for visual art and short videos — slower, less optimized, more felt. Built to develop the side of myself the other three apps don't reach.",
      th: "พื้นที่ส่วนตัวสำหรับศิลปะภาพและวิดีโอสั้น — ช้าลง คำนวณน้อยลง รู้สึกมากขึ้น สร้างขึ้นเพื่อหล่อเลี้ยงด้านที่อีกสามแอปเข้าไม่ถึง",
    },
    features: [
      { en: "Curated visual gallery", th: "แกลเลอรีภาพคัดสรร" },
      { en: "Short video reflections", th: "วิดีโอสั้นบันทึกความคิด" },
      { en: "Process notes & inspirations", th: "บันทึกกระบวนการและแรงบันดาลใจ" },
      { en: "No metrics — by design", th: "ไม่มีตัวเลขชี้วัด — โดยตั้งใจ" },
    ],
    status: "Planned",
    accent: "from-rose-500/20 to-rose-500/0 border-rose-500/30",
    href: "/art",
  },
];

export function pick(s: LStr, lang: Lang): string {
  return s[lang];
}
