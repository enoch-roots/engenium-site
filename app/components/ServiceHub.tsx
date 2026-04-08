"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconSearch,
  IconAnalytics,
  IconWeb,
  IconPlatform,
  IconStrategy,
  IconImmersive,
} from "./ServiceIcons";
import "./ServiceHub.css";

/* ── Node data (matches MagicBento card order) ── */
interface HubNode {
  id: string;
  label: string;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  angleDeg: number;
}

const nodes: HubNode[] = [
  { id: "web",       label: "Core Builds",         title: "Full-Stack Web",         shortDesc: "Custom sites built for speed, access, and leads",             icon: IconWeb,       angleDeg: 270 },
  { id: "seo",       label: "Search Optimization", title: "GEO / SEO",              shortDesc: "Show up in Google, AI search, and everywhere that matters",   icon: IconSearch,    angleDeg: 330 },
  { id: "analytics", label: "Intelligence",        title: "Analytics & Attribution", shortDesc: "Track every visitor from first touch to closed deal",          icon: IconAnalytics, angleDeg: 30  },
  { id: "platform",  label: "Infrastructure",      title: "Platform & Automation",  shortDesc: "One system for your CRM, pipelines, and automations",         icon: IconPlatform,  angleDeg: 90  },
  { id: "strategy",  label: "Strategy",            title: "Marketing Strategy",     shortDesc: "Data-driven decisions on where to spend and where to cut",     icon: IconStrategy,  angleDeg: 150 },
  { id: "immersive", label: "Immersive",           title: "3D & Interactive",       shortDesc: "Premium visuals that make people stop scrolling",              icon: IconImmersive, angleDeg: 210 },
];

/* ── Geometry ── */
const toRad = (deg: number) => (deg * Math.PI) / 180;

function nodePosition(angleDeg: number, radius: number, cx: number, cy: number) {
  const rad = toRad(angleDeg);
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

/* ── Component ── */
export interface ServiceHubProps {
  onNodeClick?: (id: string, index: number) => void;
}

const ServiceHub = ({ onNodeClick }: ServiceHubProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

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

  /* SVG geometry */
  const svgSize = 700;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const orbitR = 235;
  const nodeR = 58;
  const iconSize = 72;
  const hubR = 62;
  const hubOuterR = 76;

  const positioned = nodes.map((n) => ({ ...n, ...nodePosition(n.angleDeg, orbitR, cx, cy) }));

  return (
    <div
      ref={sectionRef}
      className={`sh-section ${visible ? "sh-visible" : ""}`}
    >
      {/* ── Left column: Hero text + Legend ── */}
      <div className="sh-left">
        <div className="sh-hero">
          <h1 className="sh-hero-title anim-fade-up">Services</h1>
          <p className="sh-hero-sub anim-fade-up-d1">
            Strategy, systems, and digital infrastructure
            engineered to compound.
          </p>
        </div>

        <div className="sh-legend">
          <p className="sh-legend-heading anim-fade-up-d1">The Ecosystem</p>

          {nodes.map((node, i) => {
            const Icon = node.icon;
            const isActive = hoveredNode === node.id;
            return (
              <div
                key={node.id}
                className={`sh-legend-item ${isActive ? "sh-legend-item--active" : ""}`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onNodeClick?.(node.id, i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onNodeClick?.(node.id, i);
                  }
                }}
              >
                <div className="sh-legend-icon">
                  <Icon size={24} />
                </div>
                <div className="sh-legend-text">
                  <span className="sh-legend-title">{node.title}</span>
                  <span className="sh-legend-desc">{node.shortDesc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right column: SVG diagram ── */}
      <div className="sh-right">
        <div className="sh-svg-wrap">
          <svg
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            className="sh-svg"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Connecting lines */}
            {positioned.map((node, i) => (
              <line
                key={`line-${node.id}`}
                className={`sh-line ${hoveredNode === node.id ? "sh-line--active" : ""}`}
                x1={cx} y1={cy} x2={node.x} y2={node.y}
                style={{ animationDelay: `${0.2 + i * 0.1}s` }}
              />
            ))}

            {/* Orbit ring */}
            <circle className="sh-orbit" cx={cx} cy={cy} r={orbitR} />

            {/* Center hub */}
            <g className="sh-hub">
              <circle cx={cx} cy={cy} r={hubOuterR} fill="none" stroke="#507E78" strokeWidth="0.75" opacity="0.15" />
              <circle cx={cx} cy={cy} r={hubR} fill="rgba(12,10,8,0.92)" stroke="#507E78" strokeWidth="1.5" opacity="0.6" />
              <text x={cx} y={cy - 4} textAnchor="middle" className="sh-hub-label">Your Digital</text>
              <text x={cx} y={cy + 16} textAnchor="middle" className="sh-hub-label">Infrastructure</text>
            </g>

            {/* Service nodes */}
            {positioned.map((node, i) => {
              const Icon = node.icon;
              const isHovered = hoveredNode === node.id;
              const textY = node.y + nodeR + 26;

              return (
                <g
                  key={node.id}
                  className={`sh-node ${isHovered ? "sh-node--active" : ""}`}
                  style={{ animationDelay: `${0.5 + i * 0.08}s` }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => onNodeClick?.(node.id, i)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${node.title} — ${node.label}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNodeClick?.(node.id, i); }
                  }}
                >
                  <circle cx={node.x} cy={node.y} r={nodeR + 8} className="sh-node-glow" />
                  <circle cx={node.x} cy={node.y} r={nodeR} className="sh-node-bg" />

                  <foreignObject x={node.x - iconSize / 2} y={node.y - iconSize / 2} width={iconSize} height={iconSize}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                      <Icon size={iconSize} />
                    </div>
                  </foreignObject>

                  <text x={node.x} y={textY} textAnchor="middle" className="sh-node-label" style={{ animationDelay: `${0.8 + i * 0.08}s` }}>
                    {node.label}
                  </text>
                  <text x={node.x} y={textY + 22} textAnchor="middle" className="sh-node-title" style={{ animationDelay: `${0.85 + i * 0.08}s` }}>
                    {node.title}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ServiceHub;
