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
const SEGMENTS = ["built to be found.", "by anything that searches."];

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

      {/* ── Logo: Classic (desktop) ── */}
      <div className="tf-logo-layer tf-logo--classic">
        <div className="tf-logo-wrap">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 280 200"
            className="tf-logo-svg"
            aria-label="Engenium Labs"
          >
            {/* Keystone symbol */}
            <g transform="translate(140, 32)">
              <svg
                viewBox="0 0 100 100"
                width="54"
                height="54"
                x="-27"
                y="0"
                fill="none"
              >
                <path
                  d="M13,17 L87,17 L66,85 L34,85 Z"
                  stroke="#F5EFE0"
                  strokeWidth="2.2"
                  strokeLinejoin="miter"
                />
                <path
                  d="M27,29 L73,29 L58,76 L42,76 Z"
                  stroke="#F5EFE0"
                  strokeWidth="0.9"
                  opacity="0.36"
                  strokeLinejoin="miter"
                />
                <line
                  x1="50"
                  y1="17"
                  x2="50"
                  y2="29"
                  stroke="#F5EFE0"
                  strokeWidth="0.9"
                  opacity="0.3"
                />
              </svg>
            </g>

            {/* Clay rule */}
            <line
              x1="56"
              y1="100"
              x2="224"
              y2="100"
              stroke="#A86040"
              strokeWidth="1"
            />

            {/* ENGENIUM wordmark */}
            <text
              x="140"
              y="138"
              textAnchor="middle"
              fontFamily="var(--font-cormorant), Georgia, serif"
              fontWeight="300"
              fontSize="25"
              letterSpacing="0.22em"
              fill="#F5EFE0"
            >
              ENGENIUM
            </text>

            {/* LABS */}
            <text
              x="140"
              y="162"
              textAnchor="middle"
              fontFamily="var(--font-jetbrains), monospace"
              fontSize="10"
              letterSpacing="0.46em"
              fill="#A86040"
            >
              LABS
            </text>
          </svg>
        </div>
      </div>

      {/* ── Logo: Ghost Field (mobile only) ── */}
      <div className="tf-logo-layer tf-logo--ghost">
        <div className="tf-logo-wrap">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 280 220"
            className="tf-logo-svg"
            aria-label="Engenium Labs"
          >
            {/* Ghost keystone — large, behind text */}
            <g transform="translate(140, 110)" opacity="0.12">
              <svg viewBox="0 0 100 100" width="230" height="230" x="-115" y="-106" fill="none">
                <path d="M13,17 L87,17 L66,85 L34,85 Z" stroke="#F5EFE0" strokeWidth="1.8" strokeLinejoin="miter" />
                <path d="M27,29 L73,29 L58,76 L42,76 Z" stroke="#F5EFE0" strokeWidth="0.8" strokeLinejoin="miter" />
                <line x1="50" y1="17" x2="50" y2="29" stroke="#F5EFE0" strokeWidth="0.8" />
              </svg>
            </g>

            {/* ENGENIUM wordmark — over the ghost */}
            <text
              x="140"
              y="98"
              textAnchor="middle"
              fontFamily="var(--font-cormorant), Georgia, serif"
              fontWeight="300"
              fontSize="28"
              letterSpacing="0.22em"
              fill="#F5EFE0"
            >
              ENGENIUM
            </text>

            {/* Verdigris rule */}
            <line x1="54" y1="114" x2="226" y2="114" stroke="#507E78" strokeWidth="1" />

            {/* LABS in Verdigris */}
            <text
              x="140"
              y="138"
              textAnchor="middle"
              fontFamily="var(--font-jetbrains), monospace"
              fontSize="10"
              letterSpacing="0.46em"
              fill="#507E78"
            >
              LABS
            </text>
          </svg>
        </div>
      </div>

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
