import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { UserCircle, Settings, LogOut, ChevronDown } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/analytics": "Analytics",
  "/practice": "Practice",
  "/interview": "Interview",
  "/community": "Community",
  "/resources": "Resources",
  "/profile": "Profile",
  "/settings": "Settings",
};

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const title = pageTitles[location.pathname] || "Dashboard";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = user
    ? `${(user.firstName || "A")[0]}${(user.lastName || "I")[0]}`.toUpperCase()
    : "AI";

  async function handleLogout() {
    setDropdownOpen(false);
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between"
    >
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
        <span className="text-aiva-purple">Aiva</span>
        <span className="mx-2 text-gray-300">|</span>
        {title}
      </h1>

      {/* User profile dropdown */}
      <div className="relative" ref={dropdownRef}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1 bg-white/40 backdrop-blur-md ring-1 ring-white/30 hover:bg-white/60 transition-all cursor-pointer"
        >
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-aiva-purple to-aiva-indigo flex items-center justify-center text-white text-sm font-bold shadow-md overflow-hidden ring-2 ring-white/20">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          {/* Name */}
          {user && (
            <span className="text-sm font-semibold text-gray-700 hidden sm:block max-w-[120px] truncate">
              {user.firstName} {user.lastName}
            </span>
          )}
          <ChevronDown
            size={14}
            className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </motion.button>

        {/* Dropdown menu */}
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 border border-white/50 dark:border-white/10 overflow-hidden"
            >
              {/* User info header */}
              {user && (
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.email}</p>
                </div>
              )}

              {/* Menu items */}
              <div className="py-1.5">
                <DropdownItem
                  icon={UserCircle}
                  label="Profile"
                  onClick={() => { setDropdownOpen(false); navigate("/profile"); }}
                />
                <DropdownItem
                  icon={Settings}
                  label="Settings"
                  onClick={() => { setDropdownOpen(false); navigate("/settings"); }}
                />
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 py-1.5">
                <DropdownItem
                  icon={LogOut}
                  label="Sign Out"
                  onClick={handleLogout}
                  danger
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

/* ── Dropdown item ── */
function DropdownItem({ icon: Icon, label, onClick, danger = false }: {
  icon: React.ElementType; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-all ${
        danger
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
      }`}
    >
      <Icon size={16} className={danger ? "text-red-500" : "text-gray-400 dark:text-gray-500"} />
      {label}
    </button>
  );
}
