"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";

/* ── Lazy-load TrueFocus (heavy — Three.js / WebGL) ──────────── */
const TrueFocusHero = dynamic(() => import("../components/TrueFocusHero"), {
  ssr: false,
});

/**
 * 6-section hero demo — ICP 1 message sequence:
 * Hook → Problem → Solution → Method → Trust → Close
 *
 * Sections with `file` render as iframes (static HTML heroes).
 * Sections with `component` render inline as React components.
 */
const SECTIONS = [
  {
    id: "magnetlines",
    file: "/heroes/magnetlines-hero.html",
    label: "The Hook",
  },
  {
    id: "gradient-blinds",
    file: "/heroes/gradient-blinds-hero.html",
    label: "The Window",
  },
  {
    id: "dotgrid",
    file: "/heroes/dotgrid-hero.html",
    label: "The System",
  },
  {
    id: "cubes",
    file: "/heroes/cubes-hero-v2.html",
    label: "The Engine Room",
  },
  {
    id: "prism",
    file: "/heroes/prism-hero.html",
    label: "The Team",
  },
  {
    id: "truefocus",
    component: "truefocus" as const,
    label: "The Close",
  },
] as const;

export default function HeroDemo() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  /* Which sections are mounted — only active ± 1 neighbor.
     Far-away iframes and components unmount to free resources. */
  const [mounted, setMounted] = useState<Set<number>>(
    () => new Set([0, 1])
  );

  // Track which section is in view via IntersectionObserver
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const sections = container.querySelectorAll<HTMLElement>(".hero-section");

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
              if (next.size === prev.size && [...next].every((n) => prev.has(n))) return prev;
              return next;
            });
          }
        }
      },
      { root: container, threshold: 0.5 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const section = container.children[index] as HTMLElement | undefined;
    section?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Keyboard nav: arrow keys, j/k
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
      {/* Scroll-snap container */}
      <div ref={scrollRef} className="scroll-container">
        {SECTIONS.map((section, i) => (
          <div key={section.id} className="hero-section" data-index={i}>
            {"component" in section && section.component === "truefocus" ? (
              mounted.has(i) ? (
                <TrueFocusHero active={activeIndex === i} />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "#0c0a08",
                  }}
                />
              )
            ) : "file" in section ? (
              mounted.has(i) ? (
                <iframe
                  src={section.file}
                  title={section.label}
                  loading={i === 0 ? "eager" : "lazy"}
                  allow="accelerometer"
                />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "#0c0a08",
                  }}
                />
              )
            ) : null}
          </div>
        ))}
      </div>

      {/* Nav dots — fixed right rail */}
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

      {/* Section counter — bottom center */}
      <div className="section-counter">
        {String(activeIndex + 1).padStart(2, "0")} /{" "}
        {String(SECTIONS.length).padStart(2, "0")}
        {"  "}·{"  "}
        {SECTIONS[activeIndex].label}
      </div>

      {/* First-load hint */}
      <div className="scroll-hint">scroll ↓ or press j / k</div>
    </>
  );
}
