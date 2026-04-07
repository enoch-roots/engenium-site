"use client";

import { useEffect, useRef, useCallback } from "react";
import "./MagnetLinesHero.css";

/* ── Keyframes injected once ───────────────────────────────── */
const INVISIBLE_KEYFRAMES = `
@keyframes invisiblePulse {
  0%, 100% { filter: blur(3.5px); opacity: 0.35; }
  50%      { filter: blur(1.5px); opacity: 0.55; }
}`;

if (typeof document !== "undefined") {
  const id = "magnetlines-invisible-kf";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = INVISIBLE_KEYFRAMES;
    document.head.appendChild(style);
  }
}

/* ── Grid config ────────────────────────────────────────────── */
const ROWS = 10;
const COLS = 12;
const CYCLE_DURATION = 10000; // ms

/* ── Easing helpers ─────────────────────────────────────────── */
function smoothstep(t: number) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}
function smootherstep(t: number) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * c * (c * (c * 6 - 15) + 10);
}

/* ── Component ──────────────────────────────────────────────── */
interface MagnetLinesHeroProps {
  active?: boolean;
}

export default function MagnetLinesHero({ active = true }: MagnetLinesHeroProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const phaseLabelRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const activeRef = useRef(active);
  const pausedAtRef = useRef<number>(0);
  const resumeOffsetRef = useRef<number>(0);
  activeRef.current = active;

  const initAnimation = useCallback(() => {
    const grid = gridRef.current;
    const dot = dotRef.current;
    const phaseLabel = phaseLabelRef.current;
    const box = boxRef.current;
    if (!grid || !dot || !phaseLabel || !box) return;

    /* Build grid cells */
    grid.innerHTML = "";
    const lines: { el: HTMLDivElement; row: number; col: number; cx: number; cy: number }[] = [];

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement("div");
        cell.style.display = "flex";
        cell.style.alignItems = "center";
        cell.style.justifyContent = "center";

        const line = document.createElement("div");
        line.style.width = "2px";
        line.style.height = "24px";
        line.style.background = "#507E78";
        line.style.borderRadius = "1px";
        line.style.willChange = "transform";
        line.style.opacity = "0.6";

        cell.appendChild(line);
        grid.appendChild(cell);
        lines.push({ el: line, row: r, col: c, cx: 0, cy: 0 });
      }
    }

    /* Container geometry — cached, only recalculated on resize */
    const container = grid.parentElement!;
    let containerRect = container.getBoundingClientRect();
    let centerX = containerRect.left + containerRect.width / 2;
    let centerY = containerRect.top + containerRect.height / 2;

    function updateRect() {
      containerRect = container.getBoundingClientRect();
      centerX = containerRect.left + containerRect.width / 2;
      centerY = containerRect.top + containerRect.height / 2;

      /* Cache every cell center — avoids 120 getBoundingClientRect calls per frame */
      for (const item of lines) {
        const cellEl = item.el.parentElement!;
        const rect = cellEl.getBoundingClientRect();
        item.cx = rect.left + rect.width / 2;
        item.cy = rect.top + rect.height / 2;
      }
    }

    const ro = new ResizeObserver(updateRect);
    ro.observe(container);
    updateRect();

    /* Dot position by phase — truly continuous loop.
       The orbit angle advances exactly 2π per cycle so t=0
       and t=1 produce the same position. All phase transitions
       are C1-continuous (matching position AND velocity). */

    // One full orbit per cycle = 2π per CYCLE_DURATION
    const ORBIT_SPEED = (2 * Math.PI) / CYCLE_DURATION;

    function getDotPosition(time: number) {
      const t = (time % CYCLE_DURATION) / CYCLE_DURATION;
      const w = containerRect.width;
      const h = containerRect.height;
      const outerRadius = Math.max(w, h) * 0.75;

      // Base angle: continuous, completes exactly one revolution per cycle
      const baseAngle = time * ORBIT_SPEED;

      let x: number, y: number, phase: string;

      if (t < 0.25) {
        // Phase 1: Orbit outside — full outer radius
        phase = "unseen";
        const r = outerRadius * 0.8;
        x = centerX + Math.cos(baseAngle) * r;
        y = centerY + Math.sin(baseAngle) * r;

      } else if (t < 0.50) {
        // Phase 2: Spiral inward — radius shrinks smoothly to ~0
        phase = "converging";
        const spiralT = (t - 0.25) / 0.25;
        const eased = smootherstep(spiralT);
        const r = outerRadius * 0.8 * (1 - eased);
        // Add extra rotation during spiral for visual interest
        const spiralAngle = baseAngle + eased * Math.PI * 1.5;
        x = centerX + Math.cos(spiralAngle) * r;
        y = centerY + Math.sin(spiralAngle) * r;

      } else if (t < 0.75) {
        // Phase 3: Hold at center with gentle breathing
        phase = "found";
        const holdT = (t - 0.50) / 0.25;
        const breathe = Math.sin(holdT * Math.PI * 2) * 5;
        x = centerX + breathe * Math.cos(baseAngle * 1.5);
        y = centerY + breathe * Math.sin(baseAngle * 1.5);

      } else {
        // Phase 4: Drift outward — radius grows back to match Phase 1 start
        phase = "unseen";
        const exitT = (t - 0.75) / 0.25;
        const eased = smootherstep(exitT);
        const r = outerRadius * 0.8 * eased;
        // Angle at end of this phase = baseAngle at t=1
        // which equals baseAngle at t=0 of next cycle (mod 2π)
        x = centerX + Math.cos(baseAngle) * r;
        y = centerY + Math.sin(baseAngle) * r;
      }

      return { x, y, phase };
    }

    /* ── Pulse wave state ─────────────────────────────────── */
    const PULSE_DURATION = 1200; // ms for the wave to reach the edges
    const PULSE_FADE = 2500;     // ms for clay color to fade back to verdigris after wave passes
    const PULSE_RING_WIDTH = 0.25; // width of the wavefront as a fraction of maxDist
    let pulseStart = -1;         // timestamp when "found" phase began
    let pulseMaxDist = 0;        // diagonal of the container (cached)

    /* Verdigris & Clay as RGB for interpolation */
    const VERDIGRIS = { r: 80, g: 126, b: 120 };
    const CLAY      = { r: 168, g: 96, b: 64 };

    function lerpColor(a: typeof VERDIGRIS, b: typeof VERDIGRIS, t: number) {
      const ct = Math.max(0, Math.min(1, t));
      const r = Math.round(a.r + (b.r - a.r) * ct);
      const g = Math.round(a.g + (b.g - a.g) * ct);
      const bl = Math.round(a.b + (b.b - a.b) * ct);
      return `rgb(${r},${g},${bl})`;
    }

    /* Line rotation + pulse color — uses cached cell positions */
    function updateLines(dotX: number, dotY: number, now: number) {
      const maxDist = Math.max(containerRect.width, containerRect.height) * 1.2;
      const isPulsing = pulseStart > 0;
      const pulseElapsed = isPulsing ? now - pulseStart : -1;

      for (const item of lines) {
        const dx = dotX - item.cx;
        const dy = dotY - item.cy;
        const a = Math.atan2(dy, dx) * (180 / Math.PI);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = 1 - Math.min(dist / maxDist, 1);

        /* ── Pulse wave color ── */
        let colorMix = 0; // 0 = verdigris, 1 = clay
        let scaleBump = 1;

        if (isPulsing && pulseMaxDist > 0) {
          // Distance from container center (not dot) for a clean radial wave
          const cdx = item.cx - centerX;
          const cdy = item.cy - centerY;
          const distFromCenter = Math.sqrt(cdx * cdx + cdy * cdy);
          const normDist = distFromCenter / pulseMaxDist;

          // Wavefront position (0→1 over PULSE_DURATION)
          const waveFront = Math.min(pulseElapsed / PULSE_DURATION, 1.4);
          // How far past the wavefront this cell is (negative = wave hasn't reached yet)
          const delta = waveFront - normDist;

          if (delta > 0) {
            // Wave has passed — ramp up to clay then slowly fade back
            const fadeProgress = Math.max(0, (pulseElapsed - normDist * PULSE_DURATION) / PULSE_FADE);
            colorMix = 1 - smoothstep(fadeProgress);

            // Scale bump at the wavefront
            if (delta < PULSE_RING_WIDTH) {
              const ringT = delta / PULSE_RING_WIDTH;
              scaleBump = 1 + 0.4 * Math.sin(ringT * Math.PI);
            }
          }
        }

        const color = colorMix > 0.01
          ? lerpColor(VERDIGRIS, CLAY, colorMix)
          : "#507E78";

        item.el.style.transform = `rotate(${a}deg) scaleY(${scaleBump})`;
        item.el.style.opacity = String(0.2 + proximity * 0.7 + colorMix * 0.2);
        item.el.style.background = color;
      }
    }

    /* Render loop — pauses when section is off-screen */
    let lastPhase = "";
    let startTime: number | null = null;
    let wasPaused = false;

    function animate(timestamp: number) {
      rafRef.current = requestAnimationFrame(animate);

      if (!activeRef.current) {
        if (!wasPaused && startTime !== null) {
          pausedAtRef.current = timestamp;
          wasPaused = true;
        }
        return; // skip all DOM work
      }

      if (wasPaused) {
        resumeOffsetRef.current += timestamp - pausedAtRef.current;
        wasPaused = false;
      }

      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime - resumeOffsetRef.current;

      const { x, y, phase } = getDotPosition(elapsed);

      if (!dot) return;
      dot.style.left = x - containerRect.left - 5 + "px";
      dot.style.top = y - containerRect.top - 5 + "px";

      /* Centered glow + pulse on arrival */
      if (phase === "found") {
        const pulseAge = elapsed - pulseStart;
        // Quick scale punch on arrival (first 400ms)
        const dotScale = pulseAge < 400
          ? 1 + 1.5 * Math.sin((pulseAge / 400) * Math.PI)
          : 1 + 0.15 * Math.sin(pulseAge * 0.003);
        dot.style.transform = `scale(${dotScale})`;
        dot.style.boxShadow =
          "0 0 30px rgba(168,96,64,0.7), 0 0 80px rgba(168,96,64,0.35), 0 0 120px rgba(168,96,64,0.15)";
      } else {
        dot.style.transform = "scale(1)";
        dot.style.boxShadow =
          "0 0 20px rgba(168,96,64,0.5), 0 0 60px rgba(168,96,64,0.2)";
      }

      /* Phase label — prefix (mono) + keyword (serif italic) */
      const PREFIX_STYLE = `
        font-family: var(--font-jetbrains), monospace;
        font-weight: 300;
        font-size: 1em;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: rgba(245,239,224,0.6);
        margin-right: 0.4em;
      `;
      const KEYWORD_STYLE = `
        font-family: var(--font-jetbrains), monospace;
        font-weight: 400;
        font-size: 1em;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      `;

      if (phase !== lastPhase && phaseLabel) {
        /* Trigger / reset pulse wave */
        if (phase === "found") {
          pulseStart = elapsed; // already in ms
          pulseMaxDist = Math.sqrt(containerRect.width * containerRect.width + containerRect.height * containerRect.height) * 0.5;
        } else if (lastPhase === "found") {
          pulseStart = -1; // clear pulse
        }

        lastPhase = phase;
        if (phase === "unseen") {
          phaseLabel.innerHTML = `<span style="${PREFIX_STYLE}">don't stay</span><span style="${KEYWORD_STYLE}; color:#A86040; filter:blur(2px); opacity:0.5;">invisible</span>`;
          phaseLabel.style.opacity = "1";
          phaseLabel.style.filter = "none";
        } else if (phase === "converging") {
          phaseLabel.innerHTML = `<span style="${PREFIX_STYLE}">begin</span><span style="${KEYWORD_STYLE}; color:#507E78;">emerging</span>`;
          phaseLabel.style.opacity = "1";
          phaseLabel.style.filter = "none";
        } else if (phase === "found") {
          phaseLabel.innerHTML = `<span style="${PREFIX_STYLE}">get</span><span style="${KEYWORD_STYLE}; color:#A86040;">found</span>`;
          phaseLabel.style.opacity = "1";
          phaseLabel.style.filter = "none";
        }
      }

      updateLines(x, y, elapsed);

      /* ── Box border glow — fires when ripple hits the edge ── */
      if (pulseStart > 0 && box) {
        const pulseElapsed = elapsed - pulseStart;
        const waveFront = pulseElapsed / PULSE_DURATION;

        if (waveFront >= 0.85) {
          // Glow ramps up as wave hits the edge, then fades over 2s
          const glowAge = pulseElapsed - PULSE_DURATION * 0.85;
          const GLOW_RAMP = 300;  // ms to reach full glow
          const GLOW_HOLD = 600;  // ms at full intensity
          const GLOW_FADE = 1500; // ms to fade out

          let glowIntensity = 0;
          if (glowAge < GLOW_RAMP) {
            glowIntensity = smoothstep(glowAge / GLOW_RAMP);
          } else if (glowAge < GLOW_RAMP + GLOW_HOLD) {
            glowIntensity = 1;
          } else {
            const fadeT = (glowAge - GLOW_RAMP - GLOW_HOLD) / GLOW_FADE;
            glowIntensity = 1 - smoothstep(Math.min(fadeT, 1));
          }

          const g = glowIntensity;
          box.style.borderColor = lerpColor(
            { r: 80, g: 126, b: 120 },  // verdigris at 0.12 opacity base
            CLAY,
            g
          );
          box.style.boxShadow = g > 0.01
            ? `0 0 ${12 * g}px rgba(168,96,64,${0.4 * g}), 0 0 ${30 * g}px rgba(168,96,64,${0.2 * g}), inset 0 0 ${15 * g}px rgba(168,96,64,${0.1 * g})`
            : "none";
        }
      } else if (box) {
        // Reset when not pulsing
        box.style.borderColor = "rgba(80,126,120,0.12)";
        box.style.boxShadow = "none";
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const cleanup = initAnimation();
    return () => cleanup?.();
  }, [initAnimation]);

  return (
    <div style={styles.root}>
      {/* Nighty Night background */}
      <div style={styles.bgNighty}>
        <div style={styles.plane} />
        <div style={styles.horizonGlow} />
      </div>

      {/* Grain */}
      <div style={styles.grain} />

      {/* Hero grid layout */}
      <div className="ml-hero" style={styles.hero}>
        {/* Copy side */}
        <div className="ml-hero-copy" style={styles.heroCopy}>
          <div style={{ ...styles.eyebrow, color: "#507E78" }}>Visibility · Authority · Momentum</div>
          <h1 className="ml-headline" style={styles.headline}>
            From{" "}
            <span
              style={{
                display: "inline-block",
                animation: "invisiblePulse 6s ease-in-out infinite",
                filter: "blur(3.5px)",
                opacity: 0.35,
                color: "#F5EFE0",
              }}
            >
              invisible
            </span>
            <br />
            to{" "}
            <em style={{ fontStyle: "italic", color: "#A86040" }}>
              unavoidable.
            </em>
          </h1>
          <p className="ml-body" style={styles.body}>
            We engineer every layer of your digital presence so that when
            someone searches, asks an AI, or looks for what you do, everything
            points back to you.
          </p>

          {/* Capability labels — each links to services page anchor */}
          <div className="ml-cap-row" style={styles.capRow}>
            {[
              { label: "Web", anchor: "web" },
              { label: "Automation", anchor: "automation" },
              { label: "Analytics", anchor: "analytics" },
              { label: "Interactive", anchor: "interactive" },
              { label: "GEO", anchor: "geo" },
            ].map((cap) => (
              <a
                key={cap.label}
                href={`/services#${cap.anchor}`}
                className="ml-cap-label"
                style={styles.capLabel}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(168,96,64,0.5)";
                  e.currentTarget.style.color = "rgba(245,239,224,0.7)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(80,126,120,0.25)";
                  e.currentTarget.style.color = "rgba(245,239,224,0.45)";
                }}
              >
                {cap.label}
              </a>
            ))}
          </div>

          <div className="ml-cta-row" style={styles.ctaRow}>
            <a
              href="/services"
              className="ml-cta-primary"
              style={styles.ctaPrimary}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(168,96,64,0.12)";
                e.currentTarget.style.borderColor = "#A86040";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(168,96,64,0.5)";
              }}
            >
              <span style={styles.ctaDot} /> Explore our services
            </a>
            <a
              href="/who-we-work-with"
              className="ml-cta-secondary"
              style={styles.ctaSecondary}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(245,239,224,0.65)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(245,239,224,0.35)";
              }}
            >
              Who we work with →
            </a>
          </div>
        </div>

        {/* Visual side — MagnetLines */}
        <div className="ml-hero-visual" style={styles.heroVisual}>
          <div className="ml-magnet-wrapper" style={styles.magnetWrapper}>
            <div ref={phaseLabelRef} className="ml-phase-label" style={styles.phaseLabel} />
            <div ref={boxRef} style={styles.magnetContainer}>
              <div
                ref={gridRef}
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                  gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                  width: "100%",
                  height: "100%",
                  padding: "8px",
                }}
              />
            </div>
            <div
              ref={dotRef}
              style={styles.magnetDot}
            />
          </div>
        </div>
      </div>

      {/* Portfolio label */}
      <div className="ml-config-label" style={styles.configLabel}>
        Built by Engenium Labs &bull; Canvas 2D &bull; Physics simulation
        &bull; Real-time rendering
      </div>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    background: "#0e0c0a",
    color: "#F5EFE0",
    WebkitFontSmoothing: "antialiased",
  },

  /* Nighty Night bg */
  bgNighty: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    overflow: "hidden",
  },
  plane: {
    position: "absolute",
    width: "200%",
    height: "200%",
    bottom: "-80%",
    left: "-50%",
    background: `linear-gradient(
      -60deg,
      rgba(23,18,16,1) 0%,
      rgba(23,18,16,0.98) 25%,
      rgba(80,126,120,0.2) 45%,
      rgba(168,96,64,0.12) 60%,
      rgba(23,18,16,1) 80%
    )`,
    transform: "perspective(800px) rotateX(50deg) rotateZ(-10deg)",
    transformOrigin: "center center",
    animation: "mlNightDrift 40s linear infinite",
    filter: "blur(2px) brightness(0.85)",
  },
  horizonGlow: {
    position: "absolute",
    width: "100%",
    height: "40%",
    bottom: "25%",
    left: 0,
    background: `linear-gradient(
      to top,
      transparent 0%,
      rgba(80,126,120,0.06) 40%,
      rgba(168,96,64,0.04) 60%,
      transparent 100%
    )`,
    filter: "blur(40px)",
  },

  /* Grain */
  grain: {
    position: "absolute",
    inset: 0,
    zIndex: 100,
    opacity: 0.4,
    mixBlendMode: "overlay" as const,
    pointerEvents: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    backgroundSize: "140px 140px",
  },

  /* Hero layout */
  hero: {
    position: "relative",
    zIndex: 10,
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    alignItems: "center",
    padding: "4rem",
    gap: "4rem",
    maxWidth: "1400px",
    margin: "0 auto",
  },

  /* Copy */
  heroCopy: {
    position: "relative",
    zIndex: 10,
    userSelect: "text" as const,
  },

  eyebrow: {
    fontFamily: "var(--font-jetbrains), monospace",
    fontWeight: 300,
    fontSize: "0.8rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: "#A86040",
    opacity: 1,
    marginBottom: "1.5rem",
  },

  headline: {
    fontFamily: "var(--font-cormorant), serif",
    fontWeight: 300,
    fontSize: "clamp(2.6rem, 5vw, 4.2rem)",
    lineHeight: 1.05,
    letterSpacing: "-0.025em",
    marginBottom: "1.5rem",
    color: "#F5EFE0",
  },

  body: {
    fontFamily: "var(--font-dm-sans), sans-serif",
    fontWeight: 300,
    fontSize: "1.05rem",
    lineHeight: 1.7,
    maxWidth: "38ch",
    opacity: 0.6,
    marginBottom: "2.5rem",
    color: "#F5EFE0",
  },

  capRow: {
    display: "flex",
    gap: "0.6rem",
    flexWrap: "wrap" as const,
    marginBottom: "2.5rem",
  },

  capLabel: {
    fontFamily: "var(--font-jetbrains), monospace",
    fontWeight: 300,
    fontSize: "0.75rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    padding: "0.4rem 0.85rem",
    border: "1px solid rgba(80,126,120,0.5)",
    color: "rgba(245,239,224,0.8)",
    textDecoration: "none",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },

  ctaRow: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap" as const,
  },

  ctaPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.8rem 2rem",
    border: "1px solid rgba(168,96,64,0.5)",
    background: "transparent",
    color: "#F5EFE0",
    fontFamily: "var(--font-dm-sans), sans-serif",
    fontWeight: 400,
    fontSize: "0.85rem",
    letterSpacing: "0.03em",
    textDecoration: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  ctaDot: {
    display: "inline-block",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#A86040",
    animation: "mlCtaPulse 2s ease-in-out infinite",
  },

  ctaSecondary: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.8rem 1.5rem",
    border: "none",
    background: "transparent",
    color: "rgba(245,239,224,0.35)",
    fontFamily: "var(--font-dm-sans), sans-serif",
    fontWeight: 300,
    fontSize: "0.85rem",
    letterSpacing: "0.03em",
    textDecoration: "none",
    cursor: "pointer",
    transition: "color 0.3s ease",
  },

  /* Visual side */
  heroVisual: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    zIndex: 10,
  },

  magnetWrapper: {
    position: "relative",
    width: "clamp(280px, 40vmin, 480px)",
    height: "clamp(280px, 40vmin, 480px)",
  },

  magnetContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
    border: "1px solid rgba(80,126,120,0.12)",
    borderRadius: "8px",
    overflow: "hidden",
    background: "rgba(23,18,16,0.6)",
  },

  magnetDot: {
    position: "absolute",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#A86040",
    zIndex: 20,
    pointerEvents: "none",
    boxShadow:
      "0 0 20px rgba(168,96,64,0.5), 0 0 60px rgba(168,96,64,0.2)",
    transition: "box-shadow 0.5s ease",
  },

  phaseLabel: {
    position: "absolute",
    top: "-3.5rem",
    left: 0,
    right: 0,
    textAlign: "center" as const,
    fontFamily: "var(--font-jetbrains), monospace",
    fontWeight: 300,
    fontSize: "clamp(1rem, 2vw, 1.4rem)",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    opacity: 0,
    transition: "opacity 0.6s ease, filter 0.6s ease",
    color: "#A86040",
  },

  /* Config label */
  configLabel: {
    position: "absolute",
    bottom: "1.5rem",
    left: "50%",
    transform: "translateX(-50%)",
    fontFamily: "var(--font-jetbrains), monospace",
    fontWeight: 300,
    fontSize: "0.7rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    opacity: 0.6,
    zIndex: 20,
    whiteSpace: "nowrap",
    color: "#F5EFE0",
  },
};
