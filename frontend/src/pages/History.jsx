import React, { useState, useEffect } from "react";
import { dashboardAPI } from "../utils/api";
import { 
  Search, Filter, Clock, Eye, AlertCircle, 
  Trash2, ShieldCheck, ShieldAlert, AlertTriangle 
} from "lucide-react";

const History = () => {
  const [scans, setScans] = useState([]);
  const [search, setSearch] = useState("");
  const [scanType, setScanType] = useState("");
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null); // For details modal

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (search.trim()) filters.search = search;
      if (scanType) filters.scan_type = scanType;
      if (prediction) filters.prediction = prediction;

      const data = await dashboardAPI.fetchHistory(filters);
      setScans(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, [scanType, prediction]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistoryData();
  };

  const getVerdictStyle = (pred) => {
    if (pred === "Phishing") return "text-cyber-red bg-cyber-red/10 border-cyber-red/20";
    if (pred === "Suspicious") return "text-cyber-amber bg-cyber-amber/10 border-cyber-amber/20";
    return "text-cyber-green bg-cyber-green/10 border-cyber-green/20";
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="glass-card border border-slate-800/80 rounded-3xl p-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
          Historical Threat Intelligence Logs
        </h3>
        <p className="text-xs text-slate-500">
          Query and audit all previous platform verification runs. Filter by classifications or run full-text search parameters.
        </p>
      </div>

      {/* Filter Toolbar Card */}
      <div className="glass-card border border-slate-800/80 rounded-3xl p-5">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search content or reasons..."
              className="w-full bg-slate-950/60 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyber-teal"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <select
                value={scanType}
                onChange={(e) => setScanType(e.target.value)}
                className="bg-transparent text-xs text-slate-300 focus:outline-none border-none cursor-pointer"
              >
                <option value="">All Types</option>
                <option value="email">Emails/Texts</option>
                <option value="url">URLs</option>
                <option value="image">Screenshots</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-slate-500" />
              <select
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
                className="bg-transparent text-xs text-slate-300 focus:outline-none border-none cursor-pointer"
              >
                <option value="">All Verdicts</option>
                <option value="Safe">Safe</option>
                <option value="Suspicious">Suspicious</option>
                <option value="Phishing">Phishing</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 border border-slate-850 text-xs font-semibold text-white rounded-xl hover:border-slate-700 cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* History logs table */}
      <div className="glass-card border border-slate-800/80 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-cyber-teal border-t-transparent rounded-full animate-spin inline-block"></div>
            <p className="text-xs text-slate-500 mt-2">Loading log rows...</p>
          </div>
        ) : scans.length === 0 ? (
          <div className="py-24 text-center text-xs text-slate-500">
            No threat records match these query criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-850/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="p-4 pl-6">Timestamp</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Content</th>
                  <th className="p-4 text-center">Risk Score</th>
                  <th className="p-4">Verdict</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/40 text-xs text-slate-300">
                {scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-900/20 transition-all">
                    <td className="p-4 pl-6 font-mono text-[10px] text-slate-500 shrink-0">
                      {new Date(scan.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-[10px] uppercase tracking-wide text-slate-400">
                      {scan.scan_type}
                    </td>
                    <td className="p-4 max-w-[280px] truncate" title={scan.content}>
                      {scan.content}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-slate-400">
                      {scan.risk_score}%
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${getVerdictStyle(scan.prediction)}`}>
                        {scan.prediction}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedScan(scan)}
                        className="p-1.5 bg-slate-900 border border-slate-850 text-slate-400 hover:text-white rounded-lg hover:border-slate-700 cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Scan Details Modal */}
      {selectedScan && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[999] flex items-center justify-center p-6">
          <div className="w-full max-w-lg glass-card border border-slate-800 rounded-3xl p-6 relative">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3.5 mb-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Threat Log Details
              </h4>
              <button 
                onClick={() => setSelectedScan(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Scanned Content</span>
                <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl text-xs font-mono leading-relaxed mt-1 text-slate-300">
                  {selectedScan.content}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-xl">
                  <span className="text-[9px] text-slate-500 uppercase font-bold">Verdict</span>
                  <div className="font-bold text-sm text-white mt-0.5">{selectedScan.prediction}</div>
                </div>
                <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-xl">
                  <span className="text-[9px] text-slate-500 uppercase font-bold">Risk Index</span>
                  <div className="font-bold text-sm text-white mt-0.5">{selectedScan.risk_score}%</div>
                </div>
                <div className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-xl">
                  <span className="text-[9px] text-slate-500 uppercase font-bold">Category</span>
                  <div className="font-bold text-xs text-white mt-0.5 truncate">{selectedScan.threat_category}</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">AI Core Explanation</span>
                <ul className="space-y-1.5 mt-1.5">
                  {selectedScan.reasons.map((reason, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                      <span className="text-cyber-blue shrink-0 font-bold">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-slate-800/80 pt-3">
                <span className="text-[10px] font-bold text-cyber-green uppercase tracking-wide">Mitigation Recommendations</span>
                <ul className="space-y-1.5 mt-1.5">
                  {selectedScan.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                      <span className="text-cyber-green shrink-0 font-bold">✓</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
