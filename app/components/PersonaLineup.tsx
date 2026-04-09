"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  IconServicePro,
  IconGrowingOp,
  IconProfessional,
  IconRealEstate,
  IconMultiLocation,
  IconSolopreneur,
} from "./ClientIcons";
import BorderGlow from "./BorderGlow";
import "./PersonaLineup.css";

/* ── Persona data (matches ClientProfiles order) ── */
interface PersonaNode {
  id: number;
  title: string;
  label: string;
  shortDesc: string;
  illustration: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const personas: PersonaNode[] = [
  { id: 0, title: "The Local Service Pro",          label: "Local Service Pro",               shortDesc: "Get found when someone searches or asks AI who to call",                illustration: "/pantalones.svg",    icon: IconServicePro },
  { id: 1, title: "The Growing Operator",            label: "Growing Operator",               shortDesc: "One platform replacing fragmented tools that don't talk",                illustration: "/growth.svg",        icon: IconGrowingOp },
  { id: 2, title: "The Professional Services Firm",  label: "Professional Services",           shortDesc: "Be the answer when AI recommends someone in your field",                 illustration: "/professional.svg",  icon: IconProfessional },
  { id: 3, title: "Real Estate & Financial Services", label: "Real Estate & Financial",        shortDesc: "Speed-to-lead automation with compliance built in",                  illustration: "/real.svg",          icon: IconRealEstate },
  { id: 4, title: "The Multi-Location Enterprise",   label: "Multi-Location Enterprise",      shortDesc: "Scale the system that runs every location",                              illustration: "/roboto.svg",        icon: IconMultiLocation },
  { id: 5, title: "The Solopreneur & Personal Brand", label: "Solopreneur & Personal",  shortDesc: "Own your audience before the algorithm changes",                         illustration: "/solo.svg",          icon: IconSolopreneur },
];

/* ── Component ── */
export interface PersonaLineupProps {
  onPersonaClick?: (index: number) => void;
}

const PersonaLineup = ({ onPersonaClick }: PersonaLineupProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className={`pl-section ${visible ? "pl-visible" : ""}`}
    >
      {/* ── Row 1: Hero (left) + Legend (right) ── */}
      <div className="pl-top">
        <div className="pl-hero">
          <h1 className="pl-hero-title anim-fade-up">Who We<br />Work With</h1>
          <p className="pl-hero-sub anim-fade-up-d1">
            We build for businesses ready to be found: by customers,
            by search engines, and by the AI that&rsquo;s answering
            questions your customers ask.
          </p>
          <p className="pl-hero-note anim-fade-up-d2">
            From solo operators to multi-location enterprises.
            If it sounds like you, we should talk.
          </p>
        </div>

        <BorderGlow
          className="pl-legend-wrapper anim-fade-up-d1"
          backgroundColor="#0c0a08"
          borderRadius={20}
          glowRadius={30}
          glowIntensity={0.8}
          glowColor="160 24 40"
          edgeSensitivity={30}
          coneSpread={25}
          colors={["#507E78", "#A86040", "#507E78"]}
          fillOpacity={0.3}
        >
          <div className="pl-legend">
            <p className="pl-legend-heading">Find Your Profile</p>

            {personas.map((persona) => {
              const Icon = persona.icon;
              const isActive = hoveredId === persona.id;
              return (
                <div
                  key={persona.id}
                  className={`pl-legend-item ${isActive ? "pl-legend-item--active" : ""}`}
                  onMouseEnter={() => setHoveredId(persona.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onPersonaClick?.(persona.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onPersonaClick?.(persona.id);
                    }
                  }}
                >
                  <div className="pl-legend-icon">
                    <Icon size={22} />
                  </div>
                  <div className="pl-legend-text">
                    <span className="pl-legend-title">{persona.title}</span>
                    <span className="pl-legend-desc">{persona.shortDesc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </BorderGlow>
      </div>

      {/* ── Row 2: Character lineup (full width) ── */}
      <div className="pl-characters">
        <div className="pl-lineup">
          {personas.map((persona, i) => {
            const isActive = hoveredId === persona.id;
            return (
              <div
                key={persona.id}
                className={`pl-char ${isActive ? "pl-char--active" : ""}`}
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                onMouseEnter={() => setHoveredId(persona.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onPersonaClick?.(persona.id)}
                role="button"
                tabIndex={0}
                aria-label={persona.title}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onPersonaClick?.(persona.id);
                  }
                }}
              >
                <div className="pl-char__img-wrap">
                  <Image
                    src={persona.illustration}
                    alt=""
                    width={240}
                    height={240}
                    priority={i < 3}
                    className="pl-char__img"
                  />
                </div>
                <span className="pl-char__label">{persona.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PersonaLineup;
