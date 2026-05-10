import { ImageResponse } from "next/og";
import { profile } from "@/lib/profile";
import { getLang, t } from "@/lib/i18n";

export const runtime = "nodejs";
export const alt = "nanoteofficial.me";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const lang = await getLang();
  const name = profile.name[lang];
  const headline = profile.headline[lang];
  const tagline = t("hero.available", lang);

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
            background:
              "radial-gradient(ellipse 600px 400px at 85% 15%, rgba(85,102,241,0.25), transparent 60%)",
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
                background: "#5566f1",
              }}
            />
            <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1, color: "#ecf0f7" }}>
              n
              <span style={{ color: "#5566f1" }}>.</span>
            </span>
          </div>
          <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.4 }}>
            nanoteofficial<span style={{ opacity: 0.55 }}>.me</span>
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
              color: "#5566f1",
              fontWeight: 600,
            }}
          >
            {tagline}
          </span>
          <span
            style={{
              fontSize: 88,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.02,
            }}
          >
            {name}.
          </span>
          <span style={{ fontSize: 36, color: "#a8b2c2", fontWeight: 500, letterSpacing: -0.5 }}>
            {headline}.
          </span>
        </div>

        <div
          style={{
            position: "absolute",
            right: 80,
            bottom: 70,
            display: "flex",
            gap: 10,
          }}
        >
          {["#d97706", "#0891b2", "#059669", "#e11d48"].map((c) => (
            <div
              key={c}
              style={{ width: 32, height: 8, borderRadius: 4, background: c }}
            />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
