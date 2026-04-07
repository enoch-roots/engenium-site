"use client";

import { useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════════════════════════
   CUBES HERO — React port of cubes-hero-v2.html
   CSS 3D cubes grid with GSAP tilt + ripple + LetterGlitch
   GSAP loaded dynamically (no npm install needed)
   ══════════════════════════════════════════════════════════════ */

/* ── Config ─────────────────────────────────────────────────── */
const GRID_SIZE = 8;
const MAX_ANGLE = 45;
const RADIUS = 3;
const EASING = "power3.out";
const ENTER_DUR = 0.3;
const LEAVE_DUR = 0.6;
const RIPPLE_SPEED = 1.4;

const FACE_COLOR = "rgb(23, 18, 16)";
const RIPPLE_COLOR = "rgba(80, 126, 120, 0.6)";
const LINEN_GLOW =
  "0 0 18px rgba(245,239,224,0.3), 0 0 8px rgba(245,239,224,0.2), 0 0 3px rgba(245,239,224,0.3), inset 0 0 6px rgba(245,239,224,0.08)";
const LINEN_GLOW_DIM =
  "0 0 12px rgba(245,239,224,0.2), 0 0 5px rgba(245,239,224,0.15), 0 0 2px rgba(245,239,224,0.2), inset 0 0 4px rgba(245,239,224,0.05)";
const NO_SHADOW = "0 0 0px rgba(245,239,224,0)";

/* ── LetterGlitch engine ────────────────────────────────────── */
const GLITCH_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789";
const GLITCH_COLORS = ["#7EC4BB", "#F5EFE0", "#5A9A92", "#D4C9B5", "#4DBAAD"];
const FONT_SIZE = 11;
const CHAR_W = 7;
const CHAR_H = 14;
const REF_SIZE = 80;
const GLITCH_SPEED = 50;

const charArr = Array.from(GLITCH_CHARS);
const randChar = () => charArr[Math.floor(Math.random() * charArr.length)];
const randColor = () =>
  GLITCH_COLORS[Math.floor(Math.random() * GLITCH_COLORS.length)];

function hexToRgb(hex: string) {
  hex = hex.replace(
    /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
    (_m, r, g, b) => r + r + g + g + b + b,
  );
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    : null;
}

function lerpColor(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number,
) {
  return `rgb(${Math.round(a.r + (b.r - a.r) * t)},${Math.round(a.g + (b.g - a.g) * t)},${Math.round(a.b + (b.b - a.b) * t)})`;
}

interface GlitchLetter {
  char: string;
  color: string;
  targetColor: string;
  progress: number;
}

interface GlitchInstance {
  wrap: HTMLDivElement;
  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  cols: number;
  rows: number;
  letters: GlitchLetter[];
  lastGlitch: number;
}

function createLetterGlitchEngine() {
  const active = new Map<HTMLElement, GlitchInstance>();
  let rafId: number | null = null;
  let paused = false;

  function createInstance(face: HTMLElement): GlitchInstance {
    const w = REF_SIZE;
    const h = REF_SIZE;
    const dpr = window.devicePixelRatio || 1;
    const wrap = document.createElement("div");
    wrap.style.cssText =
      "position:absolute;inset:0;overflow:hidden;pointer-events:none;opacity:0;";
    const cvs = document.createElement("canvas");
    cvs.width = w * dpr;
    cvs.height = h * dpr;
    cvs.style.cssText = "display:block;width:100%;height:100%;";
    const ctx = cvs.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    wrap.appendChild(cvs);

    const cols = Math.ceil(w / CHAR_W);
    const rows = Math.ceil(h / CHAR_H);
    const letters: GlitchLetter[] = Array.from({ length: cols * rows }, () => ({
      char: randChar(),
      color: randColor(),
      targetColor: randColor(),
      progress: 1,
    }));

    face.appendChild(wrap);
    return {
      wrap,
      cvs,
      ctx,
      w,
      h,
      cols,
      rows,
      letters,
      lastGlitch: Date.now(),
    };
  }

  function drawInstance(inst: GlitchInstance) {
    const { ctx, w, h, cols, letters } = inst;
    ctx.clearRect(0, 0, w, h);
    ctx.font = `${FONT_SIZE}px monospace`;
    ctx.textBaseline = "top";
    for (let i = 0; i < letters.length; i++) {
      const x = (i % cols) * CHAR_W;
      const y = Math.floor(i / cols) * CHAR_H;
      ctx.fillStyle = letters[i].color;
      ctx.fillText(letters[i].char, x, y);
    }
  }

  function updateInstance(inst: GlitchInstance) {
    const count = Math.max(1, Math.floor(inst.letters.length * 0.08));
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * inst.letters.length);
      const L = inst.letters[idx];
      L.char = randChar();
      L.targetColor = randColor();
      L.progress = 0;
    }
  }

  function smoothPass(inst: GlitchInstance) {
    let dirty = false;
    for (const L of inst.letters) {
      if (L.progress < 1) {
        L.progress = Math.min(1, L.progress + 0.07);
        const a = hexToRgb(L.color);
        const b = hexToRgb(L.targetColor);
        if (a && b) {
          L.color = lerpColor(a, b, L.progress);
          dirty = true;
        }
      }
    }
    if (dirty) drawInstance(inst);
  }

  function tick() {
    if (active.size === 0) {
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(tick);
    if (paused) return; // keep loop alive but skip all work
    const now = Date.now();
    for (const [, inst] of active) {
      if (now - inst.lastGlitch >= GLITCH_SPEED) {
        updateInstance(inst);
        drawInstance(inst);
        inst.lastGlitch = now;
      }
      smoothPass(inst);
    }
  }

  function startLoop() {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  return {
    activate(face: HTMLElement) {
      if (active.has(face)) return;
      const inst = createInstance(face);
      active.set(face, inst);
      drawInstance(inst);
      startLoop();
      return inst.wrap;
    },
    deactivate(face: HTMLElement) {
      const inst = active.get(face);
      if (!inst) return;
      active.delete(face);
      return inst.wrap;
    },
    getWrap(face: HTMLElement) {
      return active.get(face)?.wrap ?? null;
    },
    setPaused(v: boolean) {
      paused = v;
    },
    destroy() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      active.clear();
    },
  };
}

