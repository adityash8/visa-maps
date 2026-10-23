import { ImageResponse } from "next/og";
export const alt = "Visa Maps, passport entry rules with official sources";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(<div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", height: "100%", padding: 80, background: "#f7f7f2", color: "#18392f", fontFamily: "sans-serif" }}><div style={{ fontSize: 36, marginBottom: 56 }}>Visa Maps</div><div style={{ display: "flex", flexDirection: "column", fontSize: 74, fontWeight: 600, maxWidth: 920, lineHeight: 1.1 }}><span>Your passport.</span><span>The source in sight.</span></div><div style={{ fontSize: 28, marginTop: 40 }}>Entry rules, conditions and official sources.</div></div>, size);
}
