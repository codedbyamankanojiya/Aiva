import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        aiva: {
          purple: "#8B5CF6",
          "purple-dark": "#7C3AED",
          "purple-deeper": "#6D28D9",
          indigo: "#6366F1",
          blue: "#818CF8",
          "blue-light": "#A5B4FC",
          pink: "#EC4899",
          "pink-light": "#F9A8D4",
          lavender: "#C4B5FD",
        },
        glass: {
          white: "rgba(255,255,255,0.10)",
          "white-strong": "rgba(255,255,255,0.18)",
          border: "rgba(255,255,255,0.20)",
          "border-strong": "rgba(255,255,255,0.35)",
        },
      },
      backgroundImage: {
        "gradient-aiva":
          "linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #818CF8 100%)",
        "gradient-aiva-btn":
          "linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)",
        "gradient-card-purple":
          "linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(99,102,241,0.15) 100%)",
        "gradient-card-blue":
          "linear-gradient(135deg, rgba(129,140,248,0.20) 0%, rgba(165,180,252,0.15) 100%)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(139, 92, 246, 0.12)",
        "glass-lg": "0 12px 48px rgba(139, 92, 246, 0.18)",
        "aiva-glow": "0 0 24px rgba(139, 92, 246, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease forwards",
        "fade-in-up": "fadeInUp 0.6s ease forwards",
        "blob-1": "blob1 12s ease-in-out infinite",
        "blob-2": "blob2 14s ease-in-out infinite",
        "pulse-slow": "pulse 4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blob1: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -20px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.95)" },
        },
        blob2: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(-25px, 15px) scale(1.05)" },
          "66%": { transform: "translate(20px, -25px) scale(1.1)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
