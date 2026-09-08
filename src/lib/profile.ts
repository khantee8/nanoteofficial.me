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

export type ProjectGroup = {
  role: LStr;
  period: string;
  clients: LStr[];
};

/**
 * A shipped internal tool. Summary level only — the full architecture model
 * (nodes, edges, protocols) lives in the private `tools.nanoteofficial.me`
 * repo, which is the source of truth. Keep these fields in step with the
 * `systems.ts` public model there; do not add configuration detail here.
 */
export type ToolItem = {
  key: string;
  name: LStr;
  tagline: LStr;
  purpose: LStr;
  /**
   * Stated honestly, including where that is unflattering. `planned` is the
   * one tier with no system behind it yet: it has no drill-in graph and no
   * architecture page, and the map draws it dashed so it cannot be mistaken
   * for something that ships.
   */
  maturity: "production" | "minimal" | "shell" | "planned";
  repoVisibility: "public" | "private";
  /**
   * Architecture page on tools.nanoteofficial.me. Absent for `planned` tools —
   * there is nothing to drill into.
   */
  href?: string;
  stack: string[];
};

/**
 * Public-safe internal graph for one tool, used by the #tools drill-down.
 * Mirrors the `nodes`/`edges` of the same system in the private
 * tools.nanoteofficial.me repo. Labels only — never configuration.
 */
export type ToolNodeKind = "app" | "service" | "datastore" | "external" | "job" | "channel";
export type ToolNode = { id: string; kind: ToolNodeKind; label: LStr };
export type ToolGraphEdge = { from: string; to: string; label: LStr };
export type ToolGraph = { nodes: ToolNode[]; edges: ToolGraphEdge[] };

