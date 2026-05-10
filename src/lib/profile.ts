export type Experience = {
  role: string;
  company: string;
  period: string;
  location?: string;
  bullets: string[];
};

export type Skill = { group: string; items: string[] };

export type RoadmapItem = {
  key: "finance" | "cyber" | "kb" | "art";
  subdomain: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  status: "Planned" | "In design" | "Prototyping" | "Live";
  accent: string;
  href: string;
};

export const profile = {
  name: "Saksit Jantila",
  handle: "nanoteofficial",
  headline: "Cybersecurity & Financial Strategy Professional",
  location: "Bangkok, Thailand",
  email: "khantee9@gmail.com",
  linkedin: "https://www.linkedin.com/in/saksit-jantila-83b32614b/",
  github: "https://github.com/khantee8",
  summary:
    "I work at the intersection of cybersecurity engineering and personal financial planning — building tools that help professionals understand risk, whether the asset is a network, a portfolio, or a habit. This site is a living portfolio of those projects.",
  about: [
    "Hands-on cybersecurity practitioner with experience across vendor solutions, network defense, and threat intel.",
    "Independent financial consultant helping individuals build, monitor, and stress-test their investment plans.",
    "Currently exploring how applied AI can shorten the loop between signal and decision for both domains.",
  ],
  experience: [
    {
      role: "Cybersecurity Engineer",
      company: "(replace with your most recent role)",
      period: "2022 – Present",
      location: "Bangkok, Thailand",
      bullets: [
        "Designed and operated detection pipelines across enterprise networks.",
        "Led incident response engagements and translated threat intel into board-ready briefs.",
        "Mentored junior analysts on triage workflow and tooling.",
      ],
    },
    {
      role: "Independent Financial Consultant",
      company: "Self-employed",
      period: "2020 – Present",
      bullets: [
        "Advise individual clients on portfolio construction across DCA, fixed income, and SSF/RMF tax-advantaged vehicles.",
        "Built proprietary tools to track performance and rebalance based on client risk tolerance.",
      ],
    },
    {
      role: "Earlier roles",
      company: "Network & security operations",
      period: "Pre-2022",
      bullets: [
        "Vendor product implementation across firewall, EDR, and SIEM stacks.",
        "Customer-facing pre-sales and architecture support.",
      ],
    },
  ] as Experience[],
  education: [
    {
      school: "(University name placeholder)",
      degree: "B.Eng. — replace with your actual degree",
      period: "Replace with years",
    },
  ],
  certifications: [
    "Replace with your real certs (e.g., CompTIA Security+, CEH, vendor certifications)",
  ],
  skills: [
    {
      group: "Cybersecurity",
      items: [
        "Threat detection & response",
        "Network security architecture",
        "Vendor product evaluation",
        "Security operations",
      ],
    },
    {
      group: "Financial planning",
      items: [
        "Portfolio construction",
        "Risk assessment",
        "Thai tax-advantaged vehicles (SSF / RMF)",
        "DCA strategy design",
      ],
    },
    {
      group: "Engineering",
      items: ["Node.js / TypeScript", "Python", "Docker", "Linux & networking"],
    },
  ] as Skill[],
};

export const roadmap: RoadmapItem[] = [
  {
    key: "finance",
    subdomain: "finance.nanoteofficial.me",
    title: "Finance",
    tagline: "Client portfolio analytics & financial planning",
    description:
      "A member-only platform for clients I consult with — to monitor portfolio performance, run risk scenarios, and stay informed with curated market news.",
    features: [
      "Portfolio dashboard with cost basis & P/L tracking",
      "Risk evaluation scoring (volatility, concentration, currency)",
      "Curated financial news filtered by holdings",
      "Client login & multi-account workspace",
    ],
    status: "Prototyping",
    accent: "from-emerald-500/20 to-emerald-500/0 border-emerald-500/30",
    href: "/finance",
  },
  {
    key: "cyber",
    subdomain: "cyber.nanoteofficial.me",
    title: "Cyber",
    tagline: "Real-time threat monitoring for security professionals",
    description:
      "A live feed of cyber threats and industry-impacting events, designed to compress the time between detection and informed analysis for SOC teams and consultants.",
    features: [
      "Live threat & CVE feed with severity scoring",
      "Industry-tagged impact analysis",
      "Vendor advisory aggregation",
      "Searchable incident history",
    ],
    status: "In design",
    accent: "from-sky-500/20 to-sky-500/0 border-sky-500/30",
    href: "/cyber",
  },
  {
    key: "kb",
    subdomain: "kb.nanoteofficial.me",
    title: "Knowledge Base",
    tagline: "Personal learning archive (private)",
    description:
      "My private knowledge base — Claude Code recipes, vendor product setup notes, network and security install guides. Login required.",
    features: [
      "Private — single-user authentication",
      "Markdown-based notes with tags",
      "Vendor & product setup playbooks",
      "Search across the entire archive",
    ],
    status: "Planned",
    accent: "from-amber-500/20 to-amber-500/0 border-amber-500/30",
    href: "/kb",
  },
  {
    key: "art",
    subdomain: "art.nanoteofficial.me",
    title: "Art & Soul",
    tagline: "Creative space — visual art and short-form video",
    description:
      "A personal space for visual art and short videos — slower, less optimized, more felt. Built to develop the side of myself that the other three apps don't.",
    features: [
      "Curated visual gallery",
      "Short video reflections",
      "Process notes & inspirations",
      "No metrics — by design",
    ],
    status: "Planned",
    accent: "from-rose-500/20 to-rose-500/0 border-rose-500/30",
    href: "/art",
  },
];
