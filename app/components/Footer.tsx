"use client";

import Link from "next/link";
import "./Footer.css";

/* ── Keystone mark (matches TopNav) ── */
function KeystoneMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      width="22"
      height="22"
      fill="none"
      aria-hidden="true"
      shapeRendering="geometricPrecision"
    >
      <path
        d="M4,5 L28,5 L21.5,27.5 L10.5,27.5 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M8.5,9 L23.5,9 L18.5,24.5 L13.5,24.5 Z"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.36"
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1="16" y1="5" x2="16" y2="9"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer__rule" />

      <div className="site-footer__inner">
        {/* Logo + tagline */}
        <Link href="/" className="site-footer__brand" aria-label="Engenium Labs, Home">
          <KeystoneMark className="site-footer__mark" />
          <span className="site-footer__wordmark">ENGENIUM</span>
        </Link>

        <p className="site-footer__tagline">
          Built to be found. In the generation of AI search.
        </p>

        {/* Copyright */}
        <p className="site-footer__legal">
          &copy; {year} Engenium Labs. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
