"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import BorderGlow from "./BorderGlow";
import {
  IconServicePro,
  IconGrowingOp,
  IconProfessional,
  IconRealEstate,
  IconMultiLocation,
  IconSolopreneur,
  IconHealthcare,
  IconEvents,
  IconEcommerce,
  IconNonprofit,
} from "./ClientIcons";
import "./ClientProfiles.css";

/* ── Profile card data ── */
interface ProfileData {
  title: string;
  label: string;
  hook: string;
  soundsLikeYou: string;
  outcomes: string[];
  icon: React.ComponentType<{ size?: number; className?: string }>;
  illustration: string;
}

const profileData: ProfileData[] = [
  {
    title: "The Local Service Pro",
    label: "Home Services & Trades",
    hook: "You're great at what you do. But when someone searches, or asks AI who to call, do they find you?",
    soundsLikeYou:
      "All my business comes from word of mouth. What happens when that dries up?",
    outcomes: [
      "A professional website that ranks in local and AI search results",
      "Automated lead capture and follow-up, even when you're on the job",
      "Review collection on autopilot to build the reputation that closes deals",
      "Booking, scheduling, and payment processing in one system",
    ],
    icon: IconServicePro,
    illustration: "/pantalones.svg",
  },
  {
    title: "The Growing Operator",
    label: "Established SMBs",
    hook: "Your business is working. Your digital systems aren't.",
    soundsLikeYou:
      "We're growing but I feel like we're leaving money on the table. I don't know which marketing is working.",
    outcomes: [
      "One unified platform replacing fragmented tools that don't talk to each other",
      "Attribution infrastructure so you see exactly which channels bring real customers",
      "Workflow automation that eliminates the manual tasks draining your team",
      "A modern web presence that reflects where your business is now, not where it was three years ago",
    ],
    icon: IconGrowingOp,
    illustration: "/growth.svg",
  },
  {
    title: "The Professional Services Firm",
    label: "Law · Accounting · Consulting",
    hook: "Your reputation brings in clients. But when someone asks AI for a recommendation in your field, are you the answer?",
    soundsLikeYou:
      "My website looks fine but nobody contacts us through it. All our clients come from referrals.",
    outcomes: [
      "A digital presence that matches the quality of your practice and converts visitors to consultations",
      "Structured authority signals that make AI engines cite your expertise by name",
      "CRM and follow-up automation built for relationship-driven businesses",
      "Review and reputation infrastructure that reinforces the trust you've already earned",
    ],
    icon: IconProfessional,
    illustration: "/professional.svg",
  },
  {
    title: "Real Estate & Financial Services",
    label: "Brokerages · Mortgage · Insurance",
    hook: "Your leads are going cold while you're on a call. Your CRM doesn't talk to your website. Your compliance is a prayer, not a system.",
    soundsLikeYou:
      "I'm paying for a CRM, a website, and a social media tool, and none of them work together.",
    outcomes: [
      "One platform that captures, routes, follows up, and closes. Compliance built in",
      "Per-agent pipelines with centralized reporting across your team",
      "Speed-to-lead automation that responds before your competitor can",
      "Attribution from first ad click to closed deal, so you know what's working",
    ],
    icon: IconRealEstate,
    illustration: "/real.svg",
  },
  {
    title: "The Multi-Location Enterprise",
    label: "Franchises & Scaling Operations",
    hook: "You scaled the business. Now scale the system that runs it.",
    soundsLikeYou:
      "Every location has a different online presence; some have no Google listing at all.",
    outcomes: [
      "Centralized platform with per-location execution and corporate-level reporting",
      "Cloneable system architecture: the platform built for location one works for all of them",
      "AI visibility across every market you serve, compounding with each location",
      "Per-seat user management with standardized workflows that actually get adopted",
    ],
    icon: IconMultiLocation,
    illustration: "/roboto.svg",
  },
  {
    title: "The Solopreneur & Personal",
    label: "Creators · Artists · Coaches",
    hook: "You've built something real. Let's make sure the internet knows it.",
    soundsLikeYou:
      "I have an audience but I'm not capturing any of it. I'm one algorithm change away from losing everything.",
    outcomes: [
      "A professional home base that replaces the Linktree and captures every fan and follower",
      "SMS and email capture at live events with NFC and QR. Zero friction",
      "Audience CRM that segments fans, followers, and industry contacts",
      "A foundation that scales with you as the personal brand becomes a business",
    ],
    icon: IconSolopreneur,
    illustration: "/solo.svg",
  },
];

/* ── Watching segments data ── */
interface WatchingData {
  title: string;
  teaser: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const watchingData: WatchingData[] = [
  {
    title: "Healthcare Practices",
    teaser:
      "Per-provider models, compliance moats, and the highest-value AI search queries in local services.",
    icon: IconHealthcare,
  },
  {
    title: "Event Producers & Venues",
    teaser:
      "Recurring events mean recurring audience capture. Ambassador programs and NFC at the door.",
    icon: IconEvents,
  },
  {
    title: "E-Commerce & DTC",
    teaser:
      "Product recommendation queries are moving to AI. Schema-rich catalogs win the citation.",
    icon: IconEcommerce,
  },
  {
    title: "Nonprofit Organizations",
    teaser:
      "Mission-driven operations with donor engagement, automated communications, and community infrastructure.",
    icon: IconNonprofit,
  },
];

/* ── Props ── */
export interface ClientProfilesProps {
  /** Pop-out modal — controlled by parent (lineup/legend clicks) */
  modalCardIndex?: number | null;
  onCloseModal?: () => void;
}

/* ── Component ── */
const ClientProfiles = ({ modalCardIndex, onCloseModal }: ClientProfilesProps) => {
  /* Local modal state for bento card clicks */
  const [localModal, setLocalModal] = useState<number | null>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => { setPortalRoot(document.body); }, []);

