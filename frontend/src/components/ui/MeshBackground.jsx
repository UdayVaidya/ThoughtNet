import React from 'react';

/**
 * Performance-safe mesh background.
 * Pure CSS keyframe animations — no SVG filters, no GSAP, no blur stacking.
 * All transforms are GPU-accelerated.
 */
export default function MeshBackground() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
      willChange: 'auto',
    }}>
      {/* Amber primary blob */}
      <div style={{
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.13) 0%, transparent 70%)',
        top: -250,
        left: -180,
        animation: 'meshDrift1 28s ease-in-out infinite alternate',
        willChange: 'transform',
      }} />

      {/* Teal secondary blob */}
      <div style={{
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 50%, rgba(6,214,160,0.09) 0%, transparent 70%)',
        bottom: -200,
        right: -130,
        animation: 'meshDrift2 34s ease-in-out infinite alternate',
        willChange: 'transform',
      }} />

      {/* Subtle grid — single background-image, no blur */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(245,158,11,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(245,158,11,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }} />
    </div>
  );
}
