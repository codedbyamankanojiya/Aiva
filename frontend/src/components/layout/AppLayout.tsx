import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export function AppLayout() {
  return (
    <>
      {/* Animated gradient background */}
      <div className="aiva-bg" aria-hidden="true">
        <div className="blob blob-pink" />
        <div className="blob blob-purple" />
        <div className="blob blob-blue" />
      </div>

      {/* App shell */}
      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 ml-20 flex flex-col">
          <Navbar />
          <div className="flex-1 px-4 lg:px-8 pb-8">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
