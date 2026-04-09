"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import BorderGlow from "./BorderGlow";
import {
  IconSearch,
  IconAnalytics,
  IconWeb,
  IconPlatform,
  IconStrategy,
  IconImmersive,
} from "./ServiceIcons";
import "./MagicBento.css";

/* ── Service card data ── */
interface CardData {
  id: string;
  title: string;
  description: string;
  highlight?: string;
  bullets: string[];
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  featured?: boolean;
}

const cardData: CardData[] = [
  {
    id: "web",
    title: "Full-Stack Web",
    description:
      "Custom-built websites designed around how your business works. Fast, accessible, and built to bring in leads.",
    highlight: "Infrastructure, not a template. Built to compound.",
    bullets: [
      "Custom design matched to your brand, not a template",
      "Mobile-first so it works perfectly on every device",
      "Accessible to all users, including screen readers",
      "SEO-ready from day one with proper structure and metadata",
      "Content management so your team can update pages without a developer",
      "Hosted on enterprise-grade infrastructure with instant deploys",
    ],
    label: "Core Builds",
    icon: IconWeb,
    featured: true,
  },
  {
    id: "seo",
    title: "GEO / SEO",
    description:
      "People search differently now. We make sure your business shows up.",
    highlight: "SEO gets you ranked. GEO gets you recommended.",
    bullets: [
      "Visibility audits across ChatGPT, Perplexity, Gemini & Google AI",
      "Structured content so AI platforms cite your business by name",
      "Monthly monitoring of where and how you appear in search",
      "Traditional SEO foundations built into every project",
    ],
    label: "Search Optimization",
    icon: IconSearch,
  },
  {
    id: "analytics",
    title: "Analytics & Attribution",
    description: "See which channels bring the right customers.",
    highlight: "Not vanity metrics. What converts.",
    bullets: [
      "Track every visitor from first touch to closed deal",
      "Session recordings so you can watch how people use your site",
      "Ad tracking that works even when browsers block it",
      "90-day attribution window across every channel",
      "Reports you can actually read and act on",
    ],
    label: "Intelligence",
    icon: IconAnalytics,
  },
  {
    id: "platform",
    title: "Platform & Automation",
    description:
      "One system for your CRM, pipelines, and automations. Built around how you actually operate.",
    highlight: "One platform. Every workflow. No duct tape.",
    bullets: [
      "New leads automatically created and routed to the right person",
      "Every lead tagged with where they came from and how they found you",
      "Pipeline stages that move contacts through your sales process",
      "Duplicate detection so your database stays clean",
      "Automated follow-ups, reminders, and task triggers",
      "Full setup, configuration, and ongoing management included",
    ],
    label: "Infrastructure",
    icon: IconPlatform,
    featured: true,
  },
  {
    id: "strategy",
    title: "Marketing Strategy",
    description:
      "We build the foundation for actionable reporting, helping determine where to spend and where to cut.",
    highlight: "Data-driven decisions, not gut feelings.",
    bullets: [
      "Channel-by-channel breakdown of what brings in real leads",
      "Identify where prospects drop off in your funnel",
      "Cost per lead and cost per acquisition reporting",
      "Audience and creative recommendations based on your data",
    ],
    label: "Strategy",
    icon: IconStrategy,
  },
  {
    id: "immersive",
    title: "3D & Interactive",
    description:
      "Premium visual experiences that let customers interact with your products before they buy.",
    highlight: "The kind of thing that makes people stop scrolling.",
    bullets: [
      "Interactive 3D product viewers on your website",
      "Scroll-driven animations that guide users through your story",
      "Custom visual effects tailored to your brand",
      "Optimized to load fast on any device",
    ],
    label: "Immersive",
    icon: IconImmersive,
  },
];

/* ── Props ── */
export interface MagicBentoProps {
  textAutoHide?: boolean;
  /** Pop-out modal — controlled by parent (hub/legend clicks) */
  modalCardId?: string | null;
  onCloseModal?: () => void;
}

