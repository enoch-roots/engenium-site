"use client";

import { useEffect, useRef, useCallback } from "react";
import { useOpenAudit } from "./AuditModalContext";

/* ── Config ─────────────────────────────────────────────────── */
const COLORS: [number, number, number][] = [
  [168 / 255, 96 / 255, 64 / 255], // #A86040 Aged Clay
  [80 / 255, 126 / 255, 120 / 255], // #507E78 Verdigris
];
const COLOR_COUNT = 2;
const ANGLE = 0;
const NOISE = 0.18;
const BLIND_COUNT = 12;
const BLIND_MIN_W = 110;
const SPOT_RADIUS = 0.5;
const SPOT_SOFT = 1.0;
const SPOT_OPACITY = 1.0;
const DISTORT = 34.0;
const DISTORT_MOBILE = 150.0;
const MOBILE_BREAKPOINT = 768;
const SHINE_FLIP = 0.0;

/* Pad to 8 for the shader */
while (COLORS.length < 8) COLORS.push(COLORS[COLORS.length - 1]);

/* ── Shaders ────────────────────────────────────────────────── */
const VERT = `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAG = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  uniform vec3 iResolution;
  uniform vec2 iMouse;
  uniform float iTime;

  uniform float uAngle;
  uniform float uNoise;
  uniform float uBlindCount;
  uniform float uSpotlightRadius;
  uniform float uSpotlightSoftness;
  uniform float uSpotlightOpacity;
  uniform float uMirror;
  uniform float uDistort;
  uniform float uShineFlip;
  uniform vec3 uColor0;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform vec3 uColor5;
  uniform vec3 uColor6;
  uniform vec3 uColor7;
  uniform int uColorCount;

  varying vec2 vUv;

  float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
  }

  vec2 rotate2D(vec2 p, float a){
    float c = cos(a);
    float s = sin(a);
    return mat2(c, -s, s, c) * p;
  }

  vec3 getGradientColor(float t){
    float tt = clamp(t, 0.0, 1.0);
    int count = uColorCount;
    if (count < 2) count = 2;
    float scaled = tt * float(count - 1);
    float seg = floor(scaled);
    float f = fract(scaled);

    if (seg < 1.0) return mix(uColor0, uColor1, f);
    if (seg < 2.0 && count > 2) return mix(uColor1, uColor2, f);
    if (seg < 3.0 && count > 3) return mix(uColor2, uColor3, f);
    if (seg < 4.0 && count > 4) return mix(uColor3, uColor4, f);
    if (seg < 5.0 && count > 5) return mix(uColor4, uColor5, f);
    if (seg < 6.0 && count > 6) return mix(uColor5, uColor6, f);
    if (seg < 7.0 && count > 7) return mix(uColor6, uColor7, f);
    if (count > 7) return uColor7;
    if (count > 6) return uColor6;
    if (count > 5) return uColor5;
    if (count > 4) return uColor4;
    if (count > 3) return uColor3;
    if (count > 2) return uColor2;
    return uColor1;
  }

  void main(){
    vec2 uv0 = vUv;
    float aspect = iResolution.x / iResolution.y;
    vec2 p = uv0 * 2.0 - 1.0;
    p.x *= aspect;
    vec2 pr = rotate2D(p, uAngle);
    pr.x /= aspect;
    vec2 uv = pr * 0.5 + 0.5;

    vec2 uvMod = uv;
    if (uDistort > 0.0) {
      float a = uvMod.y * 6.0;
      float b = uvMod.x * 6.0;
      float w = 0.01 * uDistort;
      uvMod.x += sin(a) * w;
      uvMod.y += cos(b) * w;
    }
    float t = uvMod.x;
    if (uMirror > 0.5) {
      t = 1.0 - abs(1.0 - 2.0 * fract(t));
    }
    vec3 base = getGradientColor(t);

    vec2 offset = vec2(iMouse.x/iResolution.x, iMouse.y/iResolution.y);
    float d = length(uv0 - offset);
    float r = max(uSpotlightRadius, 1e-4);
    float dn = d / r;
    float spot = (1.0 - 2.0 * pow(dn, uSpotlightSoftness)) * uSpotlightOpacity;
    vec3 cir = vec3(spot);
    float stripe = fract(uvMod.x * max(uBlindCount, 1.0));
    if (uShineFlip > 0.5) stripe = 1.0 - stripe;
    vec3 ran = vec3(stripe);

    vec3 col = cir + base - ran;
    col += (rand(gl_FragCoord.xy + iTime) - 0.5) * uNoise;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ── Helpers ────────────────────────────────────────────────── */
function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  src: string,
): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

/* ── Corner sweep animation ─────────────────────────────────── */
interface Sweep {
  from: { x: number; y: number };
  to: { x: number; y: number };
  dur: number;
  start: number;
}

const MARGIN = 0.08;
const CORNERS = [
  { x: MARGIN, y: MARGIN },
  { x: 1 - MARGIN, y: MARGIN },
  { x: 1 - MARGIN, y: 1 - MARGIN },
  { x: MARGIN, y: 1 - MARGIN },
];

function buildSweeps(): { sweeps: Sweep[]; total: number } {
  const sweeps: Sweep[] = [];
  let total = 0;
  let idx = 0;
  let dir = 1;
  const count = 30 + Math.floor(Math.random() * 15);

  for (let i = 0; i < count; i++) {
    const from = CORNERS[idx];
    if (i > 0 && Math.random() < 0.3) dir = -dir;
    idx = (idx + dir + CORNERS.length) % CORNERS.length;
    const to = CORNERS[idx];
    const dur = 1.8 + Math.random() * 2.0;
    sweeps.push({ from, to, dur, start: total });
    total += dur;
  }

  return { sweeps, total };
}

function ease(t: number) {
  return 0.5 - 0.5 * Math.cos(t * Math.PI);
}

function getSweepPos(
  sweeps: Sweep[],
  total: number,
  time: number,
): { x: number; y: number } {
  const t = time % total;
  let lo = 0;
  let hi = sweeps.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sweeps[mid].start + sweeps[mid].dur < t) lo = mid + 1;
    else hi = mid;
  }
  const s = sweeps[lo];
  const progress = ease((t - s.start) / s.dur);
  return {
    x: s.from.x + (s.to.x - s.from.x) * progress,
    y: s.from.y + (s.to.y - s.from.y) * progress,
  };
}

/* ── Component ──────────────────────────────────────────────── */
interface GradientBlindsHeroProps {
  active?: boolean;
}

export default function GradientBlindsHero({
  active = true,
}: GradientBlindsHeroProps) {
  const openAudit = useOpenAudit();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const activeRef = useRef(active);
  const pausedAtRef = useRef<number>(0); // tracks elapsed time when paused
  const resumeOffsetRef = useRef<number>(0); // accumulated pause duration
  activeRef.current = active;

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    /* Fullscreen quad */
    const vertData = new Float32Array([
      -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1,
    ]);
    const indices = new Uint16Array([0, 1, 2, 2, 1, 3]);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertData, gl.STATIC_DRAW);

    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, "position");
    const aUv = gl.getAttribLocation(prog, "uv");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

    /* Uniform locations */
    const u: Record<string, WebGLUniformLocation | null> = {};
    const uNames = [
      "iResolution",
      "iMouse",
      "iTime",
      "uAngle",
      "uNoise",
      "uBlindCount",
      "uSpotlightRadius",
      "uSpotlightSoftness",
      "uSpotlightOpacity",
      "uMirror",
      "uDistort",
      "uShineFlip",
      "uColor0",
      "uColor1",
      "uColor2",
      "uColor3",
      "uColor4",
      "uColor5",
      "uColor6",
      "uColor7",
      "uColorCount",
    ];
    uNames.forEach((n) => (u[n] = gl.getUniformLocation(prog, n)));

    /* Static uniforms */
    gl.uniform1f(u.uAngle!, (ANGLE * Math.PI) / 180);
    gl.uniform1f(u.uNoise!, NOISE);
    gl.uniform1f(u.uSpotlightRadius!, SPOT_RADIUS);
    gl.uniform1f(u.uSpotlightSoftness!, SPOT_SOFT);
    gl.uniform1f(u.uSpotlightOpacity!, SPOT_OPACITY);
    gl.uniform1f(u.uMirror!, 0.0);
    gl.uniform1f(
      u.uDistort!,
      window.innerWidth <= MOBILE_BREAKPOINT ? DISTORT_MOBILE : DISTORT,
    );
    gl.uniform1f(u.uShineFlip!, SHINE_FLIP);
    gl.uniform1i(u.uColorCount!, COLOR_COUNT);

    for (let i = 0; i < 8; i++) {
      gl.uniform3fv(u["uColor" + i]!, COLORS[i]);
    }

    /* State */
    let canvasW = 1;
    let canvasH = 1;
    let spotX = 0;
    let spotY = 0;

    /* Resize */
    function resize() {
      const parent = canvas!.parentElement;
      const w = parent?.clientWidth || window.innerWidth;
      const h = parent?.clientHeight || window.innerHeight;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      canvasW = canvas!.width;
      canvasH = canvas!.height;
      gl!.viewport(0, 0, canvasW, canvasH);
      gl!.uniform3f(u.iResolution!, canvasW, canvasH, 1.0);

      const maxByMinWidth = Math.max(1, Math.floor(w / BLIND_MIN_W));
      const effective = Math.min(BLIND_COUNT, maxByMinWidth);
      gl!.uniform1f(u.uBlindCount!, Math.max(1, effective));

      /* Higher distortion on mobile for more visual movement */
      gl!.uniform1f(
        u.uDistort!,
        w <= MOBILE_BREAKPOINT ? DISTORT_MOBILE : DISTORT,
      );
    }

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    resize();

    /* Sweep animation */
    let sweep = buildSweeps();
    let sweepCycle = 0;

    spotX = CORNERS[0].x * canvasW;
    spotY = CORNERS[0].y * canvasH;
    gl.uniform2f(u.iMouse!, spotX, spotY);

    /* Render loop — pauses when section is off-screen */
    const t0 = performance.now();
    let wasPaused = false;

    function render(ts: number) {
      rafRef.current = requestAnimationFrame(render);

      if (!activeRef.current) {
        if (!wasPaused) {
          pausedAtRef.current = ts;
          wasPaused = true;
        }
        return; // skip GL work entirely
      }

      if (wasPaused) {
        resumeOffsetRef.current += ts - pausedAtRef.current;
        wasPaused = false;
      }

      const elapsed = (ts - t0 - resumeOffsetRef.current) * 0.001;
      gl!.uniform1f(u.iTime!, elapsed);

      if (elapsed > sweepCycle + sweep.total) {
        sweepCycle += sweep.total;
        sweep = buildSweeps();
      }

      const pos = getSweepPos(sweep.sweeps, sweep.total, elapsed - sweepCycle);
      const tx = pos.x * canvasW;
      const ty = pos.y * canvasH;
      spotX += (tx - spotX) * 0.08;
      spotY += (ty - spotY) * 0.08;
      gl!.uniform2f(u.iMouse!, spotX, spotY);

      gl!.drawElements(gl!.TRIANGLES, 6, gl!.UNSIGNED_SHORT, 0);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(vbo);
      gl.deleteBuffer(ibo);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const cleanup = initWebGL();
    return () => cleanup?.();
  }, [initWebGL]);

  return (
    <div style={styles.root}>
      {/* Nighty Night background */}
      <div style={styles.bgNighty}>
        <div style={styles.plane} />
        <div style={styles.horizonGlow} />
      </div>

      {/* WebGL blinds canvas */}
      <div style={styles.blindsWrapper}>
        <canvas
          ref={canvasRef}
          style={{
            ...styles.canvas,
            animation: "gbFadeIn 2s ease-out 0.3s forwards",
          }}
        />
      </div>

      {/* Grain */}
      <div style={styles.grain} />

      {/* Copy overlay */}
      <div style={styles.copyOverlay}>
        <div style={styles.eyebrow}>The Window Is Open</div>
        <h1
          style={styles.headline}
          dangerouslySetInnerHTML={{
            __html: `Most businesses aren't in AI answers <span style="color:#507E78">yet.</span><br><em style="font-style:italic;color:#A86040">That's a window.</em>`,
          }}
        />
        <p style={styles.subline}>
          People aren&apos;t just Googling anymore. They&apos;re asking ChatGPT,
          Perplexity, Gemini, and Claude. The businesses that show up in those
          answers are staking their claim in the new search landscape. That
          window won&apos;t stay open forever.
        </p>
        <div style={styles.ctaRow}>
          <button
            type="button"
            onClick={openAudit}
            style={styles.ctaPrimary}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#A86040";
              e.currentTarget.style.color = "#F5EFE0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#F5EFE0";
              e.currentTarget.style.color = "#171210";
            }}
          >
            Get your free visibility audit
          </button>
          <a
            href="/services"
            style={styles.ctaSecondary}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#507E78";
              e.currentTarget.style.color = "#507E78";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(245,239,224,0.15)";
              e.currentTarget.style.color = "rgba(245,239,224,0.55)";
            }}
          >
            See how it works
          </a>
        </div>
      </div>

      {/* Portfolio label */}
      <div className="hero-config-label" style={styles.configLabel}>
        Built by Engenium Labs &bull; WebGL &bull; GLSL shaders &bull;
        Autonomous animation
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
    top: "-20%",
    left: "-50%",
    background: `linear-gradient(
      -60deg,
      rgba(80,126,120,0.12) 0%,
      rgba(23,18,16,0.6) 35%,
      rgba(168,96,64,0.08) 55%,
      rgba(23,18,16,0.9) 100%
    )`,
    transform: "perspective(800px) rotateX(55deg)",
    transformOrigin: "center center",
    animation: "nightDrift 18s ease-in-out infinite alternate",
  },
  horizonGlow: {
    position: "absolute",
    bottom: "40%",
    left: 0,
    right: 0,
    height: "30%",
    background: `radial-gradient(
      ellipse 120% 80% at 50% 100%,
      rgba(168,96,64,0.06) 0%,
      transparent 70%
    )`,
  },

  /* Blinds canvas */
  blindsWrapper: {
    position: "absolute",
    inset: 0,
    zIndex: 5,
    overflow: "hidden",
  },
  canvas: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    display: "block",
    opacity: 0,
    mixBlendMode: "lighten" as const,
  },

  /* Grain */
  grain: {
    position: "absolute",
    inset: 0,
    zIndex: 200,
    opacity: 0.22,
    mixBlendMode: "overlay" as const,
    pointerEvents: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    backgroundSize: "160px 160px",
  },

  /* Corner label */
  cornerLabel: {
    position: "absolute",
    top: "3rem",
    right: "4vw",
    zIndex: 60,
    fontFamily: "var(--font-jetbrains), monospace",
    fontWeight: 300,
    fontSize: "0.7rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: "rgba(245,239,224,0.75)",
    animation: "gbFadeUp 1s ease-out 2s forwards",
    opacity: 0,
  },

  /* Copy overlay */
  copyOverlay: {
    position: "absolute",
    inset: 0,
    zIndex: 50,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "0 6vw",
    pointerEvents: "auto",
    userSelect: "text" as const,
  },

  eyebrow: {
    fontFamily: "var(--font-jetbrains), monospace",
    fontWeight: 300,
    fontSize: "0.7rem",
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
    color: "#507E78",
    marginBottom: "1.6rem",
    opacity: 0,
    animation: "gbFadeUp 1s ease-out 0.4s forwards",
  },

  headline: {
    fontFamily: "var(--font-cormorant), serif",
    fontWeight: 300,
    fontSize: "clamp(2.6rem, 5.5vw, 5rem)",
    lineHeight: 1.15,
    textAlign: "center" as const,
    letterSpacing: "-0.01em",
    maxWidth: "20ch",
    marginBottom: "1.4rem",
    color: "#F5EFE0",
    opacity: 0,
    animation: "gbFadeUp 1.2s ease-out 0.7s forwards",
  },

  subline: {
    fontFamily: "var(--font-dm-sans), sans-serif",
    fontWeight: 300,
    fontSize: "clamp(0.9rem, 1.3vw, 1.15rem)",
    lineHeight: 1.6,
    textAlign: "center" as const,
    letterSpacing: "0.03em",
    color: "rgba(245,239,224,0.55)",
    maxWidth: "44ch",
    opacity: 0,
    animation: "gbFadeUp 1s ease-out 1.2s forwards",
  },

  ctaRow: {
    display: "flex",
    gap: "1.2rem",
    marginTop: "2.4rem",
    opacity: 0,
    animation: "gbFadeUp 1s ease-out 1.6s forwards",
    pointerEvents: "auto" as const,
  },

  ctaPrimary: {
    fontFamily: "var(--font-dm-sans), sans-serif",
    fontWeight: 400,
    fontSize: "0.85rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color: "#171210",
    background: "#F5EFE0",
    border: "none",
    padding: "0.75rem 2rem",
    textDecoration: "none",
    cursor: "pointer",
    transition: "background 0.3s ease, color 0.3s ease",
  },

  ctaSecondary: {
    fontFamily: "var(--font-dm-sans), sans-serif",
    fontWeight: 300,
    fontSize: "0.85rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color: "rgba(245,239,224,0.55)",
    background: "transparent",
    border: "1px solid rgba(245,239,224,0.15)",
    padding: "0.75rem 2rem",
    textDecoration: "none",
    cursor: "pointer",
    transition: "border-color 0.3s ease, color 0.3s ease",
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
