import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, Lock, Mail, AlertTriangle, ArrowRight } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all security fields.");
      return;
    }
    
    setLoading(true);
    const res = await loginUser(email, password);
    setLoading(false);
    
    if (res.success) {
      navigate("/");
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Neon Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-blue/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-teal/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card border border-slate-800 rounded-3xl p-8 relative z-10 shadow-blue-glow">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-cyber-blue/10 rounded-2xl border border-cyber-blue/20 mb-4 shadow-blue-glow">
            <Shield className="h-8 w-8 text-cyber-blue" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight font-sans">
            Welcome to PhishGuard <span className="text-cyber-teal">AI</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1.5 uppercase tracking-widest font-bold">
            Intelligent Threat Mitigation Hub
          </p>
        </div>

        {/* Warning Banner */}
        {error && (
          <div className="mb-6 p-4 bg-cyber-red/5 border border-cyber-red/30 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-cyber-red shrink-0 mt-0.5" />
            <p className="text-xs text-cyber-red font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Security Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@phishguard.ai"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyber-blue transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Vault Access Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyber-blue transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyber-blue to-cyber-teal hover:opacity-90 py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-cyan-glow mt-4 disabled:opacity-50"
          >
            {loading ? "Authenticating Session..." : "Secure Sign In"}
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </form>

        {/* Signup Redirect link */}
        <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
          <p className="text-xs text-slate-400 font-medium">
            New sentinel agent?{" "}
            <Link to="/signup" className="text-cyber-teal hover:underline font-bold">
              Enroll Security Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
