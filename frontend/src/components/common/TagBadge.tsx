interface TagBadgeProps {
  label: string;
  variant?: "default" | "purple" | "blue";
}

const variants: Record<string, string> = {
  default:
    "bg-white/30 text-gray-700 border border-white/40",
  purple:
    "bg-aiva-purple/10 text-aiva-purple border border-aiva-purple/20",
  blue:
    "bg-aiva-indigo/10 text-aiva-indigo border border-aiva-indigo/20",
};

export function TagBadge({ label, variant = "default" }: TagBadgeProps) {
  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${variants[variant]}`}
    >
      {label}
    </span>
  );
}
