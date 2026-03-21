import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  percentLabel?: string;
  status?: string;
  statusColor?: string;
  color?: "blue" | "purple" | "green" | "amber";
  size?: "sm" | "md";
}

const barColors: Record<string, string> = {
  blue: "bg-blue-600",
  purple: "bg-aiva-purple",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  percentLabel,
  status,
  statusColor = "text-emerald-600",
  color = "blue",
  size = "md",
}: ProgressBarProps) {
  const percent = Math.min((value / max) * 100, 100);
  const heightClass = size === "sm" ? "h-1.5" : "h-2.5";

  return (
    <div className="w-full">
      {(label || percentLabel) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-sm font-semibold text-gray-700">{label}</span>
          )}
          <div className="flex items-center gap-2">
            {percentLabel && (
              <span className="text-sm font-bold text-gray-600">
                {percentLabel}
              </span>
            )}
            {status && (
              <span className={`text-xs font-medium ${statusColor}`}>
                {status}
              </span>
            )}
          </div>
        </div>
      )}
      <div
        className={`w-full ${heightClass} bg-gray-200/60 rounded-full overflow-hidden`}
      >
        <motion.div
          className={`${heightClass} ${barColors[color]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
