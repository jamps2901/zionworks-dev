import { useRef } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

// Nudges an element a few px toward the cursor on hover, springing back on
// leave. Attach `ref` to the element and spread `handlers` onto it; use the
// returned x/y motion values as `style={{ x, y }}` on the same (or a
// wrapping) element.
export function useMagneticHover(strength = 0.3) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });

  const handlers = {
    onMouseMove: (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const offsetX = e.clientX - (rect.left + rect.width / 2);
      const offsetY = e.clientY - (rect.top + rect.height / 2);
      x.set(offsetX * strength);
      y.set(offsetY * strength);
    },
    onMouseLeave: () => {
      x.set(0);
      y.set(0);
    },
  };

  return { ref, x: springX, y: springY, handlers };
}

// Subtle 3D tilt that follows the cursor across an element -- reset to flat
// on leave. Rotation is clamped to `maxDeg` so it reads as reactive polish,
// not a gimmick.
export function useTiltHover(maxDeg = 8) {
  const ref = useRef<HTMLElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handlers = {
    onMouseMove: (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rotateY.set(px * maxDeg * 2);
      rotateX.set(-py * maxDeg * 2);
    },
    onMouseLeave: () => {
      rotateX.set(0);
      rotateY.set(0);
    },
  };

  return { ref, rotateX: springRotateX, rotateY: springRotateY, handlers };
}
