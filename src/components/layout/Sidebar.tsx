import { useState, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, BookOpen, Users, UserCircle, Settings } from "lucide-react";

/* ── Icon nav items (left dark column) ───────────────────── */
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

export function Sidebar() {
  const location = useLocation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredTop, setHoveredTop] = useState(0);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const hoveredItem = iconNavItems.find((i) => i.id === hoveredId);
  const hasSubItems =
    hoveredItem && "subItems" in hoveredItem && hoveredItem.subItems;

  /* Which icon section is active based on current path */
  const activeId = (() => {
    const p = location.pathname;
    if (p === "/" || p === "/practice" || p === "/analytics") return "home";
    if (p.startsWith("/resources")) return "resources";
    if (p.startsWith("/community")) return "community";
    if (p.startsWith("/profile")) return "profile";
    if (p.startsWith("/settings")) return "settings";
    return "home";
  })();

  function handleHover(id: string, el: HTMLElement) {
    setHoveredId(id);
    // Get the Y offset of the hovered icon relative to the sidebar
    if (sidebarRef.current) {
      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setHoveredTop(elRect.top - sidebarRect.top);
    }
  }

  return (
    <div
      ref={sidebarRef}
      className="fixed left-0 top-0 bottom-0 z-40 flex"
      onMouseLeave={() => setHoveredId(null)}
    >
      {/* ── Left dark column (icons) ───────────────────────── */}
      <div className="w-20 h-full flex flex-col items-center py-5 bg-gradient-to-b from-[#2e1065] via-[#3b1a7e] to-[#2e1065] shadow-xl">
        {/* Robot logo */}
        <Link to="/" className="mb-6">
          <img
            src="/Assets/Pfp.png"
            alt="Aiva"
            className="w-12 h-12 rounded-xl object-contain"
          />
        </Link>

        {/* Icon buttons */}
        <nav className="flex flex-col items-center gap-1 flex-1">
          {iconNavItems.map((item) => {
            const isActive = activeId === item.id;
            const isHovered = hoveredId === item.id;

            return (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={(e) => handleHover(item.id, e.currentTarget)}
              >
                <Link
                  to={item.path}
                  className={`flex flex-col items-center gap-0.5 w-[4.5rem] py-2.5 rounded-xl text-[10px] font-medium transition-all duration-200 ${
                    isActive || isHovered
                      ? "bg-white/20 text-white"
                      : "text-white/55 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span className="mt-0.5">{item.label}</span>
                </Link>

                {/* Active bar indicator on left edge */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bar"
                    className="absolute -left-[2px] top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full bg-white"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom icons — Profile & Settings */}
        <div className="flex flex-col items-center gap-1 pb-2">
          {[
            { icon: UserCircle, label: "Profile", id: "profile", path: "/profile" },
            { icon: Settings, label: "Settings", id: "settings", path: "/settings" },
          ].map((item) => {
            const isActive = activeId === item.id;
            return (
              <div key={item.id} className="relative">
                <Link
                  to={item.path}
                  className={`flex flex-col items-center gap-0.5 w-[4.5rem] py-2.5 rounded-xl text-[10px] font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/55 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span className="mt-0.5">{item.label}</span>
                </Link>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bar"
                    className="absolute -left-[2px] top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full bg-white"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right expand panel (sub-items on hover) ────────── */}
      <AnimatePresence>
        {hasSubItems && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 170, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="h-full overflow-hidden bg-gradient-to-b from-[#7c4dbd] via-[#8b5dc0] to-[#7c4dbd] shadow-lg border-r border-white/10"
          >
            <motion.nav
              initial={{ x: -16, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -16, opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.06 }}
              className="flex flex-col gap-1.5 px-3"
              style={{ paddingTop: `${hoveredTop}px` }}
            >
              {hoveredItem.subItems!.map((sub) => {
                const isSubActive = location.pathname === sub.path;
                return (
                  <Link
                    key={sub.path}
                    to={sub.path}
                    className={`block px-4 py-2.5 rounded-lg text-[15px] font-semibold transition-all duration-150 ${
                      isSubActive
                        ? "bg-white/25 text-white shadow-sm"
                        : "text-white/80 hover:bg-white/15 hover:text-white"
                    }`}
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
}
