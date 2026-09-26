import React from "react";
import { ShieldAlert, Award, Star, Compass } from "lucide-react";

const SecurityBadge = ({ badgeId, unlocked = false }) => {
  const badgeConfig = {
    guardian: {
      name: "Cyber Guardian",
      desc: "Completed 30+ scan checks across the network.",
      icon: Star,
      color: "from-cyber-blue to-purple-600 border-cyber-blue/30"
    },
    buster: {
      name: "Phish Buster",
      desc: "Identified and blocked first active phishing scam.",
      icon: ShieldAlert,
      color: "from-cyber-red to-orange-500 border-cyber-red/30"
    },
    sentinel: {
      name: "First Line of Defense",
      desc: "Maintained a perfect Security Score of 100.",
      icon: Award,
      color: "from-cyber-green to-emerald-500 border-cyber-green/30"
    },
    navigator: {
      name: "Safe Navigator",
      desc: "Verified 10+ links via the URL safety analyzer.",
      icon: Compass,
      color: "from-cyber-teal to-blue-500 border-cyber-teal/30"
    }
  };

  const badge = badgeConfig[badgeId] || badgeConfig.sentinel;
  const BadgeIcon = badge.icon;

  return (
    <div className={`glass-card border rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 ${
      unlocked 
        ? "bg-slate-900/60 border-slate-700 opacity-100 shadow-blue-glow" 
        : "border-slate-800/40 opacity-40 cursor-not-allowed filter grayscale"
    }`}>
      {/* Icon Badge Core */}
      <div className={`h-12 w-12 rounded-xl bg-gradient-to-tr flex items-center justify-center text-white ${
        unlocked ? badge.color : "from-slate-700 to-slate-800"
      }`}>
        <BadgeIcon className="h-6 w-6" />
      </div>

      {/* Text Details */}
      <div className="flex-1 overflow-hidden">
        <h4 className="font-sans font-bold text-sm text-white flex items-center gap-2">
          {badge.name}
          {unlocked && (
            <span className="text-[9px] bg-cyber-green/20 text-cyber-green border border-cyber-green/30 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
              Unlocked
            </span>
          )}
        </h4>
        <p className="text-xs text-slate-500 truncate mt-0.5" title={badge.desc}>
          {badge.desc}
        </p>
      </div>
    </div>
  );
};

export default SecurityBadge;