/* ── GSAP loader ────────────────────────────────────────────── */
let gsapPromise: Promise<typeof globalThis.gsap> | null = null;

function loadGsap(): Promise<typeof globalThis.gsap> {
  if (gsapPromise) return gsapPromise;
  gsapPromise = new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && (window as any).gsap) {
      resolve((window as any).gsap);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js";
    script.onload = () => resolve((window as any).gsap);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return gsapPromise;
}

/* ── Component ──────────────────────────────────────────────── */
interface CubesHeroProps {
  active?: boolean;
}

export default function CubesHero({ active = true }: CubesHeroProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const activeRef = useRef(active);
  const pausedAtRef = useRef<number>(0);
  const resumeOffsetRef = useRef<number>(0);
  activeRef.current = active;

  const init = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    let destroyed = false;

    loadGsap().then((gsap) => {
      if (destroyed || !scene) return;

      const glitch = createLetterGlitchEngine();

      /* Build grid */
      scene.innerHTML = "";
      scene.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
      scene.style.gridTemplateRows = `repeat(${GRID_SIZE}, 1fr)`;

      interface CubeData {
        el: HTMLElement;
        row: number;
        col: number;
        frontFace: HTMLElement;
        allFaces: HTMLElement[];
        isTilted: boolean;
        isRippling: boolean;
        glitchMode: string | null;
      }

      const cubes: CubeData[] = [];

      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const cube = document.createElement("div");
          cube.className = "cube";
          cube.style.cssText =
            "position:relative;width:100%;height:100%;aspect-ratio:1/1;transform-style:preserve-3d;";

          const faceNames = ["top", "bottom", "left", "right", "front", "back"];
          const allFaces: HTMLElement[] = [];
          let frontFace: HTMLElement = null!;

          for (const f of faceNames) {
            const face = document.createElement("div");
            face.style.cssText = `position:absolute;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${FACE_COLOR};border:1px solid rgba(80,126,120,0.18);box-shadow:none;opacity:1;`;

            if (f === "top")
              face.style.transform = "translateY(-50%) rotateX(90deg)";
            else if (f === "bottom")
              face.style.transform = "translateY(50%) rotateX(-90deg)";
            else if (f === "left")
              face.style.transform = "translateX(-50%) rotateY(-90deg)";
            else if (f === "right")
              face.style.transform = "translateX(50%) rotateY(90deg)";
            else
              face.style.transform =
                "rotateY(-90deg) translateX(50%) rotateY(90deg)";

            if (f === "front") frontFace = face;
            cube.appendChild(face);
            allFaces.push(face);
          }

          scene.appendChild(cube);
          cubes.push({
            el: cube,
            row: r,
            col: c,
            frontFace,
            allFaces,
            isTilted: false,
            isRippling: false,
            glitchMode: null,
          });
        }
      }

      /* Glitch helpers */
      function activateAllFacesGlitch(cd: CubeData) {
        if (cd.glitchMode === "all") return;
        if (cd.glitchMode === "front") deactivateGlitch(cd);
        cd.glitchMode = "all";
        for (const face of cd.allFaces) {
          const wrap = glitch.activate(face);
          if (wrap)
            gsap.to(wrap, {
              opacity: 1,
              duration: ENTER_DUR * 0.6,
              ease: "power2.out",
            });
        }
      }

      function activateFrontGlitch(cd: CubeData) {
        if (cd.glitchMode) return;
        cd.glitchMode = "front";
        const wrap = glitch.activate(cd.frontFace);
        if (wrap)
          gsap.to(wrap, {
            opacity: 1,
            duration: ENTER_DUR * 0.6,
            ease: "power2.out",
          });
      }

      function deactivateGlitch(cd: CubeData, dur?: number) {
        if (!cd.glitchMode) return;
        const faces = cd.glitchMode === "all" ? cd.allFaces : [cd.frontFace];
        cd.glitchMode = null;
        for (const face of faces) {
          const wrap = glitch.getWrap(face);
          if (wrap) {
            gsap.to(wrap, {
              opacity: 0,
              duration: dur || LEAVE_DUR * 0.5,
              ease: "power2.in",
              onComplete() {
                glitch.deactivate(face);
                if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
              },
            });
          }
        }
      }

      /* Tilt */
      function tiltAt(rowCenter: number, colCenter: number) {
        for (const cd of cubes) {
          const dist = Math.hypot(cd.row - rowCenter, cd.col - colCenter);
          if (dist <= RADIUS) {
            const pct = 1 - dist / RADIUS;
            const angle = pct * MAX_ANGLE;
            const wasTilted = cd.isTilted;
            cd.isTilted = true;
            gsap.to(cd.el, {
              duration: ENTER_DUR,
              ease: EASING,
              overwrite: true,
              rotateX: -angle,
              rotateY: angle,
            });
            if (!wasTilted && cd.isRippling) activateAllFacesGlitch(cd);
          } else {
            const wasTilted = cd.isTilted;
            cd.isTilted = false;
            gsap.to(cd.el, {
              duration: LEAVE_DUR,
              ease: "power3.out",
              overwrite: true,
              rotateX: 0,
              rotateY: 0,
            });
            if (wasTilted && cd.isRippling) {
              deactivateGlitch(cd);
              activateFrontGlitch(cd);
            }
            if (wasTilted && !cd.isRippling && cd.glitchMode)
              deactivateGlitch(cd);
          }
        }
      }

      /* Ripple */
      function triggerRipple(colHit: number, rowHit: number) {
        const baseRingDelay = 0.15;
        const baseAnimDur = 0.3;
        const baseHold = 0.6;
        const spreadDelay = baseRingDelay / RIPPLE_SPEED;
        const animDuration = baseAnimDur / RIPPLE_SPEED;
        const holdTime = baseHold / RIPPLE_SPEED;

        const rings: Record<number, CubeData[]> = {};
        for (const cd of cubes) {
          const dist = Math.hypot(cd.row - rowHit, cd.col - colHit);
          const ring = Math.round(dist);
          if (!rings[ring]) rings[ring] = [];
          rings[ring].push(cd);
        }

        Object.keys(rings)
          .map(Number)
          .sort((a, b) => a - b)
          .forEach((ring) => {
            const delay = ring * spreadDelay;
            const ringCubes = rings[ring];
            const faces = ringCubes.flatMap((cd) => cd.allFaces);

            gsap.to(faces, {
              backgroundColor: RIPPLE_COLOR,
              duration: animDuration,
              delay,
              ease: "sine.inOut",
            });
            gsap.to(faces, {
              backgroundColor: FACE_COLOR,
              duration: animDuration,
              delay: delay + animDuration + holdTime,
              ease: "sine.inOut",
            });

            ringCubes.forEach((cd) => {
              gsap.delayedCall(delay, () => {
                const glow = cd.isTilted ? LINEN_GLOW : LINEN_GLOW_DIM;
                gsap.to(cd.allFaces, {
                  boxShadow: glow,
                  duration: animDuration,
                  ease: "sine.inOut",
                });
              });
              gsap.to(cd.allFaces, {
                boxShadow: NO_SHADOW,
                duration: animDuration * 1.5,
                delay: delay + animDuration + holdTime,
                ease: "sine.inOut",
              });

              gsap.delayedCall(delay, () => {
                cd.isRippling = true;
                if (cd.isTilted) activateAllFacesGlitch(cd);
                else activateFrontGlitch(cd);
              });
              gsap.delayedCall(delay + animDuration + holdTime * 0.7, () => {
                cd.isRippling = false;
                deactivateGlitch(cd, animDuration * 1.2);
              });
            });
          });
      }

      /* Corner sweep */
      const MARGIN = 0.18;
      const corners = [
        { x: MARGIN, y: MARGIN },
        { x: 1 - MARGIN, y: MARGIN },
        { x: 1 - MARGIN, y: 1 - MARGIN },
        { x: MARGIN, y: 1 - MARGIN },
      ];

      interface SweepSeg {
        from: { x: number; y: number };
        to: { x: number; y: number };
        dur: number;
        start: number;
        rippled: boolean;
      }

      let sweeps: SweepSeg[] = [];
      let sweepTotal = 0;

      function buildSweeps() {
        sweeps = [];
        sweepTotal = 0;
        let idx = 0;
        let dir = 1;
        const count = 30 + Math.floor(Math.random() * 15);
        for (let i = 0; i < count; i++) {
          const from = corners[idx];
          if (i > 0 && Math.random() < 0.3) dir = -dir;
          idx = (idx + dir + corners.length) % corners.length;
          const to = corners[idx];
          const dur = 1.8 + Math.random() * 2.0;
          sweeps.push({ from, to, dur, start: sweepTotal, rippled: false });
          sweepTotal += dur;
          const dwell = 0.8 + Math.random() * 0.6;
          sweeps.push({
            from: to,
            to,
            dur: dwell,
            start: sweepTotal,
            rippled: true,
          });
          sweepTotal += dwell;
        }
      }
      buildSweeps();

      function easeCS(t: number) {
        return 0.5 - 0.5 * Math.cos(t * Math.PI);
      }

      function getSweepPos(time: number) {
        const t = time % sweepTotal;
        let lo = 0;
        let hi = sweeps.length - 1;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (sweeps[mid].start + sweeps[mid].dur < t) lo = mid + 1;
          else hi = mid;
        }
        const s = sweeps[lo];
        const progress = easeCS((t - s.start) / s.dur);

        if (progress > 0.95 && !s.rippled) {
          s.rippled = true;
          const rippleCol = Math.round(s.to.x * (GRID_SIZE - 1));
          const rippleRow = Math.round(s.to.y * (GRID_SIZE - 1));
          triggerRipple(rippleCol, rippleRow);
        }

        return {
          x: s.from.x + (s.to.x - s.from.x) * progress,
          y: s.from.y + (s.to.y - s.from.y) * progress,
        };
      }

      const focusCur = { x: corners[0].x, y: corners[0].y };
      let sweepCycle = 0;
      const t0 = performance.now();
      let wasPaused = false;

      function animate(ts: number) {
        if (destroyed) return;
        rafRef.current = requestAnimationFrame(animate);

        if (!activeRef.current) {
          if (!wasPaused) {
            pausedAtRef.current = ts;
            wasPaused = true;
            glitch.setPaused(true);
          }
          return; // skip all GSAP / tilt work
        }

        if (wasPaused) {
          resumeOffsetRef.current += ts - pausedAtRef.current;
          wasPaused = false;
          glitch.setPaused(false);
        }

        const elapsed = (ts - t0 - resumeOffsetRef.current) * 0.001;
        if (elapsed > sweepCycle + sweepTotal) {
          sweepCycle += sweepTotal;
          buildSweeps();
        }
        const pos = getSweepPos(elapsed - sweepCycle);
        focusCur.x += (pos.x - focusCur.x) * 0.08;
        focusCur.y += (pos.y - focusCur.y) * 0.08;
        tiltAt(focusCur.y * (GRID_SIZE - 1), focusCur.x * (GRID_SIZE - 1));
      }

      rafRef.current = requestAnimationFrame(animate);

      /* Cleanup stored for unmount */
      (scene as any).__cubesCleanup = () => {
        destroyed = true;
        cancelAnimationFrame(rafRef.current);
        glitch.destroy();
      };
    });

    return () => {
      (scene as any).__cubesCleanup?.();
    };
  }, []);

  useEffect(() => {
    const cleanup = init();
    return () => cleanup?.();
  }, [init]);

  return (
    <div style={styles.root}>
      {/* Grain */}
      <div style={styles.grain} />

      {/* Cubes grid */}
      <div style={styles.cubesWrapper}>
        <div
          ref={sceneRef}
          style={{
            display: "grid",
            width: "100%",
            height: "100%",
            columnGap: "5%",
            rowGap: "5%",
            perspective: "99999999px",
            gridAutoRows: "1fr",
          }}
        />
      </div>

      {/* Card overlay */}
      <div className="cube-card-glow" style={styles.card}>
        <div style={styles.eyebrow}>
          Full-stack · integrated · engineered
        </div>
        <h1 style={styles.headline}>
          In the{" "}
          <em style={{ fontStyle: "italic", color: "#A86040" }}>engine room</em>
          <br />
          <span style={{ color: "rgba(245,239,224,0.4)" }}>of the</span>{" "}
          new web.
        </h1>
        <div style={styles.heroRule} />
        <p style={styles.sub}>
          Your website catches the lead. Your CRM follows up automatically.
          Your analytics show exactly which channel paid for itself. Every
          layer connected, nothing duct-taped. That&apos;s what Labs means.
        </p>

        {/* Stack labels */}
        <div style={styles.stackRow}>
          {[
            "Website",
            "CRM",
            "Attribution",
            "Analytics",
            "Automation",
            "GEO",
          ].map((item, i) => (
            <span key={item} style={styles.stackItem}>
              {item}
              {i < 5 && (
                <span style={styles.stackArrow}>→</span>
              )}
            </span>
          ))}
        </div>

        <div style={styles.ctaRow}>
          <a
            href="/services"
            style={styles.ctaPrimary}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(168,96,64,0.15)";
              e.currentTarget.style.borderColor = "#A86040";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(23,18,16,0.7)";
              e.currentTarget.style.borderColor = "rgba(168,96,64,0.4)";
            }}
          >
            See the full stack
          </a>
          <a
            href="/process"
            style={styles.ctaSecondary}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(245,239,224,0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(245,239,224,0.3)";
            }}
          >
            How integration works →
          </a>
        </div>
      </div>

      {/* Portfolio label */}
      <div className="hero-config-label" style={styles.configLabel}>
        Built by Engenium Labs &bull; CSS 3D &bull; GSAP &bull; Canvas
        glitch engine &bull; This page is the portfolio
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
    background: "#0c0a08",
    color: "#F5EFE0",
    WebkitFontSmoothing: "antialiased",
  },

  grain: {
    position: "absolute",
    inset: 0,
    zIndex: 200,
    opacity: 0.25,
    mixBlendMode: "overlay" as const,
    pointerEvents: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    backgroundSize: "160px 160px",
  },

  cubesWrapper: {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 50,
    maxWidth: "520px",
    width: "88%",
    padding: "2.8rem 3rem",
    background: "rgba(23, 18, 16, 0.93)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(80,126,120,0.22)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center" as const,
    pointerEvents: "auto",
    userSelect: "text" as const,
  },

  eyebrow: {
    fontFamily: "var(--font-jetbrains), monospace",
    fontWeight: 300,
    fontSize: "0.8rem",
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
    color: "#507E78",
    opacity: 1,
    marginBottom: "1.4rem",
  },

  headline: {
    fontFamily: "var(--font-cormorant), serif",
    fontWeight: 300,
    fontSize: "clamp(2.4rem, 5.5vw, 4.2rem)",
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    marginBottom: "1.4rem",
    color: "#F5EFE0",
  },

  heroRule: {
    width: "clamp(60px, 10vw, 120px)",
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, rgba(80,126,120,0.25), transparent)",
  },

  sub: {
    fontFamily: "var(--font-dm-sans), sans-serif",
    fontWeight: 300,
    fontSize: "clamp(0.9rem, 1.4vw, 1.1rem)",
    lineHeight: 1.65,
    maxWidth: "44ch",
    opacity: 0.65,
    marginBottom: "2rem",
    color: "#F5EFE0",
  },

  stackRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    justifyContent: "center",
    alignItems: "center",
    gap: "0.2rem",
    marginBottom: "2rem",
    pointerEvents: "auto" as const,
  },

  stackItem: {
    fontFamily: "var(--font-jetbrains), monospace",
    fontWeight: 300,
    fontSize: "0.7rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "rgba(245,239,224,0.8)",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.2rem",
  },

  stackArrow: {
    color: "rgba(80,126,120,0.75)",
    fontSize: "0.8rem",
    marginLeft: "0.15rem",
  },

  ctaRow: {
    display: "flex",
    gap: "1rem",
    pointerEvents: "auto" as const,
    flexWrap: "wrap" as const,
    justifyContent: "center",
  },

  ctaPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.8rem 2rem",
    border: "1px solid rgba(168,96,64,0.4)",
    background: "rgba(23,18,16,0.7)",
    backdropFilter: "blur(12px)",
    color: "#F5EFE0",
    fontFamily: "var(--font-dm-sans), sans-serif",
    fontWeight: 400,
    fontSize: "0.85rem",
    letterSpacing: "0.03em",
    textDecoration: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  ctaSecondary: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.8rem 1.5rem",
    border: "none",
    background: "transparent",
    color: "rgba(245,239,224,0.3)",
    fontFamily: "var(--font-dm-sans), sans-serif",
    fontWeight: 300,
    fontSize: "0.85rem",
    textDecoration: "none",
    cursor: "pointer",
    transition: "color 0.3s ease",
  },

  statsRow: {
    position: "absolute",
    bottom: "3rem",
    left: 0,
    right: 0,
    zIndex: 50,
    display: "flex",
    justifyContent: "center",
    gap: "clamp(2rem, 5vw, 4rem)",
    pointerEvents: "none",
  },

  statValue: {
    fontFamily: "var(--font-cormorant), serif",
    fontWeight: 600,
    fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
    color: "#A86040",
    lineHeight: 1,
    marginBottom: "0.3rem",
  },

  statLabel: {
    fontFamily: "var(--font-jetbrains), monospace",
    fontWeight: 300,
    fontSize: "0.7rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    opacity: 0.7,
    color: "#F5EFE0",
  },

  configLabel: {
    position: "absolute",
    bottom: "0.8rem",
    left: "50%",
    transform: "translateX(-50%)",
    fontFamily: "var(--font-jetbrains), monospace",
    fontWeight: 300,
    fontSize: "0.7rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    opacity: 0.6,
    zIndex: 50,
    whiteSpace: "nowrap",
    color: "#F5EFE0",
  },
};
