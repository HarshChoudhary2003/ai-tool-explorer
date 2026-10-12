import { ReactNode, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees */
  maxTilt?: number;
  /** Hover scale factor */
  scale?: number;
}

/**
 * Pointer-driven 3D tilt wrapper with spring physics and a tracking glare.
 * Children with `[transform:translateZ(Npx)]` pop out of the card plane.
 * Falls back to a plain div when the user prefers reduced motion.
 */
export function TiltCard({
  children,
  className = "",
  maxTilt = 6,
  scale = 1.02,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const glareOpacity = useMotionValue(0);

  const sx = useSpring(px, { stiffness: 260, damping: 24 });
  const sy = useSpring(py, { stiffness: 260, damping: 24 });
  const glareSpring = useSpring(glareOpacity, { stiffness: 200, damping: 26 });

  const rotateX = useTransform(sy, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(sx, [0, 1], [-maxTilt, maxTilt]);
  const glareX = useTransform(sx, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(sy, [0, 1], ["0%", "100%"]);
  const glare = useTransform(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(circle at ${x} ${y}, hsl(var(--primary) / 0.14), transparent 65%)`
  );

  const handleMove = (e: React.PointerEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
    glareOpacity.set(1);
  };

  const handleLeave = () => {
    px.set(0.5);
    py.set(0.5);
    glareOpacity.set(0);
  };

  if (reduceMotion) {
    return <div className={`h-full ${className}`}>{children}</div>;
  }

  return (
    <div style={{ perspective: 1200 }} className="h-full">
      <motion.div
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        whileHover={{ scale }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`relative h-full ${className}`}
      >
        {children}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glare, opacity: glareSpring }}
        />
      </motion.div>
    </div>
  );
}
