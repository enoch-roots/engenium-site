# Services Page Redesign: Hub & Spoke Infographic + Accordion Cards

## The Problem

The current `/services` page is a wall of text — 6 service cards, each with a description, highlight quote, and 4-6 bullet points, all visible at once. There's no visual architecture showing how services relate. A visitor scanning the page has to read everything to understand the offering.

## The Solution — Two Complementary Changes

### 1. Hub & Spoke Infographic (New Section)
### 2. Accordion Cards (Modify Existing MagicBento)

---

## Part 1: Hub & Spoke Infographic

### Concept

A full-width SVG diagram placed **between the hero and the card grid**. At the center: the Engenium identity ("Your Digital Infrastructure"). Radiating outward: 6 service nodes connected by animated lines. The visual immediately communicates: "these aren't isolated services — they're an interconnected system."

### Layout Architecture

```
                    Full-Stack Web
                        │
          GEO/SEO ──────┼────── Analytics
                       ╱ ╲
                      ╱   ╲
          Strategy ──╱─ ● ─╲── Platform
                      ╲   ╱
                       ╲ ╱
                   3D & Interactive
```

**Desktop (≥768px):** Hexagonal arrangement — 6 nodes evenly spaced around a center circle, connected by lines through the hub. Each node shows the existing ServiceIcon + title. The center shows "Your Digital Infrastructure" or the Engenium mark.

**Mobile (<768px):** Vertical linear layout — center node at top, services stacked below with connecting lines running vertically. More compact, still shows the ecosystem relationship.

### Visual Design (Matching Existing Palette)

| Element | Style |
|---------|-------|
| Center hub | `#507E78` (verdigris) circle, 1.5px stroke, 0.6 opacity, subtle radial glow |
| Center label | Cormorant 400 italic, `--warm-linen`, 1.1rem |
| Service nodes | 60px circles, `rgba(12,10,8,0.8)` fill, `#507E78` 1px stroke at 0.4 opacity |
| Node icons | Existing ServiceIcons at 32px, centered in node |
| Node labels | JetBrains Mono 0.65rem, uppercase, `--warm-linen` at 0.5 opacity, positioned below node |
| Node titles | Cormorant 400, 1rem, `--warm-linen` at 0.8 opacity, below label |
| Connecting lines | `#507E78` at 0.15 opacity, 0.75px, dashed `4 4` stroke-dasharray |
| Active/hover lines | Animate to `#A86040` at 0.4 opacity, solid |

### GSAP Entrance Animations (Staggered)

The infographic animates in when it scrolls into view (IntersectionObserver trigger):

1. **t=0s** — Center hub fades in + scales from 0.8→1.0 (0.6s ease-out)
2. **t=0.2s** — Connecting lines draw in from center outward using `stroke-dashoffset` (0.8s each, staggered 0.1s per line)
3. **t=0.5s** — Service nodes fade in + scale from 0.85→1.0 (0.5s each, staggered 0.08s clockwise starting from top)
4. **t=0.8s** — Labels and titles fade up 8px (0.4s each, matching node stagger)

Total animation: ~1.6s from first element to last settled.

### Interaction (Subtle, Not Full Interactive)

Since you chose "Animated SVG" rather than full React interactivity, keep interactions lightweight:

- **Hover a node:** Its connecting line brightens (verdigris → aged-clay transition, 0.3s). The node gets a subtle outer glow: `filter: drop-shadow(0 0 8px rgba(168,96,64,0.3))`.
- **Click a node:** Smooth-scrolls to the corresponding accordion card below.
- These are CSS-only interactions layered on top of the animated SVG — no React state management needed.

### Sizing

- **Desktop:** max-width 700px, height ~420px, centered with `margin: 0 auto`
- **Tablet:** max-width 500px, height ~360px
- **Mobile:** max-width 320px, height ~500px (vertical layout)
- **Section padding:** `padding: clamp(2rem, 5vh, 4rem) clamp(1.5rem, 8vw, 6rem)`

---

## Part 2: Accordion Cards

### Concept

Transform the existing MagicBento cards so that bullet lists are **hidden by default** and expandable. Each card shows only: Icon, Label, Title, Description, and Highlight quote. A subtle "See details" affordance lets users expand to see bullets.

This cuts the visible text per card by ~40-50%, dramatically reducing the wall-of-text feel while keeping all content accessible.

### What Changes in MagicBento

**Default (collapsed) state shows:**
- Icon
- Label (monospace uppercase)
- Title (Cormorant serif)
- Description (1-2 sentences)
- Highlight quote (italic, aged-clay)
- Expand indicator (small `+` or chevron, bottom-right)

