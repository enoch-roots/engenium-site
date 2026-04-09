"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useOpenAudit } from "../components/AuditModalContext";

const GradientCanvas = lazy(() => import("./GradientCanvas"));

/* ──────────────────────────────────────────────────
   3 curated gradients — Ember Drift, Signal Flare,
   Patina Wash — each paired with a How We Work
   messaging beat: Process, Philosophy, Partnership.
   ────────────────────────────────────────────────── */

const SECTIONS = [
  {
    id: "ember-drift",
    gradient: {
      animate: "on",
      type: "plane",
      grain: "on",
      color1: "#A86040",
      color2: "#507E78",
      color3: "#171210",
      uStrength: 2.5,
      uDensity: 1.0,
      uSpeed: 0.3,
      uFrequency: 5.5,
      uAmplitude: 1,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      positionX: 0,
      positionY: 0.3,
      positionZ: 0,
      cameraZoom: 1,
      cAzimuthAngle: 180,
      enableTransition: false,
      cPolarAngle: 90,
      cDistance: 3.6,
      pixelDensity: 1,
    },
  },
  {
    id: "signal-flare",
    gradient: {
      animate: "on",
      type: "plane",
      grain: "on",
      color1: "#A86040",
      color2: "#507E78",
      color3: "#171210",
      uStrength: 5,
      uDensity: 1.8,
      uSpeed: 0.2,
      uFrequency: 5.5,
      uAmplitude: 1,
      rotationX: 0,
      rotationY: 5,
      rotationZ: 20,
      positionX: 0,
      positionY: 0.5,
      positionZ: 0,
      cameraZoom: 1,
      cAzimuthAngle: 180,
      enableTransition: false,
      cPolarAngle: 90,
      cDistance: 3.6,
      pixelDensity: 1,
    },
  },
  {
    id: "patina-wash",
    gradient: {
      animate: "on",
      type: "plane",
      grain: "on",
      color1: "#A86040",
      color2: "#507E78",
      color3: "#171210",
      uStrength: 2,
      uDensity: 1.3,
      uSpeed: 0.4,
      uFrequency: 5.5,
      uAmplitude: 1,
      rotationX: 0,
      rotationY: 10,
      rotationZ: 50,
      positionX: -0.8,
      positionY: 0,
      positionZ: 0,
      cameraZoom: 1,
      cAzimuthAngle: 180,
      enableTransition: false,
      cPolarAngle: 90,
      cDistance: 3.6,
      pixelDensity: 1,
    },
  },
] as const;

export default function ShowcasePage() {
  const openAudit = useOpenAudit();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  /* Only mount ShaderGradient for the active section to avoid
     running 3 concurrent Three.js WebGL renderers. */
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  /* IntersectionObserver — track active section */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const sections = container.querySelectorAll<HTMLElement>(".sc-section");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const idx = Number(
              (entry.target as HTMLElement).dataset.index ?? 0,
            );
            setActiveIndex(idx);
          }
        }
      },
      { root: container, threshold: 0.5 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const el = container.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);

  /* Keyboard nav */
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
      {/* Film-grain overlay — sits on top of everything */}
      <div className="sc-grain" />

      {/* Scroll-snap container */}
      <div ref={scrollRef} className="sc-scroll">
        {/* ─── Section 1: The Process ─── */}
        <section
          className={`sc-section sc-ember${activeIndex === 0 ? " sc-active" : ""}`}
          data-index={0}
        >
          <div className="sc-bg">
            {clientReady && activeIndex === 0 && (
              <Suspense fallback={null}>
                <GradientCanvas config={SECTIONS[0].gradient} />
              </Suspense>
            )}
          </div>
          <div className="sc-scrim sc-scrim-ember" />
          <div className="sc-content sc-content-ember">
            <span className="sc-label">The Process</span>
            <h1 className="sc-hero-headline">
              Discovery first.
            </h1>
            <p className="sc-hero-sub">We listen before we build.</p>
            <div className="sc-ember-blocks">
              <div className="sc-ember-block">
                <h3 className="sc-ember-block-title">
                  Build in weeks, not months.
                </h3>
                <p className="sc-ember-block-body">
                  Core infrastructure goes live fast. We scope tight, ship, and
                  iterate with real data, not assumptions.
                </p>
              </div>
              <div className="sc-ember-block">
                <h3 className="sc-ember-block-title">
                  Custom from the ground up.
                </h3>
                <p className="sc-ember-block-body">
                  No templates, no page builders. Every system is shaped around
                  what we learn in discovery.
                </p>
              </div>
            </div>
          </div>
          <div className="sc-section-label sc-section-label-left">01</div>
        </section>

        {/* ─── Section 2: The Philosophy ─── */}
        <section
          className={`sc-section sc-signal${activeIndex === 1 ? " sc-active" : ""}`}
          data-index={1}
        >
          <div className="sc-bg">
            {clientReady && activeIndex === 1 && (
              <Suspense fallback={null}>
                <GradientCanvas config={SECTIONS[1].gradient} />
              </Suspense>
            )}
          </div>
          <div className="sc-scrim sc-scrim-signal" />
          <div className="sc-content sc-content-signal">
            <span className="sc-label">The Philosophy</span>
            <h2 className="sc-signal-headline">
              Systems,
              <br />
              not services.
            </h2>
            <p className="sc-signal-body">
              We build you a customized digital foundation that supports your
              business now and in the future.
            </p>
            <p className="sc-signal-accent">Infrastructure that compounds.</p>
            <p className="sc-signal-body sc-signal-body--second">
              If the analytics aren&apos;t connected to the CRM, the CRM
              isn&apos;t connected to the site, and the site isn&apos;t
              capturing intent, it&apos;s not done yet.
            </p>
          </div>
          <div className="sc-section-label sc-section-label-left">02</div>
        </section>

        {/* ─── Section 3: The Partnership ─── */}
        <section
          className={`sc-section sc-patina${activeIndex === 2 ? " sc-active" : ""}`}
          data-index={2}
        >
          <div className="sc-bg">
            {clientReady && activeIndex === 2 && (
              <Suspense fallback={null}>
                <GradientCanvas config={SECTIONS[2].gradient} />
              </Suspense>
            )}
          </div>
          <div className="sc-scrim sc-scrim-patina" />
          <div className="sc-content sc-content-patina">
            <span className="sc-label">The Partnership</span>
            <h2 className="sc-patina-headline">
              You get a team,
              <br />
              not a ticket queue.
            </h2>
            <div className="sc-patina-footer">
              <div className="sc-rule" />
              <p className="sc-patina-cta">
                Your dashboard. Your data. Your domain. We build on
                infrastructure you own.
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
                  marginTop: "1.5rem",
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
          </div>
          <div className="sc-section-label sc-section-label-left">03</div>
        </section>
      </div>

      {/* Nav dots — right rail */}
      <nav className="sc-nav" aria-label="Section navigation">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            className={`sc-dot${i === activeIndex ? " active" : ""}`}
            onClick={() => scrollToSection(i)}
            aria-label={`Go to section ${i + 1}`}
          />
        ))}
      </nav>

      {/* Scroll hint */}
      <div className="sc-hint">scroll</div>
    </>
  );
}
