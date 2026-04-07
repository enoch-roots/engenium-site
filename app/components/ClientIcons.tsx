"use client";

/* ═══════════════════════════════════════
   Client Profile Icons — Custom SVGs
   Engenium brand palette:
     verdigris #507E78
     aged-clay #A86040
     warm-linen #F5EFE0

   Each icon communicates an occupational
   identity — the visitor should see the
   icon and think "that's my world."
   ═══════════════════════════════════════ */

interface IconProps {
  size?: number;
  className?: string;
}

const defaults = { size: 48 };

/* ── Local Service Pro — roofline + wrench ── */
export function IconServicePro({ size = defaults.size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Roof */}
      <path d="M6 24 L24 8 L42 24" stroke="#507E78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      {/* House body */}
      <rect x="12" y="24" width="24" height="16" rx="1" stroke="#507E78" strokeWidth="1" opacity="0.3" />
      {/* Door */}
      <rect x="20" y="30" width="8" height="10" rx="1" stroke="#507E78" strokeWidth="0.75" opacity="0.25" />
      {/* Wrench */}
      <path d="M33 16 L38 11" stroke="#A86040" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <circle cx="39.5" cy="9.5" r="2.5" stroke="#A86040" strokeWidth="1" opacity="0.6" />
      <circle cx="39.5" cy="9.5" r="0.8" fill="#A86040" opacity="0.5" />
      {/* Window */}
      <rect x="15" y="27" width="4" height="4" rx="0.5" fill="#507E78" opacity="0.15" />
    </svg>
  );
}

/* ── Growing Operator — building with upward arrows ── */
export function IconGrowingOp({ size = defaults.size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Building base */}
      <rect x="10" y="18" width="18" height="24" rx="2" stroke="#507E78" strokeWidth="1.5" opacity="0.5" />
      {/* Building windows */}
      <rect x="14" y="22" width="4" height="3" rx="0.5" fill="#507E78" opacity="0.2" />
      <rect x="20" y="22" width="4" height="3" rx="0.5" fill="#507E78" opacity="0.2" />
      <rect x="14" y="28" width="4" height="3" rx="0.5" fill="#507E78" opacity="0.2" />
      <rect x="20" y="28" width="4" height="3" rx="0.5" fill="#507E78" opacity="0.2" />
      <rect x="14" y="34" width="4" height="3" rx="0.5" fill="#507E78" opacity="0.15" />
      <rect x="20" y="34" width="4" height="3" rx="0.5" fill="#507E78" opacity="0.15" />
      {/* Growth arrow */}
      <line x1="34" y1="38" x2="34" y2="14" stroke="#A86040" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <polyline points="30,18 34,14 38,18" stroke="#A86040" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      {/* Secondary arrow (momentum) */}
      <line x1="40" y1="38" x2="40" y2="22" stroke="#A86040" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
      <polyline points="37,25 40,22 43,25" stroke="#A86040" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
    </svg>
  );
}

/* ── Professional Services — shield with credential mark ── */
export function IconProfessional({ size = defaults.size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Shield */}
      <path
        d="M24 4 L40 12 L40 26 C40 34 33 40 24 44 C15 40 8 34 8 26 L8 12 Z"
        stroke="#507E78" strokeWidth="1.5" opacity="0.5" fill="none"
      />
      {/* Inner shield line */}
      <path
        d="M24 10 L34 16 L34 26 C34 31 30 36 24 39 C18 36 14 31 14 26 L14 16 Z"
        stroke="#507E78" strokeWidth="0.75" opacity="0.2" fill="none"
      />
      {/* Credential check */}
      <polyline points="18,24 22,28 30,18" stroke="#A86040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </svg>
  );
}

/* ── Real Estate & Financial — key + document ── */
export function IconRealEstate({ size = defaults.size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Document */}
      <rect x="14" y="6" width="20" height="28" rx="2" stroke="#507E78" strokeWidth="1.5" opacity="0.5" />
      <line x1="18" y1="13" x2="30" y2="13" stroke="#507E78" strokeWidth="0.75" opacity="0.25" />
      <line x1="18" y1="17" x2="28" y2="17" stroke="#507E78" strokeWidth="0.75" opacity="0.2" />
      <line x1="18" y1="21" x2="26" y2="21" stroke="#507E78" strokeWidth="0.75" opacity="0.15" />
      {/* Dollar sign / financial symbol */}
      <circle cx="30" cy="30" r="2.5" stroke="#507E78" strokeWidth="0.75" opacity="0.3" />
      {/* Key */}
      <circle cx="16" cy="38" r="4" stroke="#A86040" strokeWidth="1.5" opacity="0.6" />
      <circle cx="16" cy="38" r="1.5" fill="none" stroke="#A86040" strokeWidth="0.75" opacity="0.4" />
      <line x1="20" y1="38" x2="32" y2="38" stroke="#A86040" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="28" y1="38" x2="28" y2="42" stroke="#A86040" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <line x1="32" y1="38" x2="32" y2="42" stroke="#A86040" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/* ── Multi-Location / Franchise — connected nodes ── */
export function IconMultiLocation({ size = defaults.size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Central hub */}
      <circle cx="24" cy="24" r="5" stroke="#507E78" strokeWidth="1.5" opacity="0.6" />
      <circle cx="24" cy="24" r="2" fill="#507E78" opacity="0.3" />
      {/* Satellite nodes */}
      <circle cx="10" cy="12" r="3.5" stroke="#507E78" strokeWidth="1" opacity="0.4" />
      <circle cx="10" cy="12" r="1.2" fill="#A86040" opacity="0.7" />
      <circle cx="38" cy="12" r="3.5" stroke="#507E78" strokeWidth="1" opacity="0.4" />
      <circle cx="38" cy="12" r="1.2" fill="#A86040" opacity="0.7" />
      <circle cx="10" cy="36" r="3.5" stroke="#507E78" strokeWidth="1" opacity="0.4" />
      <circle cx="10" cy="36" r="1.2" fill="#A86040" opacity="0.7" />
      <circle cx="38" cy="36" r="3.5" stroke="#507E78" strokeWidth="1" opacity="0.4" />
      <circle cx="38" cy="36" r="1.2" fill="#A86040" opacity="0.7" />
      {/* Connection lines */}
      <line x1="13" y1="14" x2="20" y2="21" stroke="#507E78" strokeWidth="0.75" strokeDasharray="3 2" opacity="0.3" />
      <line x1="35" y1="14" x2="28" y2="21" stroke="#507E78" strokeWidth="0.75" strokeDasharray="3 2" opacity="0.3" />
      <line x1="13" y1="34" x2="20" y2="27" stroke="#507E78" strokeWidth="0.75" strokeDasharray="3 2" opacity="0.3" />
      <line x1="35" y1="34" x2="28" y2="27" stroke="#507E78" strokeWidth="0.75" strokeDasharray="3 2" opacity="0.3" />
    </svg>
  );
}

