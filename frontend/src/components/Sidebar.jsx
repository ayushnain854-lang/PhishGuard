import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Shield, LayoutDashboard, Mail, Link2, Image, 
  MessageSquare, History, BarChart3, Settings, LogOut 
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const { user, logoutUser } = useAuth();

  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Message Scanner", path: "/message-scanner", icon: Mail },
    { name: "URL Scanner", path: "/url-scanner", icon: Link2 },
    { name: "Screenshot Scanner", path: "/screenshot-scanner", icon: Image },
    { name: "AI Cyber Assistant", path: "/cyber-assistant", icon: MessageSquare },
    { name: "Scan History", path: "/history", icon: History },
    { name: "Threat Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-[#090d16] border-r border-slate-800 flex flex-col justify-between fixed left-0 top-0 z-50">
      <div>
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-cyber-teal/10 rounded-lg border border-cyber-teal/30">
            <Shield className="h-6 w-6 text-cyber-teal animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold font-sans text-white text-lg tracking-wide leading-none">
              PhishGuard <span className="text-cyber-teal">AI</span>
            </h1>
            <p className="text-[10px] text-slate-500 uppercase mt-0.5 tracking-widest font-bold">
              Cyber Sentinel
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? "bg-slate-800/60 text-cyber-teal border-l-2 border-cyber-teal shadow-cyan-glow" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-cyber-teal" : ""}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-[#060a10]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gradient-to-tr from-cyber-blue to-cyber-teal rounded-full flex items-center justify-center font-extrabold text-white text-sm shadow-blue-glow">
              {user?.username?.substring(0, 2).toUpperCase() || "PG"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate max-w-[110px]">{user?.username || "Guest User"}</p>
              <p className="text-[10px] text-slate-500 truncate max-w-[110px]">{user?.email || "Agent Mode"}</p>
            </div>
          </div>
          
          <button 
            onClick={logoutUser}
            className="p-2 hover:bg-slate-800/80 rounded-lg text-slate-400 hover:text-cyber-red transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
