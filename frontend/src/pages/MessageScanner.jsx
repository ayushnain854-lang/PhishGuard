import React, { useState } from "react";
import { scannerAPI } from "../utils/api";
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, HelpCircle, 
  ArrowRight, ShieldCheck as CheckIcon, Copy, RefreshCw 
} from "lucide-react";

const MessageScanner = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleScan = async () => {
    setError("");
    setResult(null);
    if (!text.trim()) {
      setError("Please paste some message content to scan.");
      return;
    }

    setLoading(true);
    try {
      const data = await scannerAPI.scanMessage(text);
      setResult(data);
    } catch (e) {
      console.error(e);
      setError("Failed to reach scanner core. Verify your backend is online.");
    } finally {
      setLoading(false);
    }
  };

  const getVerdictDetails = (verdict) => {
    if (verdict === "Phishing") return {
      color: "text-cyber-red bg-cyber-red/5 border-cyber-red/30",
      glow: "shadow-red-glow",
      barColor: "bg-cyber-red",
      icon: ShieldAlert
    };
    if (verdict === "Suspicious") return {
      color: "text-cyber-amber bg-cyber-amber/5 border-cyber-amber/30",
      glow: "shadow-amber-glow",
      barColor: "bg-cyber-amber",
      icon: AlertTriangle
    };
    return {
      color: "text-cyber-green bg-cyber-green/5 border-cyber-green/30",
      glow: "shadow-green-glow",
      barColor: "bg-cyber-green",
      icon: ShieldCheck
    };
  };

  const verdict = result ? getVerdictDetails(result.prediction) : null;
  const VerdictIcon = verdict ? verdict.icon : null;

  return (
    <div className="space-y-6">
      {/* Upper info card */}
      <div className="glass-card border border-slate-800/80 rounded-3xl p-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
          Secure Message Integrity Scanner
        </h3>
        <p className="text-xs text-slate-500">
          Paste emails, SMS texts, or chat message logs to run linguistic vector feature reviews.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Side Input Panel */}
        <div className="glass-card border border-slate-800/80 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paste Text Content</span>
            <button 
              onClick={() => setText("")}
              className="text-xs text-slate-500 hover:text-white transition-all cursor-pointer"
            >
              Clear Input
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Example: URGENT: Your Netflix account is suspended. Verify billing now at http://netflix-billing-update.top to prevent closure."
            className="w-full h-64 bg-slate-950/40 border border-slate-850 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyber-teal focus:ring-1 focus:ring-cyber-teal transition-all resize-none"
          />

          {error && <p className="text-xs font-semibold text-cyber-red">{error}</p>}

          <button
            onClick={handleScan}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyber-blue to-cyber-teal hover:opacity-90 py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-cyan-glow disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                Scanning content vectors...
              </>
            ) : (
              <>
                Analyze Message Core
                <ArrowRight className="h-4.5 w-4.5" />
              </>
            )}
          </button>
        </div>

        {/* Right Side Result Panel */}
        <div className="space-y-6">
          {loading && (
            <div className="glass-card border border-slate-800/80 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[380px]">
              <div className="w-12 h-12 border-4 border-cyber-teal border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="text-sm font-bold text-white">Running Hybrid Classifiers</p>
                <p className="text-xs text-slate-500 mt-1">Analyzing stop-words, TLDs, and OTP patterns...</p>
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="glass-card border border-slate-800/80 rounded-3xl p-12 flex flex-col items-center justify-center text-center text-slate-500 space-y-3 min-h-[380px]">
              <HelpCircle className="h-10 w-10 text-slate-600 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-slate-400">Waiting for Scan Data</p>
                <p className="text-xs mt-1 max-w-[240px]">Submit email copy, SMS text, or social alerts to populate the dashboard.</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-5">
              {/* Verdict Summary Box */}
              <div className={`border rounded-3xl p-5 flex items-center gap-4 ${verdict.color} ${verdict.glow}`}>
                <div className="p-3 bg-slate-900 border border-slate-850 rounded-2xl">
                  <VerdictIcon className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">Scan Verdict</div>
                  <div className="text-2xl font-black">{result.prediction}</div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Threat Category: <strong>{result.threat_category}</strong>
                  </p>
                </div>
              </div>

              {/* Risk metrics */}
              <div className="glass-card border border-slate-800/80 rounded-3xl p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Risk Index</span>
                    <h4 className="text-2xl font-extrabold text-white mt-1">{result.risk_score}%</h4>
                  </div>
                  <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">ML Confidence</span>
                    <h4 className="text-2xl font-extrabold text-white mt-1">{result.confidence_score}%</h4>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 font-medium mb-1.5">
                    <span>Severity Meter</span>
                    <span>{result.risk_score}% Phishing Potential</span>
                  </div>
                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${verdict.barColor} transition-all duration-1000`} 
                      style={{ width: `${result.risk_score}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Explainable AI Reasons */}
              <div className="glass-card border border-slate-800/80 rounded-3xl p-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Explainable AI (XAI) Analysis
                </h4>
                <ul className="space-y-2.5">
                  {result.reasons.map((reason, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                      <span className="text-cyber-blue shrink-0 mt-0.5">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Security Actions */}
              <div className="glass-card border border-slate-800/80 rounded-3xl p-5">
                <h4 className="text-xs font-bold text-cyber-green uppercase tracking-wider mb-3">
                  Mitigation Recommendations
                </h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
                      <CheckIcon className="h-4 w-4 text-cyber-green shrink-0 mt-0.5" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageScanner;
