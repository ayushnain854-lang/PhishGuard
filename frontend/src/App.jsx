import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Components
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

// Pages
import Dashboard from "./pages/Dashboard";
import MessageScanner from "./pages/MessageScanner";
import URLScanner from "./pages/URLScanner";
import ScreenshotScanner from "./pages/ScreenshotScanner";
import CyberAssistant from "./pages/CyberAssistant";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Protected Route Wrapper
const ProtectedRoute = ({ children, pageTitle }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyber-teal border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-cyber-bg text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Core Layout */}
      <div className="flex-1 pl-64 flex flex-col">
        {/* Navbar */}
        <Navbar title={pageTitle} />

        {/* Dynamic Page Views */}
        <main className="p-8 pt-24 max-w-7xl w-full mx-auto flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Administrative Dashboard Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute pageTitle="Security Control Dashboard">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/message-scanner"
            element={
              <ProtectedRoute pageTitle="Linguistic Message Scanner">
                <MessageScanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/url-scanner"
            element={
              <ProtectedRoute pageTitle="Domain reputation analyzer">
                <URLScanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/screenshot-scanner"
            element={
              <ProtectedRoute pageTitle="Screenshot Character Scanner">
                <ScreenshotScanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cyber-assistant"
            element={
              <ProtectedRoute pageTitle="AI Cyber Assistant Terminal">
                <CyberAssistant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute pageTitle="Platform Scan Logs">
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute pageTitle="Interactive Threat Intelligence">
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute pageTitle="Sentinel Configuration Settings">
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
