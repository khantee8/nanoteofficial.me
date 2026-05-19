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
    en: "Technology Strategy & Cybersecurity | MBA — Finance & MIS",
    th: "กลยุทธ์เทคโนโลยีและความมั่นคงปลอดภัยไซเบอร์ | MBA — การเงินและ MIS",
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
      en: "Deep expertise spanning SIEM, SOAR, SOC-as-a-Service, SDN architecture, and enterprise security — bridging technical delivery with business strategy and stakeholder alignment.",
      th: "ความเชี่ยวชาญเชิงลึกครอบคลุม SIEM, SOAR, SOC-as-a-Service, สถาปัตยกรรม SDN และ Enterprise Security — เชื่อมโยงการส่งมอบเทคนิคเข้ากับกลยุทธ์ธุรกิจและการประสานงานกับผู้มีส่วนเกี่ยวข้อง",
    },
    {
      en: "MBA graduate from NIDA in Finance & MIS, passionate about business transformation, strategic technology initiatives, and applied AI to shorten the loop between insight and decision.",
      th: "สำเร็จการศึกษา MBA จาก NIDA สาขาการเงินและ MIS มีความสนใจในด้าน Business Transformation กลยุทธ์เทคโนโลยี และ AI เพื่อย่นระยะเวลาจาก Insight สู่การตัดสินใจ",
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
          en: "Led cybersecurity transformation initiatives for enterprise and government-sector clients by coordinating stakeholders, partners, and technical teams to deliver strategic security solutions, including SIEM, SOAR, and SOC-as-a-Service.",
          th: "นำโครงการด้าน Cybersecurity Transformation สำหรับองค์กรภาครัฐและองค์กรระดับ Enterprise โดยประสานงานร่วมกับผู้มีส่วนเกี่ยวข้อง พันธมิตร และทีมเทคนิค เพื่อส่งมอบโซลูชันด้านความมั่นคงปลอดภัย เช่น SIEM, SOAR และ SOC-as-a-Service",
        },
        {
          en: "Advised clients on cybersecurity governance, risk management, and compliance alignment based on NIST, ISO 27001, and NCSA frameworks to strengthen organizational security posture and operational resilience.",
          th: "ให้คำปรึกษาด้าน Cybersecurity Governance, Risk Management และ Compliance ตามมาตรฐาน NIST, ISO 27001 และแนวทางของ NCSA เพื่อเสริมสร้าง Security Posture และ Operational Resilience ขององค์กร",
        },
        {
          en: "Designed and optimized SOC operational workflows and service processes, improving incident response coordination and enhancing managed security service quality.",
          th: "ออกแบบและปรับปรุงกระบวนการดำเนินงานด้าน SOC และ Security Services เพื่อเพิ่มประสิทธิภาพในการตอบสนองต่อ Incident และยกระดับคุณภาพบริการด้าน Managed Security Services",
        },
        {
          en: "Collaborated with enterprise stakeholders to align cybersecurity initiatives with organizational objectives, operational requirements, and long-term technology strategies.",
          th: "ประสานงานร่วมกับผู้บริหารและหน่วยงานต่าง ๆ เพื่อให้โครงการด้าน Cybersecurity สอดคล้องกับเป้าหมายองค์กร กระบวนการดำเนินงาน และกลยุทธ์ด้านเทคโนโลยีระยะยาว",
        },
        {
          en: "Supported strategic discussions and solution planning for digital infrastructure modernization and cyber resilience initiatives.",
          th: "สนับสนุนการวางแผนเชิงกลยุทธ์และการออกแบบแนวทางด้าน Digital Infrastructure Transformation และ Cyber Resilience Initiatives",
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
          en: "Managed enterprise network and cybersecurity projects for major government and public-sector organizations, supporting digital transformation and infrastructure modernization initiatives.",
          th: "บริหารและดำเนินโครงการด้าน Enterprise Network และ Cybersecurity สำหรับหน่วยงานภาครัฐและองค์กรขนาดใหญ่ เพื่อสนับสนุน Digital Transformation และการพัฒนาโครงสร้างพื้นฐานด้านเทคโนโลยี",
        },
        {
          en: "Led implementation and enhancement of Software Defined Network (SDN) and enterprise security solutions to improve scalability, operational efficiency, and system resilience.",
          th: "นำการพัฒนาและปรับปรุงระบบ Software Defined Network (SDN) และ Enterprise Security Solutions เพื่อเพิ่มประสิทธิภาพ ความยืดหยุ่น และเสถียรภาพของระบบองค์กร",
        },
        {
          en: "Coordinated with cross-functional stakeholders, technology partners, and client management teams to deliver complex technology projects aligned with business and operational goals.",
          th: "ประสานงานกับหน่วยงานภายใน พันธมิตรทางเทคโนโลยี และผู้บริหารโครงการ เพื่อส่งมอบโครงการเทคโนโลยีที่สอดคล้องกับเป้าหมายทางธุรกิจและการดำเนินงาน",
        },
        {
          en: "Provided strategic technical consultation for enterprise security architecture, network segmentation, endpoint protection, and infrastructure risk mitigation.",
          th: "ให้คำปรึกษาด้าน Enterprise Security Architecture, Network Segmentation, Endpoint Protection และ Infrastructure Risk Mitigation สำหรับองค์กรระดับ Enterprise",
        },
        {
          en: "Contributed to large-scale technology initiatives for organizations including DGA, NSTDA, Ministry of Finance, and other national agencies.",
          th: "มีส่วนร่วมในโครงการด้านเทคโนโลยีระดับประเทศร่วมกับหน่วยงาน เช่น DGA, NSTDA, กระทรวงการคลัง และหน่วยงานภาครัฐอื่น ๆ",
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
