import React, { useState, useEffect } from "react";
import { dashboardAPI } from "../utils/api";
import StatCard from "../components/StatCard";
import SecurityBadge from "../components/SecurityBadge";
import { 
  ShieldAlert, ShieldCheck, RefreshCw, BarChart2, 
  TrendingUp, Award, Clock, ArrowRight 
} from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Link } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    security_score: 80,
    threats_avoided: 0,
    messages_scanned: 0,
    websites_checked: 0,
    total_scans: 0,
    threats_detected: 0,
    suspicious_detected: 0,
    safe_scans: 0,
    today_scans: 0,
    avg_risk_score: 0.0
  });

  const [recentScans, setRecentScans] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState({
    "Credential Harvesting": 0,
    "Social Engineering": 0,
    "Brand Impersonation": 0,
    "Technical Exploit": 0
  });

  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch analytics
      const analyticsData = await dashboardAPI.fetchAnalytics();
      setMetrics(analyticsData.dashboard_metrics);
      setCategoryDistribution(analyticsData.category_distribution);
      setTimeline(analyticsData.threat_timeline);

      // Fetch recent scan history
      const historyData = await dashboardAPI.fetchHistory({ limit: 4 });
      setRecentScans(historyData);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Determine security score rating color & label
  const getScoreRating = (score) => {
    if (score >= 85) return { label: "Excellent", color: "text-cyber-green", border: "border-cyber-green" };
    if (score >= 60) return { label: "Moderate", color: "text-cyber-amber", border: "border-cyber-amber" };
    return { label: "High Risk", color: "text-cyber-red", border: "border-cyber-red" };
  };

  const rating = getScoreRating(metrics.security_score);

  // Chart 1: Timeline Configuration
  const timelineChartData = {
    labels: timeline.map(t => t.date),
    datasets: [
      {
        label: "Scans",
        data: timeline.map(t => t.scans),
        borderColor: "#06b6d4",
        backgroundColor: "rgba(6, 182, 212, 0.05)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: "#06b6d4"
      },
      {
        label: "Threats",
        data: timeline.map(t => t.threats),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.05)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: "#ef4444"
      }
    ]
  };

  const timelineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#94a3b8", font: { family: "Inter", size: 11 } }
      }
    },
    scales: {
      x: { grid: { color: "rgba(255,255,255,0.03)" }, ticks: { color: "#94a3b8" } },
      y: { grid: { color: "rgba(255,255,255,0.03)" }, ticks: { color: "#94a3b8", stepSize: 1 } }
    }
  };

  // Chart 2: Category Distribution Configuration
  const categoryChartData = {
    labels: Object.keys(categoryDistribution),
    datasets: [
      {
        data: Object.values(categoryDistribution).map(v => v === 0 ? 0.1 : v), // default padding if zero
        backgroundColor: ["#4f46e5", "#06b6d4", "#f59e0b", "#ef4444"],
        borderWidth: 1,
        borderColor: "rgba(15, 23, 42, 0.8)"
      }
    ]
  };

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#94a3b8", font: { family: "Inter", size: 10 }, padding: 15 }
      }
    },
    cutout: "70%"
  };

  return (
    <div className="space-y-6">
      {/* Upper Status Ribbon */}
      <div className="flex justify-between items-center bg-[#090d16]/30 border border-slate-800/80 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-cyber-green animate-pulse" />
          <span className="text-sm font-semibold text-slate-300">
            Scanning modules online and checking incoming logs.
          </span>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Stats
        </button>
      </div>

      {/* Grid: Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Total Scans Executed" 
          value={metrics.total_scans} 
          description="Across all platforms" 
          change={`${metrics.today_scans} today`}
          icon={BarChart2}
          color="blue"
        />
        <StatCard 
          title="Threats Intercepted" 
          value={metrics.threats_detected} 
          description="Blocked & quarantined" 
          change={`${metrics.threats_avoided} avoided`}
          icon={ShieldAlert}
          color="red"
        />
        <StatCard 
          title="Average Threat Risk" 
          value={`${metrics.avg_risk_score}%`} 
          description="Platform wide average" 
          icon={TrendingUp}
          color="amber"
        />
        <StatCard 
          title="Safe Verifications" 
          value={metrics.safe_scans} 
          description="Verified clean files/URLs" 
          icon={ShieldCheck}
          color="green"
        />
      </div>

      {/* Grid: Charts & Security Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Score Meter */}
        <div className="glass-card border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between items-center text-center">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
              Personal Security Rating
            </h3>
            <p className="text-xs text-slate-500">Real-time profile vulnerability audit</p>
          </div>

          {/* Animated SVG Circle */}
          <div className="relative flex items-center justify-center my-6">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle 
                cx="72" cy="72" r="60" 
                stroke="rgba(255,255,255,0.03)" 
                strokeWidth="10" 
                fill="transparent" 
              />
              <circle 
                cx="72" cy="72" r="60" 
                stroke={metrics.security_score >= 85 ? "#10B981" : metrics.security_score >= 60 ? "#F59E0B" : "#EF4444"} 
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 60}
                strokeDashoffset={2 * Math.PI * 60 * (1 - metrics.security_score / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-white">{metrics.security_score}</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">Index</span>
            </div>
          </div>

          <div>
            <div className={`text-base font-bold uppercase tracking-wider ${rating.color}`}>
              {rating.label} Level
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
              {metrics.security_score >= 85 
                ? "Excellent posture. Continue monitoring entrypoints." 
                : "Active vulnerabilities detected. Clear pending scan risks."}
            </p>
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="glass-card border border-slate-800/80 rounded-3xl p-6 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Threat Detection Timeline
            </h3>
            <p className="text-xs text-slate-500">Weekly platform volume trends</p>
          </div>
          <div className="h-64 relative">
            <Line data={timelineChartData} options={timelineChartOptions} />
          </div>
        </div>
      </div>

      {/* Grid: Recent Logs & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent threat logs */}
        <div className="glass-card border border-slate-800/80 rounded-3xl p-6 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Recent Security Audits
              </h3>
              <p className="text-xs text-slate-500">Live logs from extension & dashboard</p>
            </div>
            <Link to="/history" className="text-xs font-bold text-cyber-teal flex items-center gap-1 hover:underline">
              View All Logs
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentScans.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No scans executed yet. Use the scanners in the sidebar to start!
              </div>
            ) : (
              recentScans.map((scan) => {
                let badgeColor = "bg-cyber-green/10 text-cyber-green border-cyber-green/20";
                if (scan.prediction === "Phishing") badgeColor = "bg-cyber-red/10 text-cyber-red border-cyber-red/20";
                else if (scan.prediction === "Suspicious") badgeColor = "bg-cyber-amber/10 text-cyber-amber border-cyber-amber/20";

                return (
                  <div key={scan.id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 shrink-0">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-white truncate max-w-[280px]">
                          {scan.content}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(scan.created_at).toLocaleString()} | Type: {scan.scan_type.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-[10px] font-mono text-slate-400">
                        Risk: {scan.risk_score}%
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 border rounded-full font-bold uppercase tracking-wider ${badgeColor}`}>
                        {scan.prediction}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Achievement badges */}
        <div className="glass-card border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
          <div className="border-b border-slate-800/50 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-cyber-teal" />
              Security Achievements
            </h3>
            <p className="text-xs text-slate-500">Postural achievement badges</p>
          </div>

          <div className="space-y-3.5 flex-1">
            <SecurityBadge 
              badgeId="sentinel" 
              unlocked={metrics.security_score >= 85} 
            />
            <SecurityBadge 
              badgeId="buster" 
              unlocked={metrics.threats_detected > 0} 
            />
            <SecurityBadge 
              badgeId="navigator" 
              unlocked={metrics.websites_checked >= 5} 
            />
            <SecurityBadge 
              badgeId="guardian" 
              unlocked={metrics.total_scans >= 15} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
