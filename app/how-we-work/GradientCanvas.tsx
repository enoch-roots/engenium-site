"use client";

import { memo } from "react";
import { ShaderGradientCanvas, ShaderGradient } from "shadergradient";

interface GradientCanvasProps {
  config: Record<string, unknown>;
}

/**
 * Memoised wrapper around ShaderGradientCanvas.
 *
 * The shadergradient library creates new THREE.MeshPhysicalMaterial
 * instances every time <ShaderGradient> re-renders. Without memo,
 * parent state changes (e.g. the TrueFocusHero focus-cycle timer)
 * cascade into this component and generate a flood of
 * `material (onInit)` console logs + wasted GPU allocations.
 */
const GradientCanvas = memo(function GradientCanvas({ config }: GradientCanvasProps) {
  return (
    <ShaderGradientCanvas
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <ShaderGradient {...config} />
    </ShaderGradientCanvas>
  );
});

export default GradientCanvas;
