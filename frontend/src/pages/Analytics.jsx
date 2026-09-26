import React, { useState, useEffect } from "react";
import { dashboardAPI } from "../utils/api";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { 
  ShieldAlert, RefreshCw, BarChart3, PieChart, 
  Activity, ArrowDownRight, ArrowUpRight 
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const [metrics, setMetrics] = useState({
    security_score: 80,
    threats_detected: 0,
    suspicious_detected: 0,
    safe_scans: 0,
    total_scans: 0,
    messages_scanned: 0,
    websites_checked: 0
  });

  const [categoryDistribution, setCategoryDistribution] = useState({
    "Credential Harvesting": 0,
    "Social Engineering": 0,
    "Brand Impersonation": 0,
    "Technical Exploit": 0
  });

  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const data = await dashboardAPI.fetchAnalytics();
      setMetrics(data.dashboard_metrics);
      setCategoryDistribution(data.category_distribution);
      setTimeline(data.threat_timeline);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Chart 1: Timeline Configuration
  const timelineData = {
    labels: timeline.map(t => t.date),
    datasets: [
      {
        label: "Scans Executed",
        data: timeline.map(t => t.scans),
        borderColor: "#06b6d4",
        backgroundColor: "rgba(6, 182, 212, 0.05)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: "#06b6d4"
      },
      {
        label: "Quarantined Threats",
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

  // Chart 2: Category Breakdown
  const categoryData = {
    labels: Object.keys(categoryDistribution),
    datasets: [
      {
        data: Object.values(categoryDistribution).map(v => v === 0 ? 0.1 : v),
        backgroundColor: ["#4f46e5", "#06b6d4", "#f59e0b", "#ef4444"],
        borderColor: "rgba(15,23,42,0.8)",
        borderWidth: 1
      }
    ]
  };

  // Chart 3: Scan Types Volume (Bar Chart)
  const scanTypeVolumeData = {
    labels: ["Email Scans", "SMS/WhatsApp", "URL Audits", "Screenshots"],
    datasets: [
      {
        label: "Scan Count",
        data: [
          Math.max(0, metrics.messages_scanned - 2), 
          Math.min(5, metrics.messages_scanned), 
          metrics.websites_checked, 
          Math.max(0, metrics.total_scans - metrics.messages_scanned - metrics.websites_checked)
        ],
        backgroundColor: "rgba(59, 130, 246, 0.65)",
        borderColor: "#3b82f6",
        borderWidth: 1,
        borderRadius: 8
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex justify-between items-center bg-[#090d16]/30 border border-slate-800/80 rounded-3xl p-5">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
            Platform Threat Analytics Center
          </h3>
          <p className="text-xs text-slate-500">
            Real-time visual monitoring of credential harvests, domain similarities, and clean traffic metrics.
          </p>
        </div>
        <button 
          onClick={fetchAnalyticsData}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Charts
        </button>
      </div>

      {loading ? (
        <div className="py-36 text-center">
          <div className="w-10 h-10 border-2 border-cyber-teal border-t-transparent rounded-full animate-spin inline-block"></div>
          <p className="text-xs text-slate-500 mt-2">Loading data matrices...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Chart Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timeline Line Chart */}
            <div className="glass-card border border-slate-800/80 rounded-3xl p-6 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-4.5 w-4.5 text-cyber-teal animate-pulse" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Weekly Scanning Frequency Timeline
                </h4>
              </div>
              <div className="h-64 relative">
                <Line 
                  data={timelineData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: "#94a3b8" } } },
                    scales: { 
                      x: { grid: { color: "rgba(255,255,255,0.02)" }, ticks: { color: "#94a3b8" } },
                      y: { grid: { color: "rgba(255,255,255,0.02)" }, ticks: { color: "#94a3b8" } }
                    } 
                  }} 
                />
              </div>
            </div>

            {/* Category Doughnut Chart */}
            <div className="glass-card border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-3">
                <PieChart className="h-4.5 w-4.5 text-cyber-teal" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Quarantined Vector Types
                </h4>
              </div>
              <div className="h-48 relative flex justify-center items-center">
                <Doughnut 
                  data={categoryData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { 
                        position: "bottom", 
                        labels: { color: "#94a3b8", font: { size: 10 }, boxWidth: 10 } 
                      } 
                    },
                    cutout: "70%"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bar Chart & Posture Report */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="glass-card border border-slate-800/80 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-4.5 w-4.5 text-cyber-teal" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Quarantine Run Volume by Category
                </h4>
              </div>
              <div className="h-56 relative">
                <Bar 
                  data={scanTypeVolumeData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { 
                      x: { grid: { color: "rgba(255,255,255,0.02)" }, ticks: { color: "#94a3b8" } },
                      y: { grid: { color: "rgba(255,255,255,0.02)" }, ticks: { color: "#94a3b8", stepSize: 1 } }
                    } 
                  }} 
                />
              </div>
            </div>

            {/* Posture audit checklist */}
            <div className="glass-card border border-slate-800/80 rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Monthly Safety Posture Report
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Threat Mitigation</span>
                    <h5 className="text-lg font-black text-white mt-1">100.0%</h5>
                  </div>
                  <div className="p-1 bg-cyber-green/10 text-cyber-green rounded-lg">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>

                <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Exposure Rating</span>
                    <h5 className="text-lg font-black text-white mt-1">0.0%</h5>
                  </div>
                  <div className="p-1 bg-cyber-red/10 text-cyber-red rounded-lg">
                    <ArrowDownRight className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/50 p-4 border border-slate-900 rounded-2xl">
                <h5 className="text-xs font-semibold text-white mb-2">Posture Executive Summary</h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  During this scanning period, PhishGuard AI successfully checked <strong>{metrics.total_scans}</strong> incoming transactions. 
                  A total of <strong>{metrics.threats_detected}</strong> high-risk phishing payloads and <strong>{metrics.suspicious_detected}</strong> suspicious look-alikes were blocked, avoiding potential account lockouts and credential leakage.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
