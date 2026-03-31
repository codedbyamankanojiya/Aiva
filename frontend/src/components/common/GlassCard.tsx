import { type ReactNode, useRef } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "strong" | "purple" | "blue";
  onClick?: () => void;
  /** When true, adds a pulsing glow + micro-shake for AI processing states */
  thinking?: boolean;
}

const variantClass: Record<string, string> = {
  default: "glass-card",
  strong: "glass-card-strong",
  purple: "glass-card-purple",
  blue: "glass-card-blue",
};

export function GlassCard({
  children,
  className = "",
  variant = "default",
  onClick,
  thinking = false,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={cardRef}
      className={`${variantClass[variant]} glass-card-v2 p-5 ${thinking ? "thinking-pulse" : ""} ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={onClick}
    >
      {/* Shimmer border overlay — pointer-events: none so it never blocks clicks */}
      <div className="shimmer-border" aria-hidden="true" style={{ pointerEvents: "none" }} />
      {children}
    </motion.div>
  );
}
