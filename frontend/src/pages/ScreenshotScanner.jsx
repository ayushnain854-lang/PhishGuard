import React, { useState } from "react";
import { scannerAPI } from "../utils/api";
import { 
  Upload, HelpCircle, ArrowRight, ShieldCheck, ShieldAlert, 
  AlertTriangle, RefreshCw, FileText, CheckCircle 
} from "lucide-react";

const ScreenshotScanner = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setError("");
    setResult(null);
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Invalid file type. Please upload an image file (PNG, JPG).");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleScan = async () => {
    setError("");
    setResult(null);
    if (!selectedFile) {
      setError("Please choose or drag a screenshot image first.");
      return;
    }

    setLoading(true);
    try {
      const data = await scannerAPI.scanImage(selectedFile);
      setResult(data);
    } catch (e) {
      console.error(e);
      setError("Failed to run OCR scanning. Verify your backend is running.");
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
      {/* Description header */}
      <div className="glass-card border border-slate-800/80 rounded-3xl p-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
          Screenshot Optical Character Recognition (OCR) Scanner
        </h3>
        <p className="text-xs text-slate-500">
          Upload screenshots of suspicious banking emails, SMS alerts, or crypto giveaways. The AI extracts text dynamically via OCR and runs security scans.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Drag & Drop Area */}
        <div className="glass-card border border-slate-800/80 rounded-3xl p-6 space-y-5">
          <div className="border-2 border-dashed border-slate-800 hover:border-cyber-teal/55 rounded-2xl p-8 flex flex-col items-center justify-center text-center relative transition-all duration-300">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Upload Preview" 
                className="max-h-56 rounded-lg object-contain border border-slate-800" 
              />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="p-3.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-full">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Drag & Drop screenshot here</p>
                  <p className="text-xs text-slate-500 mt-1">Accepts PNG, JPG, JPEG up to 5MB</p>
                </div>
              </div>
            )}
          </div>

          {previewUrl && (
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
              <button 
                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                className="text-cyber-red hover:underline"
              >
                Remove
              </button>
            </div>
          )}

          {error && <p className="text-xs font-semibold text-cyber-red">{error}</p>}

          <button
            onClick={handleScan}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyber-blue to-cyber-teal hover:opacity-90 py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-cyan-glow disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                Reading visual characters...
              </>
            ) : (
              <>
                Run OCR Security Scan
                <ArrowRight className="h-4.5 w-4.5" />
              </>
            )}
          </button>
        </div>

        {/* Right Output Area */}
        <div className="space-y-6">
          {loading && (
            <div className="glass-card border border-slate-800/80 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[380px]">
              <div className="w-12 h-12 border-4 border-cyber-teal border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="text-sm font-bold text-white">Extracting Pixel Textures</p>
                <p className="text-xs text-slate-500 mt-1">Initializing EasyOCR pipeline, reading textual vectors...</p>
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="glass-card border border-slate-800/80 rounded-3xl p-12 flex flex-col items-center justify-center text-center text-slate-500 space-y-3 min-h-[380px]">
              <HelpCircle className="h-10 w-10 text-slate-600 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-slate-400">Waiting for OCR Upload</p>
                <p className="text-xs mt-1 max-w-[240px]">Submit an image capture of the suspected message to trigger visual extraction.</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-5">
              {/* Verdict header */}
              <div className={`border rounded-3xl p-5 flex items-center gap-4 ${verdict.color} ${verdict.glow}`}>
                <div className="p-3 bg-slate-900 border border-slate-850 rounded-2xl">
                  <VerdictIcon className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">OCR Verdict</div>
                  <div className="text-2xl font-black">{result.prediction}</div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Threat Category: <strong>{result.threat_category}</strong>
                  </p>
                </div>
              </div>

              {/* OCR Extracted Text Box */}
              <div className="glass-card border border-slate-800/80 rounded-3xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-4 w-4 text-cyber-teal" />
                  OCR Extracted Text
                </h4>
                <div className="bg-slate-950/80 border border-slate-900 p-4 rounded-xl text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                  {result.extracted_text || "No text could be extracted."}
                </div>
              </div>

              {/* Score bar */}
              <div className="glass-card border border-slate-800/80 rounded-3xl p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Risk Index</span>
                    <h4 className="text-2xl font-extrabold text-white mt-1">{result.risk_score}%</h4>
                  </div>
                  <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Confidence</span>
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

              {/* Recommendations */}
              <div className="glass-card border border-slate-800/80 rounded-3xl p-5">
                <h4 className="text-xs font-bold text-cyber-green uppercase tracking-wider mb-3">
                  Mitigation Recommendations
                </h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
                      <CheckCircle className="h-4 w-4 text-cyber-green shrink-0 mt-0.5" />
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

export default ScreenshotScanner;
