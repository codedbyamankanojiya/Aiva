import { motion } from 'framer-motion';
import { Button } from '@/components/common/Button';
import { MagneticButton } from '@/components/animations/MagneticButton';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function AnimatedButton({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  loading = false,
  icon,
  className = '',
  ...props 
}: AnimatedButtonProps) {
  return (
    <MagneticButton
      className={fullWidth ? 'w-full' : ''}
      magnetStrength={0.3}
      magnetRadius={80}
    >
      <motion.div
        className="relative overflow-hidden rounded-inherit"
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Shimmer sweep overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ width: '200%' }}
        />
        
        <Button
          variant={variant}
          size={size}
          fullWidth={fullWidth}
          className={`relative z-10 transition-all duration-300 ${className}`}
          {...props}
        >
          <div className="flex items-center justify-center gap-2">
            {loading ? (
              <motion.div
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              icon && (
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {icon}
                </motion.div>
              )
            )}
            <motion.span
              key={loading ? 'loading' : 'content'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.span>
          </div>
        </Button>
      </motion.div>
    </MagneticButton>
  );
}