/* ── Solopreneur / Personal Brand — person with creative spark ── */
export function IconSolopreneur({ size = defaults.size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* Person — head */}
      <circle cx="20" cy="14" r="5" stroke="#507E78" strokeWidth="1.5" opacity="0.5" />
      {/* Person — torso */}
      <path d="M10 40 C10 30 14 26 20 26 C26 26 30 30 30 40" stroke="#507E78" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      {/* Creative spark — 4-point star */}
      <path d="M36 12 L37.5 8 L39 12 L43 13.5 L39 15 L37.5 19 L36 15 L32 13.5 Z" fill="#A86040" opacity="0.7" />
      {/* Secondary small spark */}
      <path d="M40 22 L40.8 20 L41.6 22 L43.5 22.8 L41.6 23.6 L40.8 25.5 L40 23.6 L38 22.8 Z" fill="#A86040" opacity="0.4" />
      {/* Subtle third spark */}
      <circle cx="33" cy="8" r="1" fill="#A86040" opacity="0.25" />
    </svg>
  );
}


/* ═══════════════════════════════════════
   Segments We're Watching — smaller icons
   ═══════════════════════════════════════ */

/* ── Healthcare — medical cross ── */
export function IconHealthcare({ size = 32, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="12" y="4" width="8" height="24" rx="2" stroke="#507E78" strokeWidth="1" opacity="0.45" />
      <rect x="4" y="12" width="24" height="8" rx="2" stroke="#507E78" strokeWidth="1" opacity="0.45" />
      <circle cx="16" cy="16" r="2" fill="#A86040" opacity="0.5" />
    </svg>
  );
}

/* ── Event Producers — stage/spotlight ── */
export function IconEvents({ size = 32, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Stage platform */}
      <rect x="4" y="24" width="24" height="4" rx="1" stroke="#507E78" strokeWidth="1" opacity="0.4" />
      {/* Spotlight beams */}
      <path d="M16 4 L8 22" stroke="#A86040" strokeWidth="0.75" opacity="0.4" />
      <path d="M16 4 L24 22" stroke="#A86040" strokeWidth="0.75" opacity="0.4" />
      <path d="M16 4 L16 22" stroke="#A86040" strokeWidth="0.75" opacity="0.3" />
      {/* Spotlight source */}
      <circle cx="16" cy="4" r="2" fill="#A86040" opacity="0.6" />
      {/* Stage glow */}
      <ellipse cx="16" cy="24" rx="8" ry="2" fill="#507E78" opacity="0.1" />
    </svg>
  );
}

/* ── E-Commerce — shopping bag ── */
export function IconEcommerce({ size = 32, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Bag body */}
      <path d="M6 12 L8 28 L24 28 L26 12 Z" stroke="#507E78" strokeWidth="1" opacity="0.45" />
      {/* Handle */}
      <path d="M11 12 C11 7 13 4 16 4 C19 4 21 7 21 12" stroke="#507E78" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
      {/* Cart / tag accent */}
      <circle cx="16" cy="19" r="2" fill="#A86040" opacity="0.5" />
    </svg>
  );
}

/* ── Nonprofit — hand holding heart ── */
export function IconNonprofit({ size = 32, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Open hand (simplified palm) */}
      <path d="M8 20 C8 16 12 14 16 14 C20 14 24 16 24 20 L24 26 L8 26 Z" stroke="#507E78" strokeWidth="1" opacity="0.4" />
      {/* Heart */}
      <path d="M16 11 C14 7 9 7 9 11 C9 14 16 18 16 18 C16 18 23 14 23 11 C23 7 18 7 16 11 Z" fill="#A86040" opacity="0.55" stroke="#A86040" strokeWidth="0.5" />
    </svg>
  );
}
