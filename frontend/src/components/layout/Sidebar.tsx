import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, BookOpen, Users } from "lucide-react";

/* ── Icon nav items ──────────────────────────────────────── */
const iconNavItems = [
  {
    icon: Home,
    label: "Home",
    id: "home",
    path: "/",
    subItems: [
      { label: "Dashboard", path: "/" },
      { label: "Practice", path: "/practice" },
      { label: "Analytics", path: "/analytics" },
    ],
  },
  { icon: BookOpen, label: "Resources", id: "resources", path: "/resources" },
  {
    icon: Users,
    label: "Community",
    id: "community",
    path: "/community",
    subItems: [{ label: "About us", path: "/community" }],
  },
];

/* Height of the logo/header area at top */
const HEADER_HEIGHT = 64;

export function Sidebar() {
  const location = useLocation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [iconOffsets, setIconOffsets] = useState<Record<string, number>>({});
  const navRef = useRef<HTMLElement>(null);
  const iconRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const hoveredItem = iconNavItems.find((i) => i.id === hoveredId);
  const hasSubItems =
    hoveredItem && "subItems" in hoveredItem && hoveredItem.subItems;

  /* Which icon section is active based on current route */
  const activeId = (() => {
    const p = location.pathname;
    if (p === "/" || p === "/practice" || p === "/analytics") return "home";
    if (p.startsWith("/resources")) return "resources";
    if (p.startsWith("/community")) return "community";
    return "home";
  })();

  /* Measure icon positions after mount and on resize */
  const measureOffsets = useCallback(() => {
    if (!navRef.current) return;
    const navRect = navRef.current.getBoundingClientRect();
    const offsets: Record<string, number> = {};
    for (const [id, el] of Object.entries(iconRefs.current)) {
      if (el) {
        const elRect = el.getBoundingClientRect();
        offsets[id] = elRect.top - navRect.top;
      }
    }
    setIconOffsets(offsets);
  }, []);

  useEffect(() => {
    measureOffsets();
    window.addEventListener("resize", measureOffsets);
    return () => window.removeEventListener("resize", measureOffsets);
  }, [measureOffsets]);

  useEffect(() => {
    const timer = setTimeout(measureOffsets, 100);
    return () => clearTimeout(timer);
  }, [measureOffsets]);

  const panelTop = hoveredId ? (iconOffsets[hoveredId] ?? 0) : 0;

  return (
    <div
      className="fixed left-0 top-0 bottom-0 z-40"
      onMouseLeave={() => setHoveredId(null)}
    >
      {/* ── Full-height dark background column ─────────────── */}
      <div
        className="absolute inset-0 w-[68px]"
        style={{
          background:
            "linear-gradient(180deg, #2d1660 0%, #3b1f70 40%, #4a2d80 70%, #3b1f70 100%)",
        }}
      />

      {/* ── Logo area (above nav, part of the dark column) ── */}
      <Link
        to="/"
        className="relative z-10 flex items-center justify-center"
        style={{ width: 68, height: HEADER_HEIGHT }}
      >
        <img
          src="/Assets/Pfp.png"
          alt="Aiva"
          className="w-11 h-11 rounded-xl object-contain"
        />
      </Link>

      {/* ── Sidebar body: icon column + expand panel ───────── */}
      <div
        className="relative flex"
        style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
      >
        {/* Left icon column */}
        <div className="relative z-10 w-[68px] flex flex-col items-center pt-3 pb-5">
          <nav
            ref={navRef}
            className="flex flex-col items-center gap-4 flex-1"
          >
            {iconNavItems.map((item) => {
              const isActive = activeId === item.id;
              const isHovered = hoveredId === item.id;

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    iconRefs.current[item.id] = el;
                  }}
                  className="relative"
                  onMouseEnter={() => setHoveredId(item.id)}
                >
                  <Link
                    to={item.path}
                    className={`
                      flex flex-col items-center justify-center
                      w-[56px] py-2 rounded-xl
                      text-[9px] font-medium tracking-wide
                      transition-all duration-200
                      ${
                        isActive || isHovered
                          ? "bg-white/15 text-white"
                          : "text-white/45 hover:text-white/70"
                      }
                    `}
                  >
                    <item.icon
                      size={20}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                    <span className="mt-1 leading-none">{item.label}</span>
                  </Link>

                  {/* Active bar indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-bar"
                      className="absolute -left-[6px] top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full bg-white"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* ── Right expand panel (HOVER ONLY) ─────────────── */}
        <AnimatePresence>
          {hasSubItems && hoveredId && (
            <motion.div
              key={hoveredId}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 140, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="absolute left-[68px] overflow-hidden"
              style={{
                top: `${panelTop}px`,
                bottom: 0,
                background:
                  "linear-gradient(180deg, #7b5ba8 0%, #9173b8 30%, #a084c4 60%, #9173b8 100%)",
              }}
            >
              <motion.nav
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -10, opacity: 0 }}
                transition={{ duration: 0.16, delay: 0.04 }}
                className="flex flex-col gap-0 px-2.5 pt-2.5"
              >
                {hoveredItem!.subItems!.map((sub) => {
                  const isSubActive = location.pathname === sub.path;
                  return (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      className={`
                        block px-3.5 py-3 rounded-lg
                        text-[14px] font-semibold
                        transition-all duration-150
                        ${
                          isSubActive
                            ? "bg-white/20 text-white"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        }
                      `}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
