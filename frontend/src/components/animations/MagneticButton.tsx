import { useRef, useState, useCallback, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  magnetStrength?: number;
  /** Radius (in px) within which the magnetic effect activates */
  magnetRadius?: number;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export function MagneticButton({
  children,
  className = "",
  magnetStrength = 0.35,
  magnetRadius = 100,
  onClick,
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Motion values for magnetic displacement
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 500, damping: 15, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 500, damping: 15, mass: 0.5 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const dist = Math.sqrt(distX * distX + distY * distY);

      if (dist < magnetRadius) {
        const factor = magnetStrength * (1 - dist / magnetRadius);
        x.set(distX * factor);
        y.set(distY * factor);
      } else {
        x.set(0);
        y.set(0);
      }
    },
    [disabled, magnetRadius, magnetStrength, x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;

      // Create shockwave ripple
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const rippleX = e.clientX - rect.left;
        const rippleY = e.clientY - rect.top;
        const id = Date.now();
        setRipples((prev) => [...prev, { id, x: rippleX, y: rippleY }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 700);
      }

      // Don't call onClick here — let it bubble to the nested Button
    },
    [disabled]
  );

  return (
    <motion.div
      ref={ref}
      className={`magnetic-button-wrapper relative inline-block ${className}`}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
    >
      {children}

      {/* Shockwave ripples — pointer-events: none */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
            background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 12, opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      ))}
    </motion.div>
  );
}
