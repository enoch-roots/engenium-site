"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useOpenAudit } from "./AuditModalContext";
import "./TrueFocusHero.css";

/* ── Lazy-load the heavy Three.js canvas ─────────────────────── */
const GradientCanvas = dynamic(() => import("../how-we-work/GradientCanvas"), {
  ssr: false,
});

/* ── Ember Drift config (from shader-translation-guide.md) ──── */
const EMBER_DRIFT = {
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
  cAzimuthAngle: 0,
  cPolarAngle: 90,
  cDistance: 3.6,
  pixelDensity: 1,
};

/* ── Segment data ────────────────────────────────────────────── */
const SEGMENTS = [
  "built to be found.",
  <>in the new <br className="tf-mobile-break" />generation of search.</>,
];

const ANIMATION_DURATION = 500;
const PAUSE_BETWEEN = 1800;

interface TrueFocusHeroProps {
  /** Only mount the WebGL canvas when the section is active/visible */
  active?: boolean;
}

export default function TrueFocusHero({ active = true }: TrueFocusHeroProps) {
  const openAudit = useOpenAudit();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Focus cycle ───────────────────────────────────────────── */
  const cycle = useCallback(() => {
    setFocusedIndex((prev) => {
      const next = prev === null ? 0 : (prev + 1) % SEGMENTS.length;
      return next;
    });
  }, []);

  useEffect(() => {
    if (!active) return;
    const init = setTimeout(() => {
      cycle();
    }, 600);
    return () => clearTimeout(init);
  }, [cycle, active]);

  useEffect(() => {
    if (focusedIndex === null || !active) return;
    timerRef.current = setTimeout(cycle, PAUSE_BETWEEN + ANIMATION_DURATION);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [focusedIndex, cycle, active]);

  return (
    <div className="tf-root">
      {/* ── Shader gradient background ── */}
      <div
        className="tf-bg"
        style={{ visibility: active ? "visible" : "hidden" }}
      >
        <GradientCanvas config={EMBER_DRIFT} />
      </div>

      {/* ── Scrim for text readability ── */}
      <div className="tf-scrim" />

      {/* ── Film grain ── */}
      <div className="tf-grain" />


      {/* ── Hero content ── */}
      <div className="tf-hero">
        {/* TrueFocus segments */}
        <div className="tf-segments">
          {SEGMENTS.map((text, i) => {
            const isFocused = focusedIndex === i;
            return (
              <div
                key={i}
                className="tf-segment"
                style={{
                  filter: isFocused ? "blur(0px)" : "blur(5px)",
                  opacity: isFocused ? 1 : 0.35,
                }}
              >
                {text}
                <div className="tf-border-frame">
                  <div
                    className="tf-edge tf-edge-top"
                    style={{
                      transform: isFocused ? "scaleX(1)" : "scaleX(0)",
                      opacity: isFocused ? 1 : 0,
                    }}
                  />
                  <div
                    className="tf-edge tf-edge-right"
                    style={{
                      transform: isFocused ? "scaleY(1)" : "scaleY(0)",
                      opacity: isFocused ? 1 : 0,
                      transitionDelay: isFocused ? "0.1s" : "0s",
                    }}
                  />
                  <div
                    className="tf-edge tf-edge-bottom"
                    style={{
                      transform: isFocused ? "scaleX(1)" : "scaleX(0)",
                      opacity: isFocused ? 1 : 0,
                      transitionDelay: isFocused ? "0.2s" : "0s",
                    }}
                  />
                  <div
                    className="tf-edge tf-edge-left"
                    style={{
                      transform: isFocused ? "scaleY(1)" : "scaleY(0)",
                      opacity: isFocused ? 1 : 0,
                      transitionDelay: isFocused ? "0.3s" : "0s",
                    }}
                  />
                  {(["tl", "tr", "bl", "br"] as const).map((corner) => (
                    <div
                      key={corner}
                      className={`tf-corner tf-corner-${corner}`}
                      style={{
                        opacity: isFocused ? 1 : 0,
                        transitionDelay: isFocused ? "0.35s" : "0s",
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Subtitle */}
        <p className="tf-subtitle">
          Digital systems for businesses that are ready to scale.
        </p>

        {/* CTA */}
        <div className="tf-cta-row">
          <button type="button" onClick={openAudit} className="tf-cta-primary">
            Get your free visibility audit
          </button>
          <a href="/services" className="tf-cta-secondary">
            See how it works
          </a>
        </div>
      </div>

      {/* ── Portfolio label ── */}
      <div className="tf-config-label">
        Built by Engenium Labs &bull; Next.js &bull; Three.js &bull; Custom
        shaders &bull; React 18
      </div>
    </div>
  );
}
