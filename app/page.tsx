"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";

const TrueFocusHero = dynamic(() => import("./components/TrueFocusHero"), {
  ssr: false,
});

const GradientBlindsHero = dynamic(
  () => import("./components/GradientBlindsHero"),
  { ssr: false }
);

const MagnetLinesHero = dynamic(
  () => import("./components/MagnetLinesHero"),
  { ssr: false }
);

const CubesHero = dynamic(() => import("./components/CubesHero"), {
  ssr: false,
});

const SECTIONS = [
  { id: "truefocus", label: "The Close" },
  { id: "gradient-blinds", label: "The Window" },
  { id: "magnet-lines", label: "The Build" },
  { id: "cubes", label: "The Stack" },
] as const;

export default function LandingPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  /* Which sections are mounted — only active ± 1 neighbor.
     Far-away sections unmount to free GPU/CPU resources. */
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0, 1]));

  /* ── IntersectionObserver for active section ───────────────── */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const sections = container.querySelectorAll<HTMLElement>(".landing-section");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = Number(
              (entry.target as HTMLElement).dataset.index ?? 0
            );
            setActiveIndex(index);
            setMounted((prev) => {
              const next = new Set<number>();
              next.add(index);
              if (index > 0) next.add(index - 1);
              if (index < SECTIONS.length - 1) next.add(index + 1);
              // Bail out if the set hasn't actually changed — avoids
              // unnecessary re-renders of heavy animation components
              if (next.size === prev.size && [...next].every((n) => prev.has(n))) return prev;
              return next;
            });
          }
        }
      },
      { root: container, threshold: 0.5 }
    );

    sections.forEach((s) => observer.observe(s));

    /* On client-side back-navigation the observer may not fire
       because the first section is already fully visible.
       Reset scroll position and force-activate section 0. */
    container.scrollTop = 0;
    setActiveIndex(0);
    setMounted(new Set([0, 1]));

    return () => observer.disconnect();
  }, []);

  /* ── Keyboard nav ──────────────────────────────────────────── */
  const scrollToSection = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const section = container.children[index] as HTMLElement | undefined;
    section?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = Math.min(prev + 1, SECTIONS.length - 1);
          scrollToSection(next);
          return next;
        });
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = Math.max(prev - 1, 0);
          scrollToSection(next);
          return next;
        });
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [scrollToSection]);

  return (
    <>
      <div ref={scrollRef} className="landing-scroll">
        {/* Section 1 — TrueFocus */}
        <div className="landing-section" data-index={0}>
          {mounted.has(0) ? (
            <TrueFocusHero active={activeIndex === 0} />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "#0c0a08" }} />
          )}
        </div>

        {/* Section 2 — Gradient Blinds */}
        <div className="landing-section" data-index={1}>
          {mounted.has(1) ? (
            <GradientBlindsHero active={activeIndex === 1} />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "#0c0a08" }} />
          )}
        </div>

        {/* Section 3 — MagnetLines */}
        <div className="landing-section" data-index={2}>
          {mounted.has(2) ? (
            <MagnetLinesHero active={activeIndex === 2} />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "#0c0a08" }} />
          )}
        </div>

        {/* Section 4 — Cubes */}
        <div className="landing-section" data-index={3}>
          {mounted.has(3) ? (
            <CubesHero active={activeIndex === 3} />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "#0c0a08" }} />
          )}
        </div>
      </div>

      {/* Nav dots */}
      <nav className="nav-dots" aria-label="Section navigation">
        {SECTIONS.map((section, i) => (
          <button
            key={section.id}
            className={`nav-dot${i === activeIndex ? " active" : ""}`}
            onClick={() => scrollToSection(i)}
            aria-label={`Go to ${section.label}`}
          >
            <span className="dot-label">{section.label}</span>
          </button>
        ))}
      </nav>

      {/* Scroll hint */}
      <div className="scroll-hint">scroll ↓ or press j / k</div>
    </>
  );
}
