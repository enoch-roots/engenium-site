"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import StaggeredMenu from "./StaggeredMenu";
import "./TopNav.css";

/* ── Keystone mark (inline SVG, pixel-tuned for small render) ── */
function KeystoneMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      width="28"
      height="28"
      fill="none"
      aria-hidden="true"
      shapeRendering="geometricPrecision"
    >
      {/* Outer trapezoid */}
      <path
        d="M4,5 L28,5 L21.5,27.5 L10.5,27.5 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
      />
      {/* Inner drafted margin */}
      <path
        d="M8.5,9 L23.5,9 L18.5,24.5 L13.5,24.5 Z"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.36"
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
      />
      {/* Center joint */}
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

/* ── Nav link data ── */
interface NavLink {
  href: string;
  label: string;
}

const NAV_LINKS: NavLink[] = [
  { href: "/services", label: "What We Build" },
  { href: "/who-we-work-with", label: "Who We Work With" },
  { href: "/how-we-work", label: "How We Work" },
];

/* ── Staggered menu items (mobile) ── */
const MENU_ITEMS = [
  { label: "Home", ariaLabel: "Go to home page", href: "/" },
  { label: "What We Build", ariaLabel: "View our services", href: "/services" },
  { label: "Who We Work With", ariaLabel: "See who we work with", href: "/who-we-work-with" },
  { label: "How We Work", ariaLabel: "Learn our process", href: "/how-we-work" },
];

const SOCIAL_ITEMS = [
  { label: "LinkedIn", link: "https://linkedin.com" },
  { label: "GitHub", link: "https://github.com" },
  { label: "Twitter", link: "https://twitter.com" },
];

const CTA_LABEL = "Free Visibility Audit";

/* ── Component ── */
interface TopNavProps {
  onAuditClick?: () => void;
}

export default function TopNav({ onAuditClick }: TopNavProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* ── Track scroll position for background blur ── */
  useEffect(() => {
    const findScrollContainers = (): HTMLElement[] => {
      const found: HTMLElement[] = [];
      const candidates = document.querySelectorAll<HTMLElement>(
        ".landing-scroll, .sc-scroll, body > *, main > *, [data-scroll-container]"
      );
      candidates.forEach((el) => {
        const ov = getComputedStyle(el).overflowY;
        if (ov === "auto" || ov === "scroll") found.push(el);
      });
      return found;
    };

    const handleScroll = () => {
      let isScrolled = window.scrollY > 20;
      scrollContainers.forEach((el) => {
        if (el.scrollTop > 20) isScrolled = true;
      });
      setScrolled(isScrolled);
    };

    const scrollContainers = findScrollContainers();
    window.addEventListener("scroll", handleScroll, { passive: true });
    scrollContainers.forEach((el) =>
      el.addEventListener("scroll", handleScroll, { passive: true })
    );
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      scrollContainers.forEach((el) =>
        el.removeEventListener("scroll", handleScroll)
      );
    };
  }, [pathname]);

  /* ── Close menu on route change ── */
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  /* ── Close menu on Escape ── */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setMenuOpen(false);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [menuOpen, handleKeyDown]);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav
        className={`tn ${scrolled ? "tn--scrolled" : ""}`}
        role="navigation"
        aria-label="Primary"
      >
        <div className="tn__inner">
          {/* ── Logo ── */}
          <Link href="/" className="tn__logo" aria-label="Engenium Labs, Home">
            <KeystoneMark className="tn__logo-icon" />
            <span className="tn__logo-text">ENGENIUM</span>
          </Link>

          {/* ── Desktop links ── */}
          <div className="tn__links">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`tn__link ${isActive(link.href) ? "tn__link--active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── CTA (desktop only) ── */}
          <button type="button" className="tn__cta" onClick={onAuditClick}>
            {CTA_LABEL}
            <span className="tn__cta-arrow">&rarr;</span>
          </button>

          {/* ── Mobile hamburger ── */}
          <button
            className={`tn__hamburger ${menuOpen ? "tn__hamburger--open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span className="tn__hamburger-line" />
            <span className="tn__hamburger-line" />
            <span className="tn__hamburger-line" />
          </button>
        </div>
      </nav>

      {/* ── Mobile staggered menu overlay ── */}
      <StaggeredMenu
        items={MENU_ITEMS}
        socialItems={SOCIAL_ITEMS}
        displaySocials={false}
        displayItemNumbering
        colors={["rgba(80,126,120,0.3)", "rgba(168,96,64,0.18)"]}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        ctaLabel={CTA_LABEL}
        onCtaClick={onAuditClick}
      />
    </>
  );
}
