import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all cursor-pointer select-none";

  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-aiva-purple-dark to-aiva-indigo text-white shadow-glass hover:shadow-aiva-glow",
    secondary:
      "bg-white/20 backdrop-blur-md border border-white/30 text-gray-700 hover:bg-white/30",
    ghost:
      "bg-transparent text-aiva-purple hover:bg-aiva-purple/10",
  };

  const sizes: Record<string, string> = {
    sm: "px-4 py-1.5 text-sm",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3 text-base",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
