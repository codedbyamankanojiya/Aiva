import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, LoaderCircle, Trash2, Upload } from "lucide-react";

interface ProfilePictureUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-20 w-20",
  md: "h-28 w-28",
  lg: "h-36 w-36 sm:h-40 sm:w-40",
};

export function ProfilePictureUpload({
  currentImage,
  onImageChange,
  size = "md",
  className = "",
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage || "");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(currentImage || "");
  }, [currentImage]);

  function triggerFileSelect() {
    fileInputRef.current?.click();
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Use an image under 2MB for faster loading.");
      return;
    }

    setError("");
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result;
      if (typeof result !== "string" || result.length === 0) {
        setError("We could not read that image. Try another file.");
        setIsUploading(false);
        return;
      }

      setPreviewUrl(result);
      onImageChange(result);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setError("Image upload failed. Try a different image.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setPreviewUrl("");
    setError("");
    onImageChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="relative inline-flex">
        <motion.button
          type="button"
          onClick={triggerFileSelect}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={`${SIZE_CLASSES[size]} relative overflow-hidden rounded-[1.75rem] border border-white/25 bg-gradient-to-br from-aiva-purple via-aiva-purple-dark to-aiva-indigo shadow-[0_18px_50px_rgba(91,47,163,0.32)]`}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile preview"
              className="absolute inset-0 object-cover w-full h-full"
              onError={() => {
                setPreviewUrl("");
                setError("That image could not be displayed.");
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_55%)]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-white/10" />

          {!previewUrl && (
            <div className="relative z-10 flex items-center justify-center w-full h-full text-white">
              <Camera size={size === "sm" ? 26 : size === "md" ? 34 : 42} />
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between px-3 py-2 text-left text-white bg-slate-950/50 backdrop-blur-sm">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">
                Profile Photo
              </div>
              <div className="text-xs font-semibold">
                {isUploading ? "Uploading..." : previewUrl ? "Tap to replace" : "Upload image"}
              </div>
            </div>
            <div className="flex items-center justify-center border h-9 w-9 rounded-2xl border-white/20 bg-white/10">
              {isUploading ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />}
            </div>
          </div>
        </motion.button>

        {previewUrl && !isUploading && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute flex items-center justify-center transition-colors bg-white border rounded-full shadow-lg -right-2 -top-2 h-9 w-9 border-white/60 text-rose-500 hover:bg-rose-50"
            aria-label="Remove profile picture"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="px-3 py-2 text-xs border rounded-2xl border-white/15 bg-slate-900/35 text-white/75 backdrop-blur-sm">
        Best results: square photo, under 2MB.
      </div>

      {error && (
        <div className="px-3 py-2 text-xs font-medium border rounded-2xl border-rose-200/70 bg-rose-50 text-rose-600">
          {error}
        </div>
      )}
    </div>
  );
}
