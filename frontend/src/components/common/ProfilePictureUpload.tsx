import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Check } from 'lucide-react';

interface ProfilePictureUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProfilePictureUpload({ 
  currentImage, 
  onImageChange, 
  size = 'md',
  className = '' 
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage || '');
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal preview with prop changes from parent
  useEffect(() => {
    if (currentImage !== undefined) {
      setPreviewUrl(currentImage);
    }
  }, [currentImage]);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      
      // Immediate update
      onImageChange(result);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPreviewUrl('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <motion.div
        className={`${sizeClasses[size]} relative rounded-2xl overflow-hidden cursor-pointer group shadow-xl ring-4 ring-white/10 dark:ring-black/20`}
        whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={triggerFileSelect}
        style={{ touchAction: 'manipulation' }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-aiva-purple to-aiva-indigo" />
        
        {/* Image or placeholder */}
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Profile" 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = ""; // Fallback to placeholder
              setPreviewUrl("");
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Camera size={size === 'sm' ? 24 : size === 'md' ? 32 : 40} />
            </motion.div>
          </div>
        )}
        
        {/* Overlay */}
        <AnimatePresence>
          {(isHovered || isUploading) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 flex items-center justify-center"
            >
              {isUploading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-white">
                  <Upload size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
                  <span className="text-xs font-medium">
                    {previewUrl ? 'Change' : 'Upload'}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
      </motion.div>
      
      {/* Remove button (Show only on hover) */}
      <AnimatePresence>
        {previewUrl && isHovered && !isUploading && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            whileHover={{ scale: 1.1, backgroundColor: '#ef4444' }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRemoveImage}
            className="absolute -top-3 -right-3 w-8 h-8 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-xl z-20 transition-colors border-2 border-white dark:border-gray-800"
          >
            <X size={14} strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