const MagicBento = ({ modalCardId, onCloseModal }: MagicBentoProps) => {
  /* Local modal state for bento card clicks */
  const [localModal, setLocalModal] = useState<string | null>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => { setPortalRoot(document.body); }, []);

  /* Active modal = parent-controlled (hub) OR local (bento click) */
  const activeModal = modalCardId ?? localModal;
  const isParentModal = modalCardId != null;

  const closeModal = useCallback(() => {
    if (isParentModal) {
      onCloseModal?.();
    } else {
      setLocalModal(null);
    }
  }, [isParentModal, onCloseModal]);

  const openCard = useCallback((id: string) => {
    setLocalModal((prev) => (prev === id ? null : id));
  }, []);

  /* Close modal on Escape */
  useEffect(() => {
    if (!activeModal) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeModal, closeModal]);

  /* Sync: if parent opens modal, clear local */
  useEffect(() => {
    if (modalCardId != null) setLocalModal(null);
  }, [modalCardId]);

  const modalData = activeModal ? cardData.find((c) => c.id === activeModal) : null;

  /* ── Pop-out modal (portaled to body) ── */
  const popout = modalData && portalRoot ? (() => {
    const Icon = modalData.icon;
    return createPortal(
      <div className="mb-popout-backdrop" onClick={closeModal}>
        <div
          ref={popRef}
          className="mb-popout"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-label={modalData.title}
        >
          <button
            type="button"
            className="mb-popout__close"
            onClick={closeModal}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <div className="mb-popout__header">
            <div className="mb-popout__icon"><Icon size={56} /></div>
            <div>
              <div className="mb-popout__label">{modalData.label}</div>
              <h2 className="mb-popout__title">{modalData.title}</h2>
            </div>
          </div>

          <p className="mb-popout__description">{modalData.description}</p>

          {modalData.highlight && (
            <p className="mb-popout__highlight">{modalData.highlight}</p>
          )}

          <ul className="mb-popout__bullets">
            {modalData.bullets.map((bullet, i) => (
              <li key={i}>{bullet}</li>
            ))}
          </ul>
        </div>
      </div>,
      portalRoot
    );
  })() : null;

  return (
    <>
      {/* ── Grid of cards ── */}
      <div className="mb-services">
        {cardData.map((card, index) => {
          const Icon = card.icon;
          const cardClass = [
            "mb-card",
            "mb-card--corner",
            "mb-card--clickable",
            card.featured && "mb-card--featured",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <BorderGlow
              key={index}
              className={`mb-card-wrapper ${card.featured ? "mb-card-wrapper--featured" : ""}`}
              backgroundColor="#0c0a08"
              borderRadius={24}
              glowRadius={30}
              glowIntensity={0.8}
              glowColor="160 24 40"
              edgeSensitivity={30}
              coneSpread={25}
              colors={["#507E78", "#A86040", "#507E78"]}
              fillOpacity={0.3}
            >
              <div
                className={cardClass}
                id={`service-${card.id}`}
                onClick={() => openCard(card.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openCard(card.id);
                  }
                }}
              >
                <div className="mb-card__icon">
                  <Icon size={56} />
                </div>

                <div className="mb-card__content-wrap">
                  <div className="mb-card__label">{card.label}</div>
                  <h2 className="mb-card__title">{card.title}</h2>
                  <p className="mb-card__description">{card.description}</p>

                  {card.highlight && (
                    <p className="mb-card__highlight">{card.highlight}</p>
                  )}

                  <div className="mb-card__expand-hint">
                    <span className="mb-card__expand-hint-line" />
                    <span className="mb-card__expand-hint-text">Learn More</span>
                    <span className="mb-card__expand-hint-line" />
                  </div>
                </div>
              </div>
            </BorderGlow>
          );
        })}
      </div>

      {popout}
    </>
  );
};

export default MagicBento;
