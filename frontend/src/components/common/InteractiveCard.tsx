import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  scale?: boolean;
  glow?: boolean;
  tilt?: boolean;
}

export function InteractiveCard({ 
  children, 
  className = '', 
  onClick,
  hover = true,
  scale = true,
  glow = true,
  tilt = true
}: InteractiveCardProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      onClick={onClick}
      whileHover={hover ? {
        scale: scale ? 1.02 : 1,
        boxShadow: glow ? '0 20px 40px rgba(139, 92, 246, 0.2)' : 'none',
        transition: { duration: 0.3 }
      } : {}}
      whileTap={{ scale: 0.98 }}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Glow effect — behind the card, never blocks clicks */}
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-aiva-purple/20 to-aiva-indigo/20 blur-xl opacity-0 pointer-events-none"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ zIndex: -1 }}
        />
      )}
      
      {/* Content wrapper */}
      <div
        className="relative h-full"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
