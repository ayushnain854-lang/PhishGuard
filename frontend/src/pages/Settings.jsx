import React, { useState, useEffect } from "react";
import { dashboardAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { Shield, Eye, Bell, ShieldAlert, CheckCircle, Save } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [realtimeScan, setRealtimeScan] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Load existing settings
    const fetchSettings = async () => {
      try {
        const data = await dashboardAPI.fetchAnalytics();
        if (data && data.dashboard_metrics && data.dashboard_metrics.settings) {
          const s = data.dashboard_metrics.settings;
          setDarkMode(s.dark_mode === 1);
          setEmailAlerts(s.email_alerts === 1);
          setRealtimeScan(s.realtime_scan === 1);
        }
      } catch (e) {
        console.error("Settings load error:", e);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    try {
      await dashboardAPI.saveSettings({
        dark_mode: darkMode ? 1 : 0,
        email_alerts: emailAlerts ? 1 : 0,
        realtime_scan: realtimeScan ? 1 : 0
      });
      setSuccessMsg("Sentinel configuration updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Description header */}
      <div className="glass-card border border-slate-800/80 rounded-3xl p-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
          Sentinel Configuration Panel
        </h3>
        <p className="text-xs text-slate-500">
          Manage system notification outputs, passive browser extension shields, and credentials logs.
        </p>
      </div>

      <div className="max-w-2xl glass-card border border-slate-800/80 rounded-3xl p-6 space-y-6">
        {/* Profile overview */}
        <div className="border-b border-slate-800/60 pb-5 space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Agent Profile Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Call-Sign Name</span>
              <div className="bg-slate-950/60 border border-slate-850 px-4 py-2.5 rounded-xl text-xs text-slate-400 font-semibold mt-1">
                {user?.username || "Agent Mode"}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Assigned Email Vault</span>
              <div className="bg-slate-950/60 border border-slate-850 px-4 py-2.5 rounded-xl text-xs text-slate-400 font-semibold mt-1">
                {user?.email || "Offline Account"}
              </div>
            </div>
          </div>
        </div>

        {/* Configurations checkboxes */}
        <div className="border-b border-slate-800/60 pb-5 space-y-5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            System Preferences
          </h4>

          {/* Realtime Scanning */}
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="p-2 bg-cyber-teal/10 text-cyber-teal border border-cyber-teal/20 rounded-xl shrink-0 mt-0.5">
                <Shield className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Extension Real-Time Analysis</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Actively scan incoming web navigation requests in the background.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={realtimeScan} 
                onChange={(e) => setRealtimeScan(e.target.checked)}
                className="sr-only peer cursor-pointer"
              />
              <div className="w-9 h-5 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:border-slate-300 after:border after:rounded-full after:height-4 after:h-4 after:w-4 after:transition-all peer-checked:bg-cyber-teal peer-checked:after:bg-white border border-slate-800"></div>
            </label>
          </div>

          {/* Email Alerts */}
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="p-2 bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20 rounded-xl shrink-0 mt-0.5">
                <Bell className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Threat Alert Warnings</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Send a weekly digest warning report containing avoided phishing categories.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={emailAlerts} 
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="sr-only peer cursor-pointer"
              />
              <div className="w-9 h-5 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:border-slate-300 after:border after:rounded-full after:height-4 after:h-4 after:w-4 after:transition-all peer-checked:bg-cyber-teal peer-checked:after:bg-white border border-slate-800"></div>
            </label>
          </div>

          {/* Dark Mode */}
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="p-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl shrink-0 mt-0.5">
                <Eye className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Obsidian Dark Console Mode</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Enable carbon interfaces to increase operational readability.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={darkMode} 
                onChange={(e) => setDarkMode(e.target.checked)}
                className="sr-only peer cursor-pointer"
              />
              <div className="w-9 h-5 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:border-slate-300 after:border after:rounded-full after:height-4 after:h-4 after:w-4 after:transition-all peer-checked:bg-cyber-teal peer-checked:after:bg-white border border-slate-800"></div>
            </label>
          </div>
        </div>

        {/* Buttons / Messages */}
        <div className="flex items-center justify-between">
          <div>
            {successMsg && (
              <div className="flex items-center gap-1.5 text-cyber-green text-xs font-bold animate-pulse">
                <CheckCircle className="h-4 w-4" />
                {successMsg}
              </div>
            )}
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-gradient-to-tr from-cyber-blue to-cyber-teal text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:opacity-90 shadow-cyan-glow cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving configurations..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
