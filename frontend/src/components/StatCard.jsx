import React from "react";

const StatCard = ({ title, value, change, description, icon: Icon, color = "blue" }) => {
  // Define color themes
  const colorMap = {
    teal: {
      border: "border-cyber-teal/30 hover:border-cyber-teal/60",
      iconBg: "bg-cyber-teal/10 text-cyber-teal",
      shadow: "shadow-cyan-glow",
      badge: "bg-cyber-teal/10 text-cyber-teal"
    },
    blue: {
      border: "border-cyber-blue/30 hover:border-cyber-blue/60",
      iconBg: "bg-cyber-blue/10 text-cyber-blue",
      shadow: "shadow-blue-glow",
      badge: "bg-cyber-blue/10 text-cyber-blue"
    },
    red: {
      border: "border-cyber-red/30 hover:border-cyber-red/60",
      iconBg: "bg-cyber-red/10 text-cyber-red",
      shadow: "shadow-red-glow",
      badge: "bg-cyber-red/10 text-cyber-red"
    },
    amber: {
      border: "border-cyber-amber/30 hover:border-cyber-amber/60",
      iconBg: "bg-cyber-amber/10 text-cyber-amber",
      shadow: "shadow-amber-glow",
      badge: "bg-cyber-amber/10 text-cyber-amber"
    },
    green: {
      border: "border-cyber-green/30 hover:border-cyber-green/60",
      iconBg: "bg-cyber-green/10 text-cyber-green",
      shadow: "shadow-green-glow",
      badge: "bg-cyber-green/10 text-cyber-green"
    }
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <div className={`glass-card border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${theme.border} ${theme.shadow}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl ${theme.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      <div>
        <h3 className="text-3xl font-extrabold text-white tracking-tight leading-none mb-2">{value}</h3>
        <div className="flex items-center gap-2">
          {change !== undefined && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${theme.badge}`}>
              {change}
            </span>
          )}
          <span className="text-xs text-slate-500 font-medium">{description}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
