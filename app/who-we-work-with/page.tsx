"use client";

import dynamic from "next/dynamic";
import { useOpenAudit } from "../components/AuditModalContext";
import Footer from "../components/Footer";

const ColorBends = dynamic(() => import("../components/ColorBends"), {
  ssr: false,
});

const ClientProfiles = dynamic(() => import("../components/ClientProfiles"), {
  ssr: false,
});

export default function WhoWeWorkWithPage() {
  const openAudit = useOpenAudit();
  return (
    <div
      className="relative w-full bg-[#0c0a08]"
      style={{ minHeight: "100vh", overflowY: "auto", height: "100vh" }}
    >
      {/* ── ColorBends background (fixed, fills viewport) ── */}
      <div className="fixed inset-0 z-0">
        <ColorBends
          colors={["#A86040"]}
          rotation={122}
          speed={0.31}
          scale={0.5}
          frequency={1.5}
          warpStrength={1}
          mouseInfluence={1}
          parallax={0.5}
          noise={0.1}
          transparent
          autoRotate={1}
        />
      </div>

      {/* ── Scrim overlay ── */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background: [
            "radial-gradient(ellipse 80% 40% at 50% 15%, transparent 0%, rgba(12,10,8,0.55) 100%)",
            "linear-gradient(to bottom, rgba(12,10,8,0.6) 0%, rgba(12,10,8,0.25) 30%, rgba(12,10,8,0.15) 50%, rgba(12,10,8,0.4) 80%, rgba(12,10,8,0.7) 100%)",
          ].join(", "),
        }}
      />

      {/* ── Page content (scrollable) ── */}
      <div className="relative z-10">
        {/* Hero */}
        <div
          className="flex flex-col items-center justify-center text-center"
          style={{
            paddingTop: "clamp(5.5rem, 12vh, 8rem)",
            paddingBottom: "clamp(2rem, 4vh, 3rem)",
            paddingLeft: "clamp(2.5rem, 8vw, 6rem)",
            paddingRight: "clamp(2.5rem, 8vw, 6rem)",
          }}
        >
          <h1
            className="anim-fade-up"
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontWeight: 300,
              fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.01em",
              color: "var(--warm-linen)",
              marginBottom: "1rem",
            }}
          >
            Who We Work With
          </h1>

          <p
            className="max-w-2xl anim-fade-up-d1"
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontWeight: 300,
              fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
              color: "var(--verdigris)",
              letterSpacing: "0.06em",
              lineHeight: 1.6,
              marginBottom: "0.5rem",
            }}
          >
            We build for businesses ready to be found: by customers,
            by search engines, and by the AI that&rsquo;s answering
            questions your customers ask.
          </p>

          <p
            className="max-w-xl anim-fade-up-d2"
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontWeight: 300,
              fontSize: "clamp(0.78rem, 1.2vw, 0.92rem)",
              color: "var(--warm-linen)",
              opacity: 0.35,
              letterSpacing: "0.04em",
              lineHeight: 1.6,
            }}
          >
            From solo operators to multi-location enterprises.
            If it sounds like you, we should talk.
          </p>
        </div>

        {/* Profile cards + Watching segments */}
        <div className="anim-fade-up-d3" style={{ paddingBottom: "clamp(3rem, 6vh, 5rem)" }}>
          <ClientProfiles />
        </div>

        {/* CTA */}
        <div
          className="flex flex-col items-center text-center anim-fade-up-d4"
          style={{ paddingBottom: "clamp(5rem, 12vh, 8rem)", paddingLeft: "clamp(2.5rem, 8vw, 6rem)", paddingRight: "clamp(2.5rem, 8vw, 6rem)" }}
        >
          <p
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontWeight: 300,
              fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
              lineHeight: 1.15,
              color: "var(--warm-linen)",
              marginBottom: "0.6rem",
              maxWidth: "36rem",
            }}
          >
            Sound like you?
          </p>
          <p
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontWeight: 300,
              fontSize: "clamp(0.82rem, 1.3vw, 0.95rem)",
              color: "var(--warm-linen)",
              opacity: 0.4,
              lineHeight: 1.6,
              marginBottom: "2rem",
              maxWidth: "28rem",
            }}
          >
            We&rsquo;ll show you exactly where customers are
            finding you, and where they&rsquo;re not.
          </p>
          <button
            type="button"
            onClick={openAudit}
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: "clamp(0.85rem, 1.2vw, 0.95rem)",
              fontWeight: 400,
              letterSpacing: "0.06em",
              color: "var(--warm-linen)",
              textDecoration: "none",
              padding: "0.75rem 2rem",
              border: "1px solid rgba(168, 96, 64, 0.7)",
              borderRadius: "6px",
              background: "rgba(168, 96, 64, 0.25)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(168, 96, 64, 0.4)";
              e.currentTarget.style.borderColor = "rgba(168, 96, 64, 0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(168, 96, 64, 0.25)";
              e.currentTarget.style.borderColor = "rgba(168, 96, 64, 0.7)";
            }}
          >
            Free Visibility Audit <span>&rarr;</span>
          </button>
        </div>

        <Footer />
      </div>
    </div>
  );
}
