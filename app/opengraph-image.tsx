import { ImageResponse } from "next/og";
import { business } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0f172a",
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(244,134,21,0.12) 0px, rgba(244,134,21,0.12) 2px, transparent 2px, transparent 26px)",
        }}
      >
        <span style={{ fontSize: 32, fontWeight: 700, color: "#f48615", letterSpacing: 2 }}>
          ALAMIR TRAC
        </span>
        <span
          style={{
            marginTop: 24,
            fontSize: 54,
            fontWeight: 800,
            color: "#f8fafc",
            lineHeight: 1.3,
            maxWidth: 950,
          }}
        >
          Heavy Equipment &amp; Hydraulics Maintenance
        </span>
        <span style={{ marginTop: 28, fontSize: 28, color: "#94a3b8" }}>
          Cairo, Egypt — {business.phone}
        </span>
      </div>
    ),
    { ...size }
  );
}
