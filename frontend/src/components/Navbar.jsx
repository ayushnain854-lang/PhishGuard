import React, { useState, useEffect } from "react";
import { Bell, ShieldCheck, Activity } from "lucide-react";

const Navbar = ({ title }) => {
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800 bg-[#080c14]/80 backdrop-blur-md flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-40">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold font-sans text-white tracking-wide">{title}</h2>
      </div>

      {/* Cyber Security Status & Utilities */}
      <div className="flex items-center gap-6">
        {/* Core Shield Pulse */}
        <div className="flex items-center gap-2 bg-cyber-green/5 border border-cyber-green/20 rounded-full px-3 py-1 text-xs text-cyber-green">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green"></span>
          </span>
          <ShieldCheck className="h-3.5 w-3.5" />
          <span className="font-semibold font-sans tracking-wide">Shield Core Status: Active</span>
        </div>

        {/* Temporal Time Stamp */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 border-r border-slate-800 pr-5">
          <Activity className="h-3.5 w-3.5 text-cyber-teal animate-pulse" />
          <span className="font-mono tracking-wider">{systemTime}</span>
        </div>

        {/* Notifications Button */}
        <button className="relative p-2 text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 rounded-lg hover:border-slate-700 transition-all cursor-pointer">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-cyber-red rounded-full"></span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
