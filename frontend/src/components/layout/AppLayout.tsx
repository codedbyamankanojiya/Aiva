import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { CinematicOverlay } from "@/components/effects/CinematicOverlay";
import { AivaCursor } from "@/components/effects/AivaCursor";

export function AppLayout() {
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

      {/* Custom cursor */}
      <AivaCursor />

      {/* App shell */}
      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 ml-[80px] flex flex-col w-full">
          <Navbar />
          <div className="flex-1 px-4 lg:px-8 pb-8">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
