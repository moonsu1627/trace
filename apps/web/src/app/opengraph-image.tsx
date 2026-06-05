import { ImageResponse } from "next/og";

export const alt = "Trace — Developer Signal Engine";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const accent = "#14532d";
  const accentSoft = "#d1fae5";
  const ink = "#0a0a0a";
  const paper = "#fafafa";
  const mute = "#6b7280";
  const line = "#e5e7eb";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: paper,
          color: ink,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            fontSize: 22,
            letterSpacing: "-0.01em",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: accent, fontSize: 28 }}>●</span>
            <span style={{ fontWeight: 600 }}>trace</span>
          </div>
          <div
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontSize: 16,
              color: accent,
            }}
          >
            Developer Signal Engine
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Know who's about to buy.</span>
            <span style={{ color: mute }}>Before they email you.</span>
          </div>
          <div
            style={{
              fontSize: 28,
              color: mute,
              lineHeight: 1.4,
              maxWidth: 980,
            }}
          >
            GitHub stars, issues, PRs, and waitlist signals — collapsed into one live timeline per person.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${line}`,
            paddingTop: 24,
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            fontSize: 18,
            color: mute,
          }}
        >
          <div style={{ display: "flex", gap: 24 }}>
            <span>solo devs</span>
            <span style={{ color: line }}>·</span>
            <span>indie hackers</span>
            <span style={{ color: line }}>·</span>
            <span>AI builders</span>
          </div>
          <div
            style={{
              background: accentSoft,
              color: accent,
              padding: "8px 16px",
              borderRadius: 999,
              fontWeight: 600,
            }}
          >
            trace-web-srye.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
