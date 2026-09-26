import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, Lock, Mail, User, AlertTriangle, ArrowRight } from "lucide-react";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !email || !password) {
      setError("Please complete all registration inputs.");
      return;
    }
    
    setLoading(true);
    const res = await registerUser(username, email, password);
    setLoading(false);
    
    if (res.success) {
      navigate("/");
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Neon blur assets */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-blue/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-teal/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card border border-slate-800 rounded-3xl p-8 relative z-10 shadow-cyan-glow">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="inline-flex p-3 bg-cyber-teal/10 rounded-2xl border border-cyber-teal/20 mb-4 shadow-cyan-glow">
            <Shield className="h-8 w-8 text-cyber-teal" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight font-sans">
            Sentinel Agent Enrollment
          </h2>
          <p className="text-slate-400 text-xs mt-1.5 uppercase tracking-widest font-bold">
            Create Security Credentials
          </p>
        </div>

        {/* Errors Display */}
        {error && (
          <div className="mb-6 p-4 bg-cyber-red/5 border border-cyber-red/30 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-cyber-red shrink-0 mt-0.5" />
            <p className="text-xs text-cyber-red font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Agent Call-Sign Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <User className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Agent Maverick"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyber-teal transition-all"
                required
              />
            </div>
          </div>

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
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyber-teal transition-all"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyber-teal transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyber-teal to-cyber-blue hover:opacity-90 py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-cyan-glow mt-4 disabled:opacity-50"
          >
            {loading ? "Registering Agent..." : "Enroll Account"}
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </form>

        {/* Redirect */}
        <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
          <p className="text-xs text-slate-400 font-medium">
            Already enrolled?{" "}
            <Link to="/login" className="text-cyber-blue hover:underline font-bold">
              Sign In Vault
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
