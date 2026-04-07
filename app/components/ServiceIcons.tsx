"use client";

/* ═══════════════════════════════════════
   Service Icons — Custom SVGs
   Engenium brand palette:
     verdigris #507E78
     aged-clay #A86040
     warm-linen #F5EFE0
   ═══════════════════════════════════════ */

interface IconProps {
  size?: number;
  className?: string;
}

const defaults = { size: 48 };

/* ── GEO / SEO — magnifying glass with AI spark ── */
export function IconSearch({ size = defaults.size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="20" cy="20" r="12" stroke="#507E78" strokeWidth="1.5" opacity="0.6" />
      <line x1="29" y1="29" x2="40" y2="40" stroke="#507E78" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M18 14 L20 18 L22 14 L20 16 Z" fill="#A86040" opacity="0.8" />
      <circle cx="20" cy="20" r="5" stroke="#507E78" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.35" />
    </svg>
  );
}

/* ── Analytics & Attribution — bar chart with connecting nodes ── */
export function IconAnalytics({ size = defaults.size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <rect x="6" y="28" width="6" height="14" rx="1" fill="#507E78" opacity="0.25" />
      <rect x="16" y="20" width="6" height="22" rx="1" fill="#507E78" opacity="0.4" />
      <rect x="26" y="12" width="6" height="30" rx="1" fill="#507E78" opacity="0.55" />
      <rect x="36" y="6" width="6" height="36" rx="1" fill="#507E78" opacity="0.7" />
      <circle cx="9" cy="26" r="2" fill="#A86040" opacity="0.9" />
      <circle cx="19" cy="18" r="2" fill="#A86040" opacity="0.9" />
      <circle cx="29" cy="10" r="2" fill="#A86040" opacity="0.9" />
      <circle cx="39" cy="4" r="2" fill="#A86040" opacity="0.9" />
      <polyline points="9,26 19,18 29,10 39,4" stroke="#A86040" strokeWidth="0.75" opacity="0.5" />
    </svg>
  );
}

/* ── Full-Stack Web — layered browser window ── */
export function IconWeb({ size = defaults.size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Back layer */}
      <rect x="8" y="4" width="32" height="24" rx="3" stroke="#507E78" strokeWidth="0.75" opacity="0.25" />
      {/* Front browser */}
      <rect x="4" y="12" width="40" height="30" rx="3" stroke="#507E78" strokeWidth="1.5" opacity="0.6" />
      <line x1="4" y1="20" x2="44" y2="20" stroke="#507E78" strokeWidth="0.75" opacity="0.3" />
      <circle cx="10" cy="16" r="1.5" fill="#A86040" opacity="0.7" />
      <circle cx="16" cy="16" r="1.5" fill="#507E78" opacity="0.4" />
      <circle cx="22" cy="16" r="1.5" fill="#507E78" opacity="0.4" />
      {/* Content lines */}
      <rect x="10" y="25" width="18" height="2" rx="1" fill="#507E78" opacity="0.3" />
      <rect x="10" y="30" width="12" height="2" rx="1" fill="#507E78" opacity="0.2" />
      <rect x="10" y="35" width="24" height="2" rx="1" fill="#507E78" opacity="0.15" />
    </svg>
  );
}

/* ── Platform & Automation — interlocking gears / workflow ── */
export function IconPlatform({ size = defaults.size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Main gear */}
      <circle cx="18" cy="20" r="8" stroke="#507E78" strokeWidth="1.5" opacity="0.5" />
      <circle cx="18" cy="20" r="3" fill="#507E78" opacity="0.3" />
      {/* Gear teeth (simplified as notches) */}
      <line x1="18" y1="10" x2="18" y2="13" stroke="#507E78" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="18" y1="27" x2="18" y2="30" stroke="#507E78" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="8" y1="20" x2="11" y2="20" stroke="#507E78" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="25" y1="20" x2="28" y2="20" stroke="#507E78" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      {/* Secondary gear */}
      <circle cx="34" cy="30" r="6" stroke="#A86040" strokeWidth="1" opacity="0.5" />
      <circle cx="34" cy="30" r="2" fill="#A86040" opacity="0.3" />
      {/* Connection */}
      <line x1="25" y1="26" x2="29" y2="28" stroke="#507E78" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  );
}

/* ── Marketing Strategy — target with compass arrow ── */
export function IconStrategy({ size = defaults.size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="16" stroke="#507E78" strokeWidth="0.75" opacity="0.25" />
      <circle cx="24" cy="24" r="10" stroke="#507E78" strokeWidth="1" opacity="0.4" />
      <circle cx="24" cy="24" r="4" stroke="#507E78" strokeWidth="1.5" opacity="0.6" />
      <circle cx="24" cy="24" r="1.5" fill="#A86040" opacity="0.9" />
      {/* Arrow pointing to center */}
      <line x1="38" y1="10" x2="27" y2="21" stroke="#A86040" strokeWidth="1" opacity="0.6" />
      <polyline points="38,10 34,11 37,14" stroke="#A86040" strokeWidth="1" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

/* ── 3D & Interactive — wireframe cube ── */
export function IconImmersive({ size = defaults.size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Front face */}
      <path d="M12 16 L24 10 L36 16 L36 32 L24 38 L12 32 Z" stroke="#507E78" strokeWidth="1.5" opacity="0.5" />
      {/* Middle divider */}
      <line x1="24" y1="10" x2="24" y2="38" stroke="#507E78" strokeWidth="0.75" opacity="0.3" />
      {/* Inner edges */}
      <line x1="12" y1="16" x2="24" y2="22" stroke="#507E78" strokeWidth="0.75" opacity="0.3" />
      <line x1="36" y1="16" x2="24" y2="22" stroke="#507E78" strokeWidth="0.75" opacity="0.3" />
      <line x1="24" y1="22" x2="24" y2="38" stroke="#507E78" strokeWidth="0.75" opacity="0.4" />
      {/* Highlight vertex */}
      <circle cx="24" cy="10" r="2" fill="#A86040" opacity="0.7" />
      <circle cx="12" cy="16" r="1.5" fill="#507E78" opacity="0.5" />
      <circle cx="36" cy="16" r="1.5" fill="#507E78" opacity="0.5" />
    </svg>
  );
}
