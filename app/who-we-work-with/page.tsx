"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useOpenAudit } from "../components/AuditModalContext";
import Footer from "../components/Footer";

const ColorBends = dynamic(() => import("../components/ColorBends"), {
  ssr: false,
});

const PersonaLineup = dynamic(() => import("../components/PersonaLineup"), {
  ssr: false,
});

const ClientProfiles = dynamic(() => import("../components/ClientProfiles"), {
  ssr: false,
});

export default function WhoWeWorkWithPage() {
  const openAudit = useOpenAudit();
  const [modalCardIndex, setModalCardIndex] = useState<number | null>(null);

  /* Lineup click → open pop-out modal */
  const handlePersonaClick = useCallback((index: number) => {
    setModalCardIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div
      className="relative w-full bg-[#0c0a08] no-scrollbar"
      style={{ minHeight: "100vh", overflowY: "auto", overflowX: "hidden", height: "100vh" }}
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
      <div className="relative z-10" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* ── Hero + Character Lineup (two-column on desktop) ── */}
        <PersonaLineup onPersonaClick={handlePersonaClick} />

        {/* ── Profile cards (accordion) ── */}
        <div className="anim-fade-up-d2" style={{ paddingBottom: "clamp(3rem, 6vh, 5rem)" }}>
          <ClientProfiles
            modalCardIndex={modalCardIndex}
            onCloseModal={() => setModalCardIndex(null)}
          />
        </div>

        {/* ── CTA ── */}
        <div
          className="flex flex-col items-center text-center anim-fade-up-d3"
          style={{ paddingBottom: "clamp(5rem, 12vh, 8rem)", paddingLeft: "clamp(1.5rem, 5vw, 4rem)", paddingRight: "clamp(1.5rem, 5vw, 4rem)", maxWidth: "84rem", margin: "0 auto", width: "100%" }}
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
