import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { CinematicOverlay } from "@/components/effects/CinematicOverlay";

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isSidebarOpen]);

  return (
    <>
      {/* Base gradient background (UNTOUCHED) */}
      <div className="aiva-bg" aria-hidden="true">
        <div className="blob blob-pink" />
        <div className="blob blob-purple" />
        <div className="blob blob-blue" />
      </div>

      {/* Cinematic 3D overlay ON TOP of background */}
      <CinematicOverlay />

      {/* App shell */}
      <div className="relative z-10 flex min-h-screen">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main content area */}
        <main className="flex-1 ml-0 lg:ml-[80px] flex flex-col w-full">
          <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />
          <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-8">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
