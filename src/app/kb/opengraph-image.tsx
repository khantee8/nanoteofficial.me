import { ImageResponse } from "next/og";
import { roadmap, pick } from "@/lib/profile";
import { getLang } from "@/lib/i18n";

export const runtime = "nodejs";
export const alt = "Knowledge Base — nanoteofficial.me";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const item = roadmap.find((r) => r.key === "kb")!;
const color = "#059669";

export default async function OpengraphImage() {
  const lang = await getLang();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #11142a 0%, #1a1f3a 60%, #2a2f45 100%)",
          color: "#ecf0f7",
          padding: "70px 80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 600px 400px at 85% 15%, ${color}40, transparent 60%)`,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#0e132a",
              border: "1px solid rgba(236,240,247,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                borderTopLeftRadius: 14,
                borderTopRightRadius: 14,
                background: color,
              }}
            />
            <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1, color: "#ecf0f7" }}>
              n<span style={{ color }}>.</span>
            </span>
          </div>
          <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.4 }}>
            {item.subdomain}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            marginTop: "auto",
            position: "relative",
          }}
        >
          <span
            style={{
              fontSize: 18,
              letterSpacing: 6,
              textTransform: "uppercase",
              color,
              fontWeight: 600,
            }}
          >
            {pick(item.tagline, lang)}
          </span>
          <span style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2, lineHeight: 1.02 }}>
            {pick(item.title, lang)}.
          </span>
          <span style={{ fontSize: 28, color: "#a8b2c2", fontWeight: 500 }}>
            {pick(item.description, lang).slice(0, 90)}…
          </span>
        </div>
      </div>
    ),
    size,
  );
}