**Expanded state adds:**
- Bullet list (slides down with CSS transition)
- Indicator rotates to `×` or chevron-up

### Implementation Approach

Add a `useState` per card (or a single state tracking which card index is open). The bullet `<ul>` wraps in a container with:

```css
.mb-card__details {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s ease;
  overflow: hidden;
}

.mb-card__details--open {
  grid-template-rows: 1fr;
}

.mb-card__details-inner {
  min-height: 0;
}
```

This gives a smooth height animation without JavaScript measurement. The `grid-template-rows: 0fr → 1fr` trick is the cleanest CSS-only accordion pattern.

### Expand Trigger Styling

A small, understated trigger — not a loud button. Options:

**Recommended:** A thin horizontal rule with centered text:

```
────── Details ──────
```

Styled as:
- JetBrains Mono, 0.6rem, uppercase, 0.15em tracking
- `--warm-linen` at 0.25 opacity (hover: 0.45)
- Thin lines: `--verdigris` at 0.15 opacity
- `cursor: pointer`
- Transitions on hover

When expanded, text changes to "Collapse" and the lines contract.

### Card Height Consistency

With bullets hidden, non-featured cards will have more consistent heights. The 2-column grid will look much cleaner because cards won't have wildly different lengths.

---

## Part 3: Page Assembly

### New Page Structure (top to bottom)

```
┌─────────────────────────────────────────┐
│  Hero: "Services" + subtitle            │  (unchanged)
├─────────────────────────────────────────┤
│  NEW: Hub & Spoke Infographic           │  ← new section
│  "The Engenium Ecosystem"               │
│  Animated SVG, ~420px tall              │
├─────────────────────────────────────────┤
│  Service Cards (Accordion)              │  (modified MagicBento)
│  Collapsed by default, expandable       │
├─────────────────────────────────────────┤
│  CTA: "Ready to see what's possible?"   │  (unchanged)
├─────────────────────────────────────────┤
│  Footer                                 │  (unchanged)
└─────────────────────────────────────────┘
```

### Animation Flow

1. Page loads → Hero fades up (existing `anim-fade-up`)
2. User scrolls → Infographic enters viewport → GSAP triggers hub-and-spoke draw-in
3. Cards below fade up with existing stagger delays
4. User clicks node or scrolls to cards → Accordion interaction available

---

## Part 4: New Files / Modified Files

### New Files

| File | Purpose |
|------|---------|
| `app/components/ServiceHub.tsx` | Hub & spoke SVG component with GSAP animations |
| `app/components/ServiceHub.css` | Styles for the infographic section |

### Modified Files

| File | Changes |
|------|---------|
| `app/services/page.tsx` | Import ServiceHub, add section between hero and MagicBento |
| `app/components/MagicBento.tsx` | Add accordion state, wrap bullets in collapsible container, add expand trigger |
| `app/components/MagicBento.css` | Add `.mb-card__details` accordion styles, expand trigger styles |

### No Changes Needed

| File | Reason |
|------|--------|
| `ServiceIcons.tsx` | Reused as-is in both infographic nodes and cards |
| `BorderGlow.tsx` | Cards still use BorderGlow, no changes needed |
| `globals.css` | Existing animation classes sufficient |
| `Footer.tsx` | Unchanged |

---

## Part 5: Responsive Behavior Summary

### Desktop (≥1200px)
- Infographic: Full hexagonal layout, 700px wide, hover interactions
- Cards: 2-column grid, all collapsed, click to expand

### Tablet (768px–1199px)
- Infographic: Slightly smaller hexagonal layout, 500px wide
- Cards: 2-column grid, same accordion behavior

### Mobile (<768px)
- Infographic: Vertical/linear layout, nodes stacked, connecting line runs vertically
- Cards: Single column stack, same accordion behavior
- Featured cards lose side-by-side icon layout (already handled in existing CSS)

### Small phones (≤380px)
- Infographic: Further compressed, smaller node circles (48px), tighter spacing
- Cards: Reduced padding (already handled)

---

## Part 6: Performance Considerations

- **GSAP** is already in the project (used elsewhere) — no new dependency
- **IntersectionObserver** for scroll-triggered animation — no continuous polling
- **SVG** is lightweight — the entire infographic will be <5KB
- **CSS-only accordion** — no JS height calculations, no layout thrashing
- **Dynamic import** ServiceHub with `ssr: false` to match existing pattern
- **No new fonts or colors** — everything uses existing design tokens
