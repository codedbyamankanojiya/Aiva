import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { InterviewProvider } from "@/context/InterviewContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Analytics } from "@/pages/Analytics";
import { Practice } from "@/pages/Practice";
import { Session } from "@/pages/Section/ActiveSession";
import { InterviewResults } from "@/pages/Section/InterviewResults";
import { ProfilePage } from "@/pages/ProfilePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { SignUpPage } from "@/pages/auth/SignUpPage";
import { Community } from "@/pages/Community";
import Interview from "@/pages/Section/SectionSelection";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InterviewProvider>
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* ActiveSection routes without sidebar */}
            <Route
              element={
                <ProtectedRoute>
                  <div className="min-h-screen">
                    <Interview />
                  </div>
                </ProtectedRoute>
              }
            >
              <Route path="/interview" element={<Interview />} />
            </Route>

            <Route
              element={
                <ProtectedRoute>
                  <div className="min-h-screen">
                    <Session />
                  </div>
                </ProtectedRoute>
              }
            >
              <Route path="/active-section/session" element={<Session />} />
            </Route>

            <Route
              element={
                <ProtectedRoute>
                  <div className="min-h-screen">
                    <InterviewResults />
                  </div>
                </ProtectedRoute>
              }
            >
              <Route path="/results" element={<InterviewResults />} />
            </Route>


            {/* Protected app routes with sidebar */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/community" element={<Community />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </InterviewProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
