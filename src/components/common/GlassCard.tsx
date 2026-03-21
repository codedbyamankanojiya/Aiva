import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "strong" | "purple" | "blue";
  onClick?: () => void;
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
}: GlassCardProps) {
  return (
    <motion.div
      className={`${variantClass[variant]} p-5 ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
