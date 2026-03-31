import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Sun icon for light mode */}
        <motion.div
          initial={{ rotate: 0, scale: 1 }}
          animate={{ 
            rotate: theme === 'light' ? 0 : 180,
            scale: theme === 'light' ? 1 : 0,
            opacity: theme === 'light' ? 1 : 0
          }}
          transition={{ 
            rotate: { duration: 0.5, ease: 'easeInOut' },
            scale: { duration: 0.3, ease: 'easeInOut' },
            opacity: { duration: 0.2 }
          }}
          className="absolute"
        >
          <Sun size={20} className="text-yellow-500" />
        </motion.div>

        {/* Moon icon for dark mode */}
        <motion.div
          initial={{ rotate: 0, scale: 0 }}
          animate={{ 
            rotate: theme === 'dark' ? 0 : -180,
            scale: theme === 'dark' ? 1 : 0,
            opacity: theme === 'dark' ? 1 : 0
          }}
          transition={{ 
            rotate: { duration: 0.5, ease: 'easeInOut' },
            scale: { duration: 0.3, ease: 'easeInOut' },
            opacity: { duration: 0.2 }
          }}
          className="absolute"
        >
          <Moon size={20} className="text-blue-400" />
        </motion.div>
      </div>

      {/* Subtle glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: theme === 'light' 
            ? '0 0 20px rgba(251, 191, 36, 0.3)' 
            : '0 0 20px rgba(96, 165, 250, 0.3)'
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}
