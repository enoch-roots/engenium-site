"use client";

import "./HowWeWork.css";

/* ── Section data ── */
interface Block {
  headline: string;
  body: string;
}

interface Section {
  number: string;
  label: string;
  blocks: Block[];
}

const sections: Section[] = [
  {
    number: "01",
    label: "The Process",
    blocks: [
      {
        headline: "Discovery first. Always.",
        body: "We don\u2019t quote before we listen. Every engagement starts with understanding what you\u2019re actually trying to solve\u00a0\u2014\u00a0not what you think you need to buy.",
      },
      {
        headline: "Build in weeks, not months.",
        body: "Core infrastructure goes live fast. We scope tight, ship, and then iterate with real data\u00a0\u2014\u00a0not assumptions.",
      },
      {
        headline: "Launch is day one, not the finish line.",
        body: "Analytics run from the first visitor. Optimization is continuous\u00a0\u2014\u00a0not a separate invoice.",
      },
    ],
  },
  {
    number: "02",
    label: "The Philosophy",
    blocks: [
      {
        headline: "Systems, not services.",
        body: "We don\u2019t sell you a website and a CRM and a dashboard. We build one system where everything talks to everything.",
      },
      {
        headline: "Infrastructure that compounds.",
        body: "Every automation, every integration, every data point makes the next one more valuable. This is the opposite of duct tape.",
      },
      {
        headline: "We don\u2019t do partial.",
        body: "If the analytics aren\u2019t connected to the CRM, the CRM isn\u2019t connected to the site, and the site isn\u2019t capturing intent\u00a0\u2014\u00a0it\u2019s not done yet.",
      },
    ],
  },
  {
    number: "03",
    label: "The Partnership",
    blocks: [
      {
        headline: "You get a team, not a ticket queue.",
        body: "Strategy, development, and platform management from people who know your business by name.",
      },
      {
        headline: "Visibility into everything.",
        body: "Your dashboard. Your data. Your domain. We build on infrastructure you own.",
      },
      {
        headline: "Built to hand off. Designed to keep.",
        body: "Everything we build is yours. But most clients stay because the system keeps getting smarter.",
      },
    ],
  },
];

/* ── Component ── */
const HowWeWork = () => {
  return (
    <div className="hww">
      {sections.map((section, si) => (
        <div key={si} className="hww__section">
          {/* Section label */}
          <div className="hww__section-header">
            <span className="hww__section-number">{section.number}</span>
            <span className="hww__section-label">{section.label}</span>
          </div>

          {/* Blocks */}
          {section.blocks.map((block, bi) => (
            <div
              key={bi}
              className={`hww__block ${bi === 0 ? "hww__block--first" : ""}`}
            >
              <h2 className="hww__headline">{block.headline}</h2>
              <p className="hww__body">{block.body}</p>
            </div>
          ))}

          {/* Section divider (not after last section) */}
          {si < sections.length - 1 && <div className="hww__divider" />}
        </div>
      ))}
    </div>
  );
};

export default HowWeWork;