  /* Active modal = parent-controlled (lineup) OR local (bento click) */
  const activeModal = modalCardIndex ?? localModal;
  const isParentModal = modalCardIndex != null;

  const closeModal = useCallback(() => {
    if (isParentModal) {
      onCloseModal?.();
    } else {
      setLocalModal(null);
    }
  }, [isParentModal, onCloseModal]);

  const openCard = useCallback((index: number) => {
    setLocalModal((prev) => (prev === index ? null : index));
  }, []);

  /* Close modal on Escape */
  useEffect(() => {
    if (activeModal == null) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeModal, closeModal]);

  /* Sync: if parent opens modal, clear local */
  useEffect(() => {
    if (modalCardIndex != null) setLocalModal(null);
  }, [modalCardIndex]);

  const modalData = activeModal != null ? profileData[activeModal] : null;

  /* ── Pop-out modal (portaled to body) ── */
  const popout = modalData && portalRoot ? (() => {
    const Icon = modalData.icon;
    return createPortal(
      <div className="cp-popout-backdrop" onClick={closeModal}>
        <div
          className="cp-popout"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-label={modalData.title}
        >
          <button
            type="button"
            className="cp-popout__close"
            onClick={closeModal}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* ── Character + text side by side ── */}
          <div className="cp-popout__layout">
            {/* Character illustration */}
            <div className="cp-popout__illustration" aria-hidden="true">
              <Image
                src={modalData.illustration}
                alt=""
                width={400}
                height={400}
                className="cp-popout__illustration-img"
              />
            </div>

            {/* Text content */}
            <div className="cp-popout__content">
              <div className="cp-popout__header">
                <div className="cp-popout__icon"><Icon size={48} /></div>
                <div>
                  <div className="cp-popout__label">{modalData.label}</div>
                  <h2 className="cp-popout__title">{modalData.title}</h2>
                </div>
              </div>

              <p className="cp-popout__hook">{modalData.hook}</p>

              <div className="cp-popout__voice">
                <span className="cp-popout__voice-mark">&ldquo;</span>
                {modalData.soundsLikeYou}
                <span className="cp-popout__voice-mark">&rdquo;</span>
              </div>

              <ul className="cp-popout__outcomes">
                {modalData.outcomes.map((outcome, i) => (
                  <li key={i}>{outcome}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>,
      portalRoot
    );
  })() : null;

  return (
    <>
      <div className="cp-container">
        {/* ── Main profile cards ── */}
        <div className="cp-grid">
          {profileData.map((profile, index) => {
            const Icon = profile.icon;

            return (
              <div key={index} id={`persona-card-${index}`}>
              <BorderGlow
                className="cp-card-wrapper"
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
                  className="cp-card cp-card--corner cp-card--clickable"
                  onClick={() => openCard(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openCard(index);
                    }
                  }}
                >
                  {/* ── Summary + character ── */}
                  <div className="cp-card__header">
                    <div className="cp-card__header-text">
                      <div className="cp-card__icon">
                        <Icon size={40} />
                      </div>
                      <div className="cp-card__label">{profile.label}</div>
                      <h2 className="cp-card__title">{profile.title}</h2>
                      <p className="cp-card__hook">{profile.hook}</p>
                    </div>

                    {/* ── Transhumans character ── */}
                    <div className="cp-card__illustration" aria-hidden="true">
                      <Image
                        src={profile.illustration}
                        alt=""
                        width={320}
                        height={320}
                        priority={index < 2}
                        className="cp-card__illustration-img"
                      />
                    </div>
                  </div>

                  {/* ── "Learn more" hint ── */}
                  <div className="cp-card__expand-hint">
                    <span className="cp-card__expand-hint-line" />
                    <span className="cp-card__expand-hint-text">Learn More</span>
                    <span className="cp-card__expand-hint-line" />
                  </div>
                </div>
              </BorderGlow>
              </div>
            );
          })}
        </div>

        {/* ── Segments We're Watching ── */}
        <div className="cp-watching">
          <div className="cp-watching__header">
            <div className="cp-watching__label">On Our Radar</div>
            <h3 className="cp-watching__title">Segments We&rsquo;re Watching</h3>
            <p className="cp-watching__subtitle">
              Industries where the Engenium system fits, and where we&rsquo;re
              building expertise next.
            </p>
          </div>

          <div className="cp-watching__grid">
            {watchingData.map((segment, index) => {
              const Icon = segment.icon;

              return (
                <BorderGlow
                  key={index}
                  className="cp-watching__card-wrapper"
                  backgroundColor="#0c0a08"
                  borderRadius={16}
                  glowRadius={20}
                  glowIntensity={0.5}
                  glowColor="160 24 40"
                  edgeSensitivity={40}
                  coneSpread={30}
                  colors={["#507E78", "#A86040", "#507E78"]}
                  fillOpacity={0.15}
                >
                  <div className="cp-watching__card">
                    <div className="cp-watching__card-icon">
                      <Icon size={32} />
                    </div>
                    <div className="cp-watching__card-content">
                      <h4 className="cp-watching__card-title">{segment.title}</h4>
                      <p className="cp-watching__card-teaser">{segment.teaser}</p>
                    </div>
                  </div>
                </BorderGlow>
              );
            })}
          </div>
        </div>
      </div>

      {popout}
    </>
  );
};

export default ClientProfiles;