export type ToolEdge = { from: string; to: string; label: LStr };

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
    en: "Technology Strategy & Cybersecurity | IT Risk & Governance | MBA — Finance & MIS",
    th: "กลยุทธ์เทคโนโลยีและความมั่นคงปลอดภัยไซเบอร์ | ความเสี่ยงด้าน IT และการกำกับดูแล | MBA — การเงินและ MIS",
  } as LStr,
  location: {
    en: "Bangkok, Thailand",
    th: "กรุงเทพมหานคร, ประเทศไทย",
  } as LStr,
  email: "saksit.jantila@gmail.com",
  linkedin: "https://www.linkedin.com/in/saksit-jantila-83b32614b/",
  github: "https://github.com/khantee8",
  summary: {
    en: "My career has equipped me with adaptability, resilience, and strong problem-solving capabilities through enterprise technology and cybersecurity projects across government and financial-sector organizations. I am passionate about technology innovation, AI, cybersecurity, and continuous learning, with strong interest in business transformation and strategic technology initiatives.",
    th: "เส้นทางอาชีพได้หล่อหลอมทักษะด้านการปรับตัว ความยืดหยุ่น และความสามารถในการแก้ปัญหา ผ่านประสบการณ์ด้านเทคโนโลยีองค์กรและโครงการด้านความมั่นคงปลอดภัยไซเบอร์สำหรับหน่วยงานภาครัฐและองค์กรภาคการเงิน ผมมีความสนใจในนวัตกรรมเทคโนโลยี AI ความมั่นคงปลอดภัยไซเบอร์ และการเรียนรู้อย่างต่อเนื่อง พร้อมทั้งมุ่งมั่นในด้าน Business Transformation และ Strategic Technology Initiatives",
  } as LStr,
  about: [
    {
      en: "Enterprise technology strategist and cybersecurity leader — driving security transformation, governance, and operational resilience for government and financial-sector organizations across Thailand.",
      th: "ผู้นำด้านกลยุทธ์เทคโนโลยีและความมั่นคงปลอดภัยไซเบอร์ — ขับเคลื่อนการเปลี่ยนผ่านด้านความมั่นคงปลอดภัย การกำกับดูแล และความยืดหยุ่นในการดำเนินงานให้กับหน่วยงานภาครัฐและองค์กรภาคการเงินในประเทศไทย",
    },
    {
      en: "Deep expertise spanning XDR, SIEM, SOAR, SOC-as-a-Service, SDN architecture, and enterprise security — plus emerging-technology advisory on AI defense and Post-Quantum Cryptography (PQC).",
      th: "ความเชี่ยวชาญเชิงลึกครอบคลุม XDR, SIEM, SOAR, SOC-as-a-Service, สถาปัตยกรรม SDN และ Enterprise Security — พร้อมการให้คำปรึกษาด้านเทคโนโลยีใหม่ ทั้ง AI Defense และการเข้ารหัสหลังควอนตัม (PQC)",
    },
    {
      en: "MBA graduate from NIDA in Finance & MIS, passionate about business transformation, strategic technology initiatives, and applied AI to shorten the loop between insight and decision.",
      th: "สำเร็จการศึกษา MBA จาก NIDA สาขาการเงินและ MIS มีความสนใจในด้าน Business Transformation กลยุทธ์เทคโนโลยี และ AI เพื่อย่นระยะเวลาจาก Insight สู่การตัดสินใจ",
    },
  ],
  experience: [
    {
      role: {
        en: "Senior Cybersecurity Consultant (Pre-sales)",
        th: "ที่ปรึกษาอาวุโสด้านความมั่นคงปลอดภัยไซเบอร์ (Pre-sales)",
      },
      company: {
        en: "Advanced Information Technology PCL. (AIT)",
        th: "บริษัท แอดวานซ์ อินฟอร์เมชั่น เทคโนโลยี จำกัด (มหาชน) (AIT)",
      },
      period: { en: "July 2026 — Present", th: "ก.ค. 2026 — ปัจจุบัน" },
      bullets: [
        {
          en: "Cybersecurity consulting and solution advisory — prepared technology proposals and Proof of Value (POV) engagements for IT Security, Cloud Security, XDR, SIEM, SOAR, SOC, and MSSP, including Bill of Materials (BOM) development for accurate budgeting.",
          th: "ให้คำปรึกษาด้านความมั่นคงปลอดภัยไซเบอร์และการออกแบบโซลูชัน — จัดเตรียมข้อเสนอด้านเทคโนโลยีและการพิสูจน์คุณค่า (POV) สำหรับงาน IT Security, Cloud Security, XDR, SIEM, SOAR, SOC และ MSSP รวมถึงจัดทำ Bill of Materials (BOM) เพื่อการประมาณการงบประมาณที่แม่นยำ",
        },
        {
          en: "Emerging technology enabler — showcased AI defense and Post-Quantum Cryptography (PQC) with vendor partners, highlighting advances across the security landscape.",
          th: "เป็นผู้สนับสนุนเทคโนโลยีใหม่ — นำเสนอ AI Defense และการเข้ารหัสหลังควอนตัม (PQC) ร่วมกับผู้จำหน่ายหลายราย โดยเน้นย้ำถึงความก้าวหน้าในด้านความมั่นคงปลอดภัย",
        },
        {
          en: "Applied governance, risk, and compliance frameworks — including NIST, ISO 27001, and CRAF — to strengthen security controls and organizational resilience.",
          th: "ประยุกต์ใช้กรอบการกำกับดูแล ความเสี่ยง และการปฏิบัติตามมาตรฐาน เช่น NIST, ISO 27001 และ CRAF เพื่อเสริมสร้างการควบคุมความปลอดภัยและความยืดหยุ่นขององค์กร",
        },
        {
          en: "Security architecture and solution design focused on stakeholder engagement, aligning security strategy with business needs.",
          th: "ออกแบบสถาปัตยกรรมและโซลูชันด้านความมั่นคงปลอดภัยที่มุ่งเน้นการมีส่วนร่วมของผู้มีส่วนได้ส่วนเสีย และการปรับให้สอดคล้องกับความต้องการทางธุรกิจ",
        },
      ],
    },
    {
      role: {
        en: "Senior Account Engineer — Cybersecurity",
        th: "Senior Account Engineer — ความมั่นคงปลอดภัยไซเบอร์",
      },
      company: {
        en: "Advanced Information Technology PCL. (AIT)",
        th: "บริษัท แอดวานซ์ อินฟอร์เมชั่น เทคโนโลยี จำกัด (มหาชน) (AIT)",
      },
      period: { en: "Apr 2024 — July 2026", th: "เม.ย. 2024 — ก.ค. 2026" },
      bullets: [
        {
          en: "Led cybersecurity transformation initiatives for enterprise and government clients, delivering strategic solutions including XDR, SIEM, SOAR, and SOC-as-a-Service.",
          th: "นำโครงการด้าน Cybersecurity Transformation สำหรับองค์กรภาครัฐและองค์กรระดับ Enterprise โดยส่งมอบโซลูชันเชิงกลยุทธ์ เช่น XDR, SIEM, SOAR และ SOC-as-a-Service",
        },
        {
          en: "Advised clients on cybersecurity governance, risk management, and compliance aligned with NIST, ISO 27001, and NCSA frameworks.",
          th: "ให้คำปรึกษาด้าน Cybersecurity Governance, Risk Management และ Compliance ที่สอดคล้องกับกรอบมาตรฐาน NIST, ISO 27001 และแนวทางของ NCSA",
        },
        {
          en: "Optimized SOC workflows and service processes to improve incident response and managed security service quality.",
          th: "ปรับปรุงกระบวนการทำงานของ SOC และกระบวนการให้บริการ เพื่อเพิ่มประสิทธิภาพการตอบสนองต่อ Incident และยกระดับคุณภาพบริการด้าน Managed Security Services",
        },
        {
          en: "Aligned cybersecurity initiatives with business objectives, digital infrastructure modernization, and cyber resilience strategies.",
          th: "ผลักดันโครงการด้าน Cybersecurity ให้สอดคล้องกับเป้าหมายทางธุรกิจ การปรับปรุงโครงสร้างพื้นฐานดิจิทัล และยุทธศาสตร์ด้าน Cyber Resilience",
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
          en: "Managed enterprise network and cybersecurity projects for government and public-sector organizations, supporting digital transformation and infrastructure modernization.",
          th: "บริหารโครงการด้าน Enterprise Network และ Cybersecurity สำหรับหน่วยงานภาครัฐและองค์กรภาครัฐวิสาหกิจ เพื่อสนับสนุน Digital Transformation และการปรับปรุงโครงสร้างพื้นฐานให้ทันสมัย",
        },
        {
          en: "Delivered SDN, enterprise security, network segmentation, endpoint protection, and risk-mitigation solutions to improve scalability, efficiency, and resilience.",
          th: "ส่งมอบโซลูชัน SDN, Enterprise Security, Network Segmentation, Endpoint Protection และการลดความเสี่ยง เพื่อเพิ่มความสามารถในการขยายตัว ประสิทธิภาพ และความยืดหยุ่นของระบบ",
        },
        {
          en: "Coordinated stakeholders, technology partners, and client management teams to deliver projects aligned with business goals.",
          th: "ประสานงานกับผู้มีส่วนได้ส่วนเสีย พันธมิตรทางเทคโนโลยี และทีมบริหารลูกค้า เพื่อส่งมอบโครงการที่สอดคล้องกับเป้าหมายทางธุรกิจ",
        },
        {
          en: "Provided strategic technical consultation and contributed to major initiatives for DGA, NSTDA, Ministry of Finance, and other national agencies.",
          th: "ให้คำปรึกษาเชิงกลยุทธ์ด้านเทคนิค และมีส่วนร่วมในโครงการสำคัญของ DGA, NSTDA, กระทรวงการคลัง และหน่วยงานระดับชาติอื่น ๆ",
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
          en: "Supported implementation and maintenance of enterprise network and security infrastructure for government-sector clients.",
          th: "สนับสนุนการติดตั้งและดูแลระบบ Enterprise Network และ Security Infrastructure สำหรับหน่วยงานภาครัฐ",
        },
        {
          en: "Managed SLA-based support services to ensure operational continuity and service reliability.",
          th: "ดูแลการให้บริการตาม SLA เพื่อรักษาความต่อเนื่องในการดำเนินงานและเสถียรภาพของบริการ",
        },
        {
          en: "Provided technical troubleshooting and infrastructure support that contributed to improved system stability and reduced operational disruptions.",
          th: "สนับสนุนการวิเคราะห์และแก้ไขปัญหาด้านเทคนิค ซึ่งช่วยลดผลกระทบต่อระบบและเพิ่มเสถียรภาพในการดำเนินงานขององค์กร",
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
          th: "วิจัยด้านเครือข่ายที่กำหนดด้วยซอฟต์แวร์และความปลอดภัยของ IT",
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
    "Investment Consultant (IC) License",
    "AI Solutions on Cisco Infrastructure Essentials",
  ],
  awards: [
    {
      en: "Great Employee of the Year — AIT (2024)",
      th: "พนักงานดีเด่นแห่งปี — AIT (2024)",
    },
    { en: "AI Literacy Instructor", th: "ผู้สอนความรู้พื้นฐานด้าน AI" },
    { en: "CSAI Development Team Member", th: "สมาชิกทีมพัฒนาของ CSAI" },
    { en: "Welfare Committee Member", th: "กรรมการสวัสดิการ" },
    { en: "ISO/IEC 27001 Internal Audit Team Member", th: "สมาชิกทีมตรวจสอบภายใน ISO/IEC 27001" },
  ],
  personality: {
    group: { en: "Working Style", th: "วิธีการทำงาน" },
    items: [
      { en: "Strategic & Critical Thinking", th: "การคิดเชิงกลยุทธ์และเชิงวิเคราะห์" },
      { en: "Problem Solving & Analytical Mindset", th: "การแก้ปัญหาและการคิดเชิงวิเคราะห์" },
      { en: "Leadership & Stakeholder Coordination", th: "ภาวะผู้นำและการประสานงานกับผู้มีส่วนเกี่ยวข้อง" },
      { en: "Communication & Active Listening", th: "การสื่อสารและการรับฟังอย่างมีประสิทธิภาพ" },
      { en: "Adaptability & Learning Agility", th: "ความสามารถในการปรับตัวและการเรียนรู้อย่างต่อเนื่อง" },
      { en: "Creative & Innovative Thinking", th: "ความคิดสร้างสรรค์และนวัตกรรม" },
      { en: "Cross-Functional Collaboration", th: "การทำงานร่วมกันระหว่างหน่วยงาน" },
      { en: "Resilience Under Pressure", th: "ความสามารถในการทำงานภายใต้แรงกดดัน" },
    ],
  } satisfies SkillGroup,
  hardSkills: [
    { en: "Technology Strategy & Planning", th: "การวางแผนและกลยุทธ์ด้านเทคโนโลยี" },
    { en: "Cybersecurity Governance", th: "การกำกับดูแลด้านความมั่นคงปลอดภัยไซเบอร์" },
    { en: "SOC & MSSP Operations", th: "การดำเนินงานด้าน SOC และ MSSP" },
    { en: "Cloud & Network Security", th: "ความมั่นคงปลอดภัยด้าน Cloud และเครือข่าย" },
    { en: "Enterprise Transformation", th: "การเปลี่ยนผ่านองค์กร" },
    { en: "Cross-Functional Collaboration", th: "การทำงานร่วมกันระหว่างหน่วยงาน" },
    { en: "IT Governance & Compliance", th: "การกำกับดูแลด้าน IT และการปฏิบัติตามข้อกำหนด" },
    { en: "Digital Infrastructure (SDN)", th: "โครงสร้างพื้นฐานดิจิทัล (SDN)" },
    { en: "AI & Technology Innovation", th: "นวัตกรรมด้าน AI และเทคโนโลยี" },
    { en: "Risk & Compliance", th: "การบริหารความเสี่ยงและการปฏิบัติตามข้อกำหนด" },
    { en: "Project & Program Management", th: "การบริหารโครงการ" },
  ] as LStr[],
  projects: [
    {
      role: {
        en: "Senior Cybersecurity Consultant (Pre-sales)",
        th: "ที่ปรึกษาอาวุโสด้านความมั่นคงปลอดภัยไซเบอร์ (Pre-sales)",
      },
      period: "2026 — Present",
      clients: [
        {
          en: "National Cyber Security Agency (NCSA)",
          th: "สำนักงานความมั่นคงปลอดภัยไซเบอร์แห่งชาติ (สกมช.)",
        },
        {
          en: "SME Development Bank (SME D Bank)",
          th: "ธนาคารพัฒนาวิสาหกิจขนาดกลางและขนาดย่อมแห่งประเทศไทย (SME D Bank)",
        },
        { en: "Social Security Office (SSO)", th: "สำนักงานประกันสังคม (SSO)" },
        { en: "Ministry of Finance (MOF)", th: "กระทรวงการคลัง (MOF)" },
      ],
    },
    {
      role: {
        en: "Sr. Account Engineer — Cybersecurity",
        th: "Senior Account Engineer — ความมั่นคงปลอดภัยไซเบอร์",
      },
      period: "2024 — 2026",
      clients: [
        {
          en: "Secretariat of the House of Representatives (Thai Parliament)",
          th: "สำนักงานเลขาธิการสภาผู้แทนราษฎร (รัฐสภาไทย)",
        },
        { en: "Bank of Thailand (BOT)", th: "ธนาคารแห่งประเทศไทย (ธปท.)" },
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
      en: "Advisor & client interface — analytics still in development",
      th: "ส่วนติดต่อสำหรับที่ปรึกษาและลูกค้า — ส่วนวิเคราะห์ยังพัฒนาไม่เสร็จ",
    },
    description: {
      en: "An authenticated workspace with separate advisor, client and admin views. Sign-in and role-based routing are live; the portfolio analytics behind them are still being built.",
      th: "พื้นที่ทำงานที่ต้องยืนยันตัวตน แยกมุมมองสำหรับที่ปรึกษา ลูกค้า และผู้ดูแล ระบบเข้าสู่ระบบและการแยกสิทธิ์ตามบทบาทใช้งานได้จริงแล้ว ส่วนการวิเคราะห์พอร์ตยังอยู่ระหว่างพัฒนา",
    },
    features: [
      {
        en: "Role-based sign-in (advisor, client, admin)",
        th: "เข้าสู่ระบบแยกตามบทบาท (ที่ปรึกษา ลูกค้า ผู้ดูแล)",
      },
      {
        en: "Distinct workspace layout per role",
        th: "หน้าจอทำงานแยกตามแต่ละบทบาท",
      },
      {
        en: "Portfolio & risk analytics — in progress",
        th: "การวิเคราะห์พอร์ตและความเสี่ยง — อยู่ระหว่างพัฒนา",
      },
      {
        en: "AI assistant — planned",
        th: "ผู้ช่วย AI — อยู่ในแผน",
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
      en: "Threat intelligence in the open, ISO 27001 governance behind a login",
      th: "ข่าวกรองภัยคุกคามแบบเปิด และการกำกับดูแล ISO 27001 หลังการเข้าสู่ระบบ",
    },
    description: {
      en: "What is being exploited right now, aggregated from free public feeds and readable without an account — and, for those invited, a persisted ISO/IEC 27001 workspace where controls, risks and evidence are actually tracked.",
      th: "สิ่งที่กำลังถูกโจมตีอยู่ตอนนี้ รวบรวมจากฟีดสาธารณะที่ใช้ได้ฟรีและอ่านได้โดยไม่ต้องมีบัญชี — และสำหรับผู้ได้รับเชิญ คือพื้นที่ทำงาน ISO/IEC 27001 ที่บันทึกมาตรการควบคุม ความเสี่ยง และหลักฐานไว้จริง",
    },
    features: [
      {
        en: "Known-exploited vulnerabilities joined with EPSS likelihood scoring",
        th: "ช่องโหว่ที่ถูกใช้โจมตีจริง จับคู่กับคะแนนความน่าจะเป็น EPSS",
      },
      {
        en: "Ransomware victims, C2 infrastructure and infocon on one world map",
        th: "เหยื่อแรนซัมแวร์ โครงสร้าง C2 และระดับ infocon บนแผนที่โลกเดียว",
      },
      {
        en: "All 93 ISO/IEC 27001:2022 Annex A controls with gap assessment by theme",
        th: "มาตรการควบคุม Annex A ของ ISO/IEC 27001:2022 ครบ 93 ข้อ พร้อมประเมินช่องว่างตามธีม",
      },
      {
        en: "5×5 risk register and a Statement of Applicability that refuses to export an unjustified exclusion",
        th: "ทะเบียนความเสี่ยง 5×5 และ Statement of Applicability ที่ปฏิเสธการส่งออกเมื่อมีข้อยกเว้นที่ไม่มีเหตุผลรองรับ",
      },
    ],
    status: "Live",
    accent: "from-sky-500/20 to-sky-500/0 border-sky-500/30",
    href: "https://cyber.nanoteofficial.me",
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
    status: "Live",
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

/**
 * The internal toolchain — the systems actually used to run the work, most of
 * which live in private repositories. Ordered by how central each is to the
 * platform rather than alphabetically.
 */
export const tools: ToolItem[] = [
  {
    key: "company",
    name: { en: "AI Company", th: "บริษัท AI" },
    tagline: {
      en: "Six AI departments that research, write and publish on a schedule",
      th: "หกแผนก AI ที่ค้นคว้า เขียน และเผยแพร่ตามตารางเวลา",
    },
    purpose: {
      en: "The engine of the toolchain. Autonomous agents produce cited research on their own cadence, and everything downstream reads what they publish.",
      th: "เครื่องยนต์ของระบบทั้งหมด เอเจนต์ทำงานเองตามรอบเวลาและผลิตงานวิจัยที่อ้างอิงแหล่งที่มา ระบบปลายทางอื่นเพียงอ่านสิ่งที่เผยแพร่ออกมา",
    },
    maturity: "production",
    repoVisibility: "public",
    href: "https://tools.nanoteofficial.me/company",
    stack: ["Next.js 16", "Anthropic SDK", "Upstash Redis", "Neon Postgres"],
  },
  {
    key: "thai-funds-mcp",
    name: { en: "Thai Funds MCP", th: "Thai Funds MCP" },
    tagline: {
      en: "A machine-to-machine data backend for Thai fund, market and FX data",
      th: "แหล่งข้อมูลกองทุนไทย ตลาด และอัตราแลกเปลี่ยน สำหรับให้เครื่องเรียกใช้",
    },
    purpose: {
      en: "The only system here with no human interface. It exists so an AI agent can look up Thai fund data and cite where every number came from.",
      th: "ระบบเดียวที่ไม่มีหน้าจอสำหรับคน มีไว้เพื่อให้เอเจนต์ AI ค้นข้อมูลกองทุนไทยได้ พร้อมอ้างอิงที่มาของทุกตัวเลข",
    },
    maturity: "production",
    repoVisibility: "private",
    href: "https://tools.nanoteofficial.me/thai-funds-mcp",
    stack: ["Next.js 16", "MCP", "Upstash Redis", "Zod"],
  },
  {
    key: "plan",
    name: { en: "Plan", th: "แผนงาน" },
    tagline: {
      en: "Project workspace with an AI slide generator attached",
      th: "พื้นที่จัดการโปรเจกต์ พร้อมตัวสร้างสไลด์ด้วย AI",
    },
    purpose: {
      en: "Where work actually gets tracked, and where a project turns into a presentation without leaving the tool.",
      th: "ที่ที่ติดตามงานจริง และเปลี่ยนโปรเจกต์เป็นงานนำเสนอได้โดยไม่ต้องออกจากเครื่องมือ",
    },
    maturity: "production",
    repoVisibility: "private",
    href: "https://tools.nanoteofficial.me/plan",
    stack: ["Next.js 16", "Auth.js", "Drizzle", "Neon Postgres", "Anthropic SDK"],
  },
  {
    key: "exam",
    name: { en: "Exam Trainer", th: "ระบบฝึกสอบ" },
    tagline: {
      en: "Certification practice built from a versioned question bank",
      th: "ฝึกสอบใบรับรอง จากคลังข้อสอบที่เก็บเวอร์ชัน",
    },
    purpose: {
      en: "Passing certifications without trusting a question bank blindly — where the source's answer is disputed, the reasoning is shown rather than hidden.",
      th: "สอบใบรับรองให้ผ่านโดยไม่เชื่อคลังข้อสอบแบบหลับหูหลับตา เมื่อคำตอบต้นทางยังเป็นที่ถกเถียง ระบบจะแสดงเหตุผลให้เห็น ไม่ใช่ซ่อนไว้",
    },
    maturity: "production",
    repoVisibility: "private",
    href: "https://tools.nanoteofficial.me/exam",
    stack: ["Next.js 16", "Auth.js", "Drizzle", "Neon Postgres"],
  },
  {
    key: "cyber",
    name: { en: "Cyber", th: "ไซเบอร์" },
    tagline: {
      en: "Live threat intelligence, and an ISMS workspace behind a login",
      th: "ข่าวกรองภัยคุกคามแบบสด และพื้นที่ทำงาน ISMS หลังการเข้าสู่ระบบ",
    },
    purpose: {
      en: "Two halves of the same job. The public half watches what is being exploited right now; the private half is where an organisation's controls, risks and evidence actually live.",
      th: "งานเดียวกันสองด้าน ด้านสาธารณะเฝ้าดูสิ่งที่กำลังถูกโจมตีอยู่ตอนนี้ ส่วนด้านที่ปิดไว้คือที่เก็บมาตรการควบคุม ความเสี่ยง และหลักฐานขององค์กรจริง ๆ",
    },
    maturity: "production",
    repoVisibility: "public",
    href: "https://tools.nanoteofficial.me/cyber",
    stack: ["Next.js 16", "Auth.js", "Drizzle", "Neon Postgres", "d3-geo"],
  },
  {
    key: "kb",
    name: { en: "Library", th: "ห้องสมุด" },
    tagline: {
      en: "A deliberately dumb reader over what the AI company publishes",
      th: "ตัวอ่านที่จงใจทำให้เรียบง่าย สำหรับงานที่บริษัท AI เผยแพร่",
    },
    purpose: {
      en: "Somewhere calm to read and organise the company's output. It generates nothing itself — that constraint is the design, not a limitation.",
      th: "พื้นที่สงบสำหรับอ่านและจัดระเบียบผลงานของบริษัท ตัวมันเองไม่ผลิตอะไรเลย ข้อจำกัดนี้คือการออกแบบ ไม่ใช่ความบกพร่อง",
    },
    maturity: "minimal",
    repoVisibility: "public",
    href: "https://tools.nanoteofficial.me/kb",
    stack: ["Next.js 16", "Neon Postgres"],
  },
  {
    key: "finance",
    name: { en: "Finance", th: "การเงิน" },
    tagline: {
      en: "Role-based client views — an interface shell, not yet a platform",
      th: "หน้าจอแยกตามบทบาทผู้ใช้ — เป็นเปลือกส่วนติดต่อ ยังไม่ใช่แพลตฟอร์มเต็มรูปแบบ",
    },
    purpose: {
      en: "A worked-through interface for advisor, client and admin views. Identity and role routing are real, but nothing persists yet.",
      th: "งานออกแบบส่วนติดต่อสำหรับมุมมองที่ปรึกษา ลูกค้า และผู้ดูแล ระบบยืนยันตัวตนและการแยกบทบาททำงานจริง แต่ยังไม่มีการบันทึกข้อมูล",
    },
    maturity: "shell",
    repoVisibility: "public",
    href: "https://tools.nanoteofficial.me/finance",
    stack: ["Next.js 16", "Auth0"],
  },
  {
    key: "art",
    name: { en: "Art", th: "งานศิลป์" },
    tagline: {
      en: "Planned — no repository, no deployment, no architecture yet",
      th: "อยู่ในแผน — ยังไม่มีรีโพ ไม่มีการติดตั้ง และยังไม่มีสถาปัตยกรรม",
    },
    purpose: {
      en: "On the map so the picture is complete, drawn dashed so it is not mistaken for a system. Nothing has been built; there is deliberately nothing to drill into.",
      th: "อยู่บนแผนผังเพื่อให้ภาพรวมครบถ้วน และวาดด้วยเส้นประเพื่อไม่ให้เข้าใจผิดว่าเป็นระบบที่มีอยู่จริง ยังไม่ได้สร้างอะไรเลย จึงตั้งใจไม่ให้เจาะดูรายละเอียด",
    },
    maturity: "planned",
    repoVisibility: "public",
    stack: [],
  },
];

export const toolEdges: ToolEdge[] = [
  {
    from: "portfolio",
    to: "company",
    label: { en: "embeds the live office", th: "ฝังหน้าออฟฟิศแบบสด" },
  },
  {
    from: "portfolio",
    to: "plan",
    label: { en: "permanent redirect", th: "เปลี่ยนเส้นทางถาวร" },
  },
  { from: "portfolio", to: "kb", label: { en: "links here", th: "ลิงก์จากหน้านี้" } },
  { from: "portfolio", to: "exam", label: { en: "links here", th: "ลิงก์จากหน้านี้" } },
  { from: "portfolio", to: "finance", label: { en: "links here", th: "ลิงก์จากหน้านี้" } },
  { from: "portfolio", to: "cyber", label: { en: "links here", th: "ลิงก์จากหน้านี้" } },
  {
    from: "portfolio",
    to: "art",
    label: { en: "listed, not built", th: "อยู่ในรายการ แต่ยังไม่ได้สร้าง" },
  },
  {
    from: "company",
    to: "thai-funds-mcp",
    label: {
      en: "the finance agent calls fund tools",
      th: "เอเจนต์การเงินเรียกเครื่องมือกองทุน",
    },
  },
  {
    from: "kb",
    to: "company",
    label: { en: "daily pull of published briefs", th: "ดึงบทสรุปที่เผยแพร่ทุกวัน" },
  },
];


const n = (id: string, kind: ToolNodeKind, en: string, th: string): ToolNode => ({
  id,
  kind,
  label: { en, th },
});
const e = (from: string, to: string, en: string, th: string): ToolGraphEdge => ({
  from,
  to,
  label: { en, th },
});

/**
 * Reciprocal relationships are written as a single edge with both labels
 * joined. Two edges between one pair would make the graph cyclic, and the
 * longest-path layout has no meaningful ordering on a cycle.
 */
export const toolGraphs: Record<string, ToolGraph> = {
  company: {
    nodes: [
      n("web", "app", "Dashboard & console", "แดชบอร์ดและคอนโซล"),
      n("agents", "service", "Six department agents", "เอเจนต์หกแผนก"),
      n("batch", "service", "Async batch orchestrator", "ตัวจัดคิวงานแบบอะซิงก์"),
      n("gate", "service", "Publish quality gate", "ด่านตรวจคุณภาพก่อนเผยแพร่"),
      n("redis", "datastore", "Agent state store", "ที่เก็บสถานะเอเจนต์"),
      n("pg", "datastore", "Knowledge base", "ฐานความรู้"),
      n("anthropic", "external", "Claude API", "Claude API"),
      n("sources", "external", "Public research sources", "แหล่งข้อมูลวิจัยสาธารณะ"),
      n("schedule", "job", "Staggered department schedule", "ตารางเวลาแยกตามแผนก"),
      n("sweep", "job", "Daily self-heal sweep", "รอบตรวจซ่อมตัวเองรายวัน"),
      n("backstop", "job", "External poll backstop", "ตัวสำรองสำหรับดึงผลงาน"),
      n("telegram", "channel", "Telegram bot", "บอต Telegram"),
    ],
    edges: [
      e("schedule", "agents", "triggers a department", "สั่งให้แผนกเริ่มทำงาน"),
      e("agents", "sources", "cited web research", "ค้นคว้าเว็บพร้อมอ้างอิง"),
      e("agents", "batch", "hands off long runs", "ส่งต่องานที่ใช้เวลานาน"),
      e("batch", "anthropic", "submits and collects batches", "ส่งและเก็บผลชุดงาน"),
      e("backstop", "batch", "polls for finished work", "ตามเก็บงานที่เสร็จแล้ว"),
      e("batch", "gate", "finished output", "ผลงานที่เสร็จแล้ว"),
      e("gate", "pg", "publishes approved work only", "เผยแพร่เฉพาะงานที่ผ่านการตรวจ"),
      e("agents", "redis", "run state and claims", "สถานะการรันและการจอง"),
      e("sweep", "agents", "recovers stuck agents", "กู้เอเจนต์ที่ค้าง"),
      e("web", "pg", "reads published work", "อ่านงานที่เผยแพร่แล้ว"),
      e("web", "redis", "live agent state", "สถานะเอเจนต์แบบสด"),
      e("agents", "telegram", "notifies the operator / two-way commands", "แจ้งเตือนผู้ดูแล / รับคำสั่งกลับสองทาง"),
    ],
  },
  "thai-funds-mcp": {
    nodes: [
      n("auth", "service", "Constant-time gate", "ด่านตรวจแบบเวลาคงที่"),
      n("mcp", "service", "MCP server — 7 tools", "เซิร์ฟเวอร์ MCP — 7 เครื่องมือ"),
      n("cache", "service", "TTL cache", "แคชแบบมีอายุ"),
      n("health", "service", "Health probe", "ตัวตรวจสุขภาพระบบ"),
      n("redis", "datastore", "Alert dedupe & index", "กันแจ้งเตือนซ้ำและดัชนี"),
      n("sec", "external", "Thai SEC open data", "ข้อมูลเปิด ก.ล.ต. ไทย"),
      n("market", "external", "Market index data", "ข้อมูลดัชนีตลาด"),
      n("fx", "external", "FX rates", "อัตราแลกเปลี่ยน"),
      n("alerts", "channel", "Telegram alerts", "แจ้งเตือนผ่าน Telegram"),
    ],
    edges: [
      e("auth", "mcp", "gates every tool call", "คุมทุกการเรียกเครื่องมือ"),
      e("mcp", "cache", "reads through", "อ่านผ่านแคช"),
      e("cache", "sec", "fund data", "ข้อมูลกองทุน"),
      e("cache", "market", "index levels", "ระดับดัชนี"),
      e("cache", "fx", "currency rates", "อัตราสกุลเงิน"),
      e("mcp", "redis", "suppresses repeat alerts", "กันแจ้งเตือนซ้ำ"),
      e("mcp", "alerts", "upstream failures", "ความล้มเหลวของต้นทาง"),
      e("health", "redis", "reachability probe", "ตรวจการเชื่อมต่อ"),
    ],
  },
  plan: {
    nodes: [
      n("web", "app", "Workspace", "พื้นที่ทำงาน"),
      n("auth", "service", "Invite-only sign-in", "เข้าระบบเฉพาะผู้ได้รับเชิญ"),
      n("slides", "service", "Slide pipeline", "สายการผลิตสไลด์"),
      n("pg", "datastore", "Projects, tasks, decks", "โปรเจกต์ งาน และเด็คสไลด์"),
      n("blob", "datastore", "Attachment storage", "ที่เก็บไฟล์แนบ"),
      n("anthropic", "external", "Claude API", "Claude API"),
      n("mail", "external", "Transactional email", "อีเมลระบบ"),
    ],
    edges: [
      e("web", "auth", "gates the workspace", "คุมการเข้าพื้นที่ทำงาน"),
      e("auth", "mail", "sends sign-in links", "ส่งลิงก์เข้าสู่ระบบ"),
      e("auth", "pg", "sessions and roles", "เซสชันและสิทธิ์"),
      e("web", "pg", "projects and tasks", "โปรเจกต์และงาน"),
      e("web", "blob", "attachments", "ไฟล์แนบ"),
      e("web", "slides", "generate a deck", "สั่งสร้างเด็ค"),
      e("slides", "anthropic", "streamed generation", "สร้างแบบสตรีม"),
      e("slides", "pg", "versioned decks", "เด็คแบบเก็บเวอร์ชัน"),
    ],
  },
  exam: {
    nodes: [
      n("web", "app", "Study, practice & exam runner", "โหมดอ่าน ฝึก และจำลองสอบ"),
      n("auth", "service", "Invite-only sign-in", "เข้าระบบเฉพาะผู้ได้รับเชิญ"),
      n("bank", "service", "Versioned question bank", "คลังข้อสอบแบบเก็บเวอร์ชัน"),
      n("seed", "job", "Seed pipeline", "สายงานนำเข้าข้อมูล"),
      n("pg", "datastore", "Questions & sessions", "ข้อสอบและรอบการทำ"),
      n("mail", "external", "Transactional email", "อีเมลระบบ"),
    ],
    edges: [
      e("web", "auth", "gates all content", "คุมการเข้าถึงเนื้อหาทั้งหมด"),
      e("auth", "mail", "sends sign-in links", "ส่งลิงก์เข้าสู่ระบบ"),
      e("auth", "pg", "sessions", "เซสชัน"),
      e("bank", "seed", "parsed and validated", "แปลงและตรวจความถูกต้อง"),
      e("seed", "pg", "loads the bank", "นำเข้าคลังข้อสอบ"),
      e("web", "pg", "answers and results", "คำตอบและผลลัพธ์"),
    ],
  },
  cyber: {
    nodes: [
      n("public", "app", "Threat intel HUD & map", "หน้าจอข่าวกรองภัยคุกคามและแผนที่"),
      n("workspace", "app", "ISMS workspace", "พื้นที่ทำงาน ISMS"),
      n("auth", "service", "Request, approval, then sign-in", "ขอสิทธิ์ อนุมัติ แล้วจึงเข้าสู่ระบบ"),
      n("intel", "service", "Feed aggregator", "ตัวรวมฟีดข้อมูล"),
      n("catalogue", "service", "93 Annex A controls", "มาตรการควบคุม Annex A 93 ข้อ"),
      n("soa", "service", "Statement of Applicability export", "การส่งออก Statement of Applicability"),
      n("fallback", "datastore", "Committed fallback snapshot", "สแนปช็อตสำรองที่เก็บไว้ในรีโพ"),
      n("pg", "datastore", "Controls, risks & sessions", "มาตรการควบคุม ความเสี่ยง และเซสชัน"),
      n("feeds", "external", "Public threat feeds", "ฟีดภัยคุกคามสาธารณะ"),
      n("mail", "external", "Transactional email", "อีเมลระบบ"),
      n("snapshot", "job", "Fallback refresh — run by hand", "รีเฟรชข้อมูลสำรอง — สั่งด้วยมือ"),
    ],
    edges: [
      e("public", "intel", "reads one 15-minute snapshot", "อ่านสแนปช็อตรอบ 15 นาที"),
      e("intel", "feeds", "six key-less public sources", "หกแหล่งสาธารณะที่ไม่ต้องใช้คีย์"),
      e("intel", "fallback", "degrades, stale-labelled, never blank", "ถอยไปใช้ข้อมูลเก่าที่ติดป้ายกำกับ ไม่ปล่อยหน้าว่าง"),
      e("snapshot", "fallback", "recaptures from the live feeds", "เก็บข้อมูลใหม่จากฟีดสด"),
      e("workspace", "auth", "gates every page behind it", "คุมทุกหน้าที่อยู่ด้านหลัง"),
      e("auth", "mail", "sends sign-in links", "ส่งลิงก์เข้าสู่ระบบ"),
      e("auth", "pg", "sessions, and approval re-read per request", "เซสชัน และอ่านสถานะอนุมัติใหม่ทุกคำขอ"),
      e("workspace", "catalogue", "titles, themes and attributes", "ชื่อ ธีม และคุณลักษณะ"),
      e("workspace", "pg", "status, risk scores, evidence links", "สถานะ คะแนนความเสี่ยง ลิงก์หลักฐาน"),
      e("workspace", "soa", "export request", "คำขอส่งออก"),
      e("soa", "pg", "refuses while an exclusion is unjustified", "ปฏิเสธตราบใดที่ยังมีข้อยกเว้นไม่มีเหตุผลรองรับ"),
    ],
  },
  kb: {
    nodes: [
      n("web", "app", "Reader & dashboard", "ตัวอ่านและแดชบอร์ด"),
      n("sync", "service", "Pull & map", "ดึงและแปลงข้อมูล"),
      n("pg", "datastore", "Cached items", "รายการที่แคชไว้"),
      n("daily", "job", "Daily pull", "ดึงข้อมูลรายวัน"),
      n("upstream", "external", "Company knowledge API", "API ฐานความรู้ของบริษัท"),
    ],
    edges: [
      e("daily", "sync", "once a day", "วันละครั้ง"),
      e("sync", "upstream", "pulls published briefs", "ดึงบทสรุปที่เผยแพร่แล้ว"),
      e("sync", "pg", "caches locally", "แคชไว้ในระบบ"),
      e("web", "pg", "reads the cache only", "อ่านจากแคชเท่านั้น"),
    ],
  },
  finance: {
    nodes: [
      n("web", "app", "Role-based single-page app", "แอปหน้าเดียวแยกตามบทบาท"),
      n("gate", "service", "Request gate", "ด่านตรวจคำขอ"),
      n("assistant", "service", "Assistant endpoint — stubbed", "ส่วนผู้ช่วย — ยังเป็นตัวแทนว่าง"),
      n("idp", "external", "Identity provider", "ผู้ให้บริการยืนยันตัวตน"),
    ],
    edges: [
      e("web", "gate", "every request", "ทุกคำขอ"),
      e("gate", "idp", "session and role", "เซสชันและบทบาท"),
      e("web", "assistant", "placeholder response", "คืนค่าตัวแทนว่าง"),
    ],
  },
};

export function pick(s: LStr, lang: Lang): string {
  return s[lang];
}
