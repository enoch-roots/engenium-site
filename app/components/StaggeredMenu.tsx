"use client";

import React, { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import "./StaggeredMenu.css";

/* ── Types ── */
interface MenuItem {
  label: string;
  ariaLabel: string;
  href: string;
}

interface SocialItem {
  label: string;
  link: string;
}

interface StaggeredMenuProps {
  items: MenuItem[];
  socialItems?: SocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  colors?: string[];
  isOpen: boolean;
  onClose: () => void;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

/* ═══════════════════════════════════════
   STAGGERED MENU — Engenium brand

   Architecture:
   - CSS transitions handle core open/close
     (wrapper visibility, backdrop, panel slide)
   - GSAP adds stagger polish on top
     (item entrance, number fade, social links)
   ═══════════════════════════════════════ */

export default function StaggeredMenu({
  items,
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  colors = ["rgba(80,126,120,0.35)", "rgba(168,96,64,0.25)"],
  isOpen,
  onClose,
  ctaLabel,
  onCtaClick,
}: StaggeredMenuProps) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLElement>(null);
  const staggerTlRef = useRef<gsap.core.Timeline | null>(null);
  const prevOpenRef = useRef(false);

  /* ── GSAP stagger entrance (enhancement on top of CSS) ── */
  const playStaggerIn = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;

    staggerTlRef.current?.kill();

    const itemEls = Array.from(
      panel.querySelectorAll<HTMLSpanElement>(".sm-panel-itemLabel")
    );
    const numberEls = Array.from(
      panel.querySelectorAll<HTMLElement>(
        ".sm-panel-list[data-numbering] .sm-panel-item"
      )
    );
    const socialTitle =
      panel.querySelector<HTMLHeadingElement>(".sm-socials-title");
    const socialLinks = Array.from(
      panel.querySelectorAll<HTMLAnchorElement>(".sm-socials-link")
    );
    const ctaEl = panel.querySelector<HTMLButtonElement>(".sm-cta-btn");

    /* Set starting positions */
    if (itemEls.length) gsap.set(itemEls, { yPercent: 120, rotate: 8 });
    if (numberEls.length)
      gsap.set(numberEls, { "--sm-num-opacity": 0 } as gsap.TweenVars);
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
    if (socialLinks.length) gsap.set(socialLinks, { y: 20, opacity: 0 });
    if (ctaEl) gsap.set(ctaEl, { opacity: 0, y: 16 });

    const tl = gsap.timeline({ delay: 0.15 });

    /* Items stagger up */
    if (itemEls.length) {
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 0.8,
          ease: "power4.out",
          stagger: { each: 0.08, from: "start" },
        },
        0
      );

      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            "--sm-num-opacity": 1,
            duration: 0.5,
            ease: "power2.out",
            stagger: { each: 0.06, from: "start" },
          } as gsap.TweenVars,
          0.12
        );
      }
    }

    /* CTA */
    if (ctaEl) {
      tl.to(ctaEl, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.25);
    }

    /* Social links */
    if (socialTitle || socialLinks.length) {
      if (socialTitle) {
        tl.to(
          socialTitle,
          { opacity: 1, duration: 0.4, ease: "power2.out" },
          0.2
        );
      }
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.45,
            ease: "power3.out",
            stagger: { each: 0.06, from: "start" },
          },
          0.25
        );
      }
    }

    staggerTlRef.current = tl;
  }, []);

  /* ── Reset stagger state when closing ── */
  const resetStagger = useCallback(() => {
    staggerTlRef.current?.kill();
    staggerTlRef.current = null;

    const panel = panelRef.current;
    if (!panel) return;

    /* Clear all GSAP inline styles so CSS takes over cleanly */
    const itemEls = panel.querySelectorAll(".sm-panel-itemLabel");
    const numberEls = panel.querySelectorAll(
      ".sm-panel-list[data-numbering] .sm-panel-item"
    );
    const socialTitle = panel.querySelector(".sm-socials-title");
    const socialLinks = panel.querySelectorAll(".sm-socials-link");
    const ctaEl = panel.querySelector(".sm-cta-btn");

    gsap.set(
      [
        ...Array.from(itemEls),
        ...Array.from(numberEls),
        ...Array.from(socialLinks),
        ...(socialTitle ? [socialTitle] : []),
        ...(ctaEl ? [ctaEl] : []),
      ],
      { clearProps: "all" }
    );
  }, []);

  /* ── Trigger stagger on open, reset on close ── */
  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      playStaggerIn();
    } else if (!isOpen && prevOpenRef.current) {
      /* Wait for the CSS close transition to finish, then reset */
      const timer = setTimeout(resetStagger, 400);
      return () => clearTimeout(timer);
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, playStaggerIn, resetStagger]);

  /* ── Lock body scroll when open ── */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  const isActive = (href: string) => pathname === href;

  /* ── Pre-layer colours ── */
  const preLayers = (() => {
    const raw =
      colors && colors.length
        ? colors.slice(0, 4)
        : ["rgba(80,126,120,0.35)", "rgba(168,96,64,0.25)"];
    const arr = [...raw];
    if (arr.length >= 3) {
      arr.splice(Math.floor(arr.length / 2), 1);
    }
    return arr;
  })();

  return (
    <div
      className="staggered-menu-wrapper"
      data-open={isOpen ? "" : undefined}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div className="sm-backdrop" onClick={onClose} />

      {/* Pre-layers (colour wipes — staggered via CSS transition-delay) */}
      <div className="sm-prelayers" aria-hidden="true">
        {preLayers.map((c, i) => (
          <div
            key={i}
            className="sm-prelayer"
            style={{
              background: c,
              transitionDelay: isOpen ? `${i * 0.06}s` : "0s",
            }}
          />
        ))}
      </div>

      {/* Main panel */}
      <aside
        id="staggered-menu-panel"
        ref={panelRef}
        className="staggered-menu-panel"
        aria-label="Mobile navigation"
      >
        <div className="sm-panel-inner">
          <ul
            className="sm-panel-list"
            role="list"
            data-numbering={displayItemNumbering || undefined}
          >
            {items.map((it, idx) => (
              <li className="sm-panel-itemWrap" key={it.href}>
                <Link
                  className={`sm-panel-item${
                    isActive(it.href) ? " sm-panel-item--active" : ""
                  }`}
                  href={it.href}
                  aria-label={it.ariaLabel}
                  data-index={idx + 1}
                  onClick={onClose}
                >
                  <span className="sm-panel-itemLabel">{it.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA */}
          {ctaLabel && (
            <button
              type="button"
              className="sm-cta-btn"
              onClick={() => {
                onClose();
                onCtaClick?.();
              }}
            >
              {ctaLabel}
              <span className="sm-cta-arrow">&rarr;</span>
            </button>
          )}

          {/* Social links */}
          {displaySocials && socialItems.length > 0 && (
            <div className="sm-socials" aria-label="Social links">
              <h3 className="sm-socials-title">Connect</h3>
              <ul className="sm-socials-list" role="list">
                {socialItems.map((s, i) => (
                  <li key={s.label + i} className="sm-socials-item">
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sm-socials-link"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
