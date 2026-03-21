import { useAuth } from "@/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ece5f6] via-[#e8dff5] to-[#d5c8f0]">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <img src="/Assets/Pfp.png" alt="Aiva" className="w-16 h-16 rounded-2xl shadow-lg" />
            <div className="absolute inset-0 rounded-2xl bg-aiva-purple/20 animate-ping" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
