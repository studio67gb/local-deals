"use client";
import { useEffect, useRef } from "react";

interface AdUnitProps {
  slot: string;
  format?: "auto" | "horizontal" | "rectangle" | "vertical";
  style?: React.CSSProperties;
  className?: string;
}

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";

export default function AdUnit({ slot, format = "auto", style, className }: AdUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    // Only push once per mount, and only when the ins element exists
    if (!pushed.current && CLIENT && CLIENT !== "ca-pub-PENDING") {
      try {
        pushed.current = true;
        ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
          (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
      } catch (e) {
        console.warn("AdSense push failed:", e);
      }
    }
  }, []);

  // Don't render if no publisher ID configured yet
  if (!CLIENT || CLIENT === "ca-pub-PENDING") {
    return (
      <div
        className={className}
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px dashed rgba(255,255,255,0.08)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-dim)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          minHeight: 90,
          ...style,
        }}
      >
        Advertisement
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
