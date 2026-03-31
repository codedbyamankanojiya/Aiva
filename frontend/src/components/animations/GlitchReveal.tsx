import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface GlitchRevealProps {
  children: ReactNode;
  className?: string;
  /** Delay before the reveal starts (seconds) */
  delay?: number;
  /** Duration of the glitch phase (seconds) */
  glitchDuration?: number;
  /** Type of reveal effect */
  variant?: "chromatic" | "scanline" | "both";
  /** Whether to show the reveal on mount */
  triggerOnMount?: boolean;
}

export function GlitchReveal({
  children,
  className = "",
  delay = 0,
  glitchDuration: _glitchDuration = 0.1,
  variant = "chromatic",
  triggerOnMount = true,
}: GlitchRevealProps) {
  if (variant === "scanline") {
    return (
      <motion.div
        className={`glitch-reveal ${className}`}
        initial={{ opacity: 0, y: 10 }}
        animate={triggerOnMount ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        style={{ position: "relative", overflow: "hidden" }}
      >
        {/* Scanline sweep overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-50"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(139,92,246,0.15) 50%, transparent 100%)",
            height: "4px",
          }}
          initial={{ top: 0, opacity: 1 }}
          animate={triggerOnMount ? { top: "100%", opacity: 0 } : {}}
          transition={{ duration: 0.8, delay: delay + 0.1, ease: "easeInOut" }}
        />
        {children}
      </motion.div>
    );
  }

  // Chromatic / both: use inline animate with keyframe arrays
  return (
    <motion.div
      className={`glitch-reveal ${className}`}
      initial={{ opacity: 0, filter: "blur(4px)", clipPath: "inset(0 100% 0 0)" }}
      animate={
        triggerOnMount
          ? {
              opacity: [0, 1, 0.8, 1],
              filter: [
                "blur(4px)",
                "blur(0px) drop-shadow(2px 0 #EC4899) drop-shadow(-2px 0 #6366F1)",
                "blur(0px) drop-shadow(1px 0 #EC4899) drop-shadow(-1px 0 #6366F1)",
                "blur(0px)",
              ],
              clipPath: [
                "inset(0 100% 0 0)",
                "inset(0 0% 0 0)",
                "inset(0 0% 0 0)",
                "inset(0 0% 0 0)",
              ],
            }
          : { opacity: 0, filter: "blur(4px)", clipPath: "inset(0 100% 0 0)" }
      }
      transition={{
        duration: 0.5,
        delay,
        times: [0, 0.2, 0.5, 1],
        ease: "easeOut",
      }}
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Scanline overlay for "both" variant */}
      {variant === "both" && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-50"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139,92,246,0.03) 2px, rgba(139,92,246,0.03) 4px)",
          }}
          initial={{ opacity: 1 }}
          animate={triggerOnMount ? { opacity: 0 } : {}}
          transition={{ duration: 1.2, delay: delay + 0.3 }}
        />
      )}
      {children}
    </motion.div>
  );
}

// ─── Stagger container for wrapping multiple GlitchReveal children ───
interface StaggerGroupProps {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
  variant?: "chromatic" | "scanline" | "both";
}

export function StaggerGroup({
  children,
  staggerDelay = 0.08,
  className = "",
  variant = "chromatic",
}: StaggerGroupProps) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <GlitchReveal key={i} delay={i * staggerDelay} variant={variant}>
          {child}
        </GlitchReveal>
      ))}
    </div>
  );
}
