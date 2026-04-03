import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, BookOpen, Users, X } from "lucide-react";

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
  { 
    icon: BookOpen, 
    label: "Resources", 
    id: "resources", 
    path: "/resources",
  },
  {
    icon: Users,
    label: "Community",
    id: "community",
    path: "/community",
    subItems: [{ label: "About us", path: "/community" }],
  },
];


/* Larger sidebar sizes */
const HEADER_HEIGHT = 76;
const SIDEBAR_WIDTH = 80;
const ACTIVE_BG = "#9b7cc5";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [iconOffsets, setIconOffsets] = useState<Record<string, number>>({});
  const navRef = useRef<HTMLElement>(null);
  const iconRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!isOpen) return;
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /* Which icon section is active based on current route */
  const activeId = (() => {
    const p = location.pathname;
    if (p === "/" || p === "/practice" || p === "/analytics") return "home";
    if (p.startsWith("/resources")) return "resources";
    if (p.startsWith("/community")) return "community";
    return "home";
  })();

  const hoveredItem = iconNavItems.find((i) => i.id === hoveredId);
  const hasSubItems = hoveredItem && "subItems" in hoveredItem && hoveredItem.subItems;

  const displayId = hasSubItems ? hoveredId : null;
  const displaySubItems = hasSubItems ? hoveredItem.subItems : null;

  /* Measure icon positions */
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

  const panelTop = displayId ? (iconOffsets[displayId] ?? 0) : 0;

  const desktopSidebar = (
    <div
      className="fixed left-0 top-0 bottom-0 z-40 hidden lg:flex"
      onMouseLeave={() => setHoveredId(null)}
    >
      {/* ── Left dark column (scaled up) ─────────────────── */}
      <div
        className="relative z-20 h-full flex flex-col items-center shadow-lg"
        style={{
          width: SIDEBAR_WIDTH,
          background:
            "linear-gradient(180deg, #2d1660 0%, #3b1f70 40%, #4a2d80 70%, #3b1f70 100%)",
        }}
      >
        {/* Logo area */}
        <Link
          to="/"
          className="flex-shrink-0 flex items-center justify-center w-full"
          style={{ height: HEADER_HEIGHT }}
        >
          <img
            src="/Assets/Pfp.png"
            alt="Aiva"
            className="w-[52px] h-[52px] rounded-2xl object-contain bg-white/5"
          />
        </Link>

        {/* Top navigation */}
        <nav ref={navRef} className="flex flex-col items-center gap-5 w-full pt-4">
          {iconNavItems.map((item) => {
            const isActive = activeId === item.id;
            const isDisplayed = displayId === item.id;
            const isMerged = isDisplayed;

            return (
              <div
                key={item.id}
                ref={(el) => {
                  iconRefs.current[item.id] = el;
                }}
                className="relative w-full flex justify-end"
                onMouseEnter={() => setHoveredId(item.id)}
              >
                <Link
                  to={item.path}
                  className={`
                    flex flex-col items-center justify-center
                    w-[72px] py-2.5
                    text-[11px] font-medium tracking-wide
                    transition-all duration-200
                    ${isMerged ? "rounded-l-2xl rounded-r-none" : "rounded-xl w-[64px] mr-2"}
                    ${
                      isMerged
                        ? "text-white shadow-[-4px_0_10px_rgba(0,0,0,0.1)]"
                        : isActive
                        ? "bg-white/10 text-white"
                        : "text-white/45 hover:text-white/70 hover:bg-white/5"
                    }
                  `}
                  style={{
                    backgroundColor: isMerged ? ACTIVE_BG : undefined,
                    paddingRight: isMerged ? "8px" : "0",
                  }}
                >
                  <item.icon size={24} strokeWidth={isActive ? 2 : 1.5} />
                  <span className="mt-1.5 leading-none">{item.label}</span>
                </Link>

                {/* Active bar indicator (only if active AND not merged) */}
                {isActive && !isMerged && (
                  <motion.div
                    layoutId="sidebar-active-bar"
                    className="absolute -left-1 top-1/2 -translate-y-1/2 w-[4px] h-8 rounded-r-full bg-white"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* ── Right expand panel (HOVER ONLY contiguous shape) ── */}
      <AnimatePresence>
        {displaySubItems && (
          <motion.div
            key={displayId}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 140, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute z-10 overflow-hidden rounded-r-2xl rounded-bl-2xl shadow-xl"
            style={{
              left: SIDEBAR_WIDTH - 1,
              top: HEADER_HEIGHT + 16 + panelTop,
              height: "max-content",
              minHeight: "160px",
              backgroundColor: ACTIVE_BG,
            }}
          >
            <motion.nav
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
              transition={{ duration: 0.16, delay: 0.04 }}
              className="flex flex-col gap-1 px-3 py-3"
            >
              {displaySubItems.map((sub) => {
                const isSubActive = location.pathname === sub.path;
                return (
                  <Link
                    key={sub.path}
                    to={sub.path}
                    className={`
                      block px-3.5 py-3 rounded-lg
                      text-[15px] font-semibold tracking-wide
                      transition-all duration-150
                      ${
                        isSubActive
                          ? "bg-white/20 text-white shadow-sm"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
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
  );

  const mobileDrawer = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />

          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-[280px] shadow-2xl lg:hidden"
            style={{
              background:
                "linear-gradient(180deg, #2d1660 0%, #3b1f70 40%, #4a2d80 70%, #3b1f70 100%)",
            }}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-5" style={{ height: HEADER_HEIGHT }}>
                <Link to="/" onClick={onClose} className="flex items-center gap-3">
                  <img
                    src="/Assets/Pfp.png"
                    alt="Aiva"
                    className="w-10 h-10 rounded-2xl object-contain bg-white/5"
                  />
                  <div className="text-white">
                    <div className="text-base font-black leading-none">Aiva</div>
                    <div className="text-xs text-white/70 mt-0.5">Navigation</div>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/15 text-white transition-colors"
                  aria-label="Close navigation"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="px-3 pb-6 flex flex-col gap-1">
                {iconNavItems.map((item) => {
                  const isActive = activeId === item.id;
                  return (
                    <div key={item.id} className="flex flex-col">
                      <Link
                        to={item.path}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                          isActive ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <item.icon size={18} />
                        {item.label}
                      </Link>
                      {"subItems" in item && item.subItems && isActive && (
                        <div className="pl-11 pr-2 pb-2">
                          {item.subItems.map((sub) => {
                            const isSubActive = location.pathname === sub.path;
                            return (
                              <Link
                                key={sub.path}
                                to={sub.path}
                                onClick={onClose}
                                className={`block px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors ${
                                  isSubActive
                                    ? "bg-white/15 text-white"
                                    : "text-white/70 hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                {sub.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {desktopSidebar}
      {mobileDrawer}
    </>
  );
}
