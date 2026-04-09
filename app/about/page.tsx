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

const GradientCanvas = lazy(() => import("../how-we-work/GradientCanvas"));

/* ──────────────────────────────────────────────────
   3 curated gradients — each paired with an About
   messaging beat: Identity + Etymology, Values,
   Austin + CTA.
   ────────────────────────────────────────────────── */

const SECTIONS = [
  {
    id: "about-origin",
    gradient: {
      animate: "on",
      type: "plane",
      grain: "on",
      color1: "#A86040",
      color2: "#507E78",
      color3: "#171210",
      uStrength: 2.5,
      uDensity: 1.0,
      uSpeed: 0.25,
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
    id: "about-values",
    gradient: {
      animate: "on",
      type: "plane",
      grain: "on",
      color1: "#A86040",
      color2: "#507E78",
      color3: "#171210",
      uStrength: 5,
      uDensity: 1.8,
      uSpeed: 0.15,
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
    id: "about-austin",
    gradient: {
      animate: "on",
      type: "plane",
      grain: "on",
      color1: "#A86040",
      color2: "#507E78",
      color3: "#171210",
      uStrength: 2,
      uDensity: 1.3,
      uSpeed: 0.35,
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

export default function AboutPage() {
  const openAudit = useOpenAudit();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
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
      {/* Film-grain overlay */}
      <div className="sc-grain" />

      {/* Scroll-snap container */}
      <div ref={scrollRef} className="sc-scroll">
        {/* ─── Section 1: The Identity + Etymology ─── */}
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
          <div className="sc-scrim ab-scrim-dict" />
          <div className="sc-content ab-content-origin">
            <div className="ab-dict-card">
              {/* Headword */}
              <h1 className="ab-dict-headword">engenium</h1>
              <p className="ab-dict-phonetic">/en&middot;JEN&middot;ee&middot;um/</p>

              {/* Origin line */}
              <div className="ab-dict-origin">
                <span className="ab-dict-origin-label">origin</span>
                <span className="ab-dict-origin-text">
                  Latin <em>ingenium</em>, <em>in-</em>{" "}
                  (inborn, within) + <em>gen-</em> (to beget, to produce, to
                  bring forth)
                </span>
              </div>

              <div className="ab-dict-rule" />

              {/* Definitions */}
              <div className="ab-dict-defs">
                <div className="ab-dict-def">
                  <span className="ab-dict-def-num">1</span>
                  <div>
                    <p className="ab-dict-def-text">
                      Inborn generative power. The capacity to produce from
                      within.
                    </p>
                  </div>
                </div>

                <div className="ab-dict-def">
                  <span className="ab-dict-def-num">2</span>
                  <div>
                    <p className="ab-dict-def-text">
                      The direct ancestor of both <em>engine</em> and{" "}
                      <em>ingenuity</em>. The word that means the generating
                      generator. Not redundant, but
                      resonant.
                    </p>
                  </div>
                </div>

                <div className="ab-dict-def">
                  <span className="ab-dict-def-num">3</span>
                  <div>
                    <p className="ab-dict-def-text">
                      A digital systems agency that builds infrastructure for
                      the generative era. Austin, TX.
                    </p>
                    <p className="ab-dict-usage">
                      &ldquo;The engine and the generative were always the same
                      word.&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              <div className="ab-dict-rule" />

              {/* See also */}
              <div className="ab-dict-seealso">
                <span className="ab-dict-seealso-label">see also</span>
                <span className="ab-dict-seealso-words">
                  genesis, genius, genuine, ingenious, engineer, generate,
                  progeny
                </span>
              </div>
            </div>
          </div>
          <div className="sc-section-label sc-section-label-left">01</div>
        </section>

        {/* ─── Section 2: The Values ─── */}
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
          <div className="sc-content ab-content-values">
            <span className="sc-label">The Values</span>
            <h2 className="ab-values-headline">
              Four values.
              <br />
              One root.
            </h2>
            <div className="ab-values-grid">
              <div className="ab-value">
                <h3 className="ab-value-title">Ingenious</h3>
                <p className="ab-value-body">
                  Every build has at least one thing we thought through harder
                  than anyone else would have.
                </p>
              </div>
              <div className="ab-value">
                <h3 className="ab-value-title">Genuine</h3>
                <p className="ab-value-body">
                  A family business. Real names. Clients talk to the people
                  doing the work.
                </p>
              </div>
              <div className="ab-value">
                <h3 className="ab-value-title">Generative</h3>
                <p className="ab-value-body">
                  We build things that compound. A website is infrastructure. An
                  automation is leverage.
                </p>
              </div>
              <div className="ab-value">
                <h3 className="ab-value-title">Grounded</h3>
                <p className="ab-value-body">
                  Low ego, high competence. We do the work and show the results.
                </p>
              </div>
            </div>
          </div>
          <div className="sc-section-label sc-section-label-left">02</div>
        </section>

        {/* ─── Section 3: Austin + CTA ─── */}
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
          <div className="sc-content ab-content-austin">
            <span className="sc-label">Austin, Texas</span>
            <h2 className="ab-austin-headline">
              Local team. Real names.
              <br />
              We answer the phone.
            </h2>
            <div className="ab-austin-footer">
              <div className="sc-rule" />
              <p className="ab-austin-body">
                Based in Austin, Texas. We work with businesses here first, by
                choice, because local relationships and trust matter more to us
                than scale.
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
