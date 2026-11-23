const API_BASE = "http://localhost:5000";

// 1. Create context menu on installation.
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "scan-selection-phishguard",
    title: "Scan selected text with PhishGuard AI",
    contexts: ["selection"]
  });
});

// 2. Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "scan-selection-phishguard" && tab.id) {
    const selectedText = info.selectionText;
    
    // Send a message to content script to display "Loading" indicator
    chrome.tabs.sendMessage(tab.id, { action: "show_loading_overlay" });

    try {
      // Call Flask Backend for text scan
      const response = await fetch(`${API_BASE}/predict-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedText })
      });

      if (!response.ok) throw new Error("API scan failed");

      const data = await response.json();

      // Dispatch results to content script to display a modal
      chrome.tabs.sendMessage(tab.id, {
        action: "display_scan_result",
        payload: {
          scannedText: selectedText,
          prediction: data.prediction,
          riskScore: data.risk_score,
          confidenceScore: data.confidence_score,
          category: data.threat_category,
          reasons: data.reasons,
          recommendations: data.recommendations
        }
      });

    } catch (err) {
      console.error(err);
      chrome.tabs.sendMessage(tab.id, {
        action: "display_scan_error",
        error: "Could not connect to PhishGuard AI detector API."
      });
    }
  }
});

// 3. Passive Navigation Monitor (Updates Extension Badges)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only trigger once URL is completed loading
  if (changeInfo.status === "complete" && tab.url) {
    // Ignore internal protocols
    if (tab.url.startsWith("chrome:") || tab.url.startsWith("edge:") || tab.url.startsWith("about:")) {
      chrome.action.setBadgeText({ tabId, text: "" });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/predict-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: tab.url })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.prediction === "Phishing") {
          chrome.action.setBadgeText({ tabId, text: "HIGH" });
          chrome.action.setBadgeBackgroundColor({ tabId, color: "#EF4444" });
        } else if (data.prediction === "Suspicious") {
          chrome.action.setBadgeText({ tabId, text: "WARN" });
          chrome.action.setBadgeBackgroundColor({ tabId, color: "#F59E0B" });
        } else {
          chrome.action.setBadgeText({ tabId, text: "SAFE" });
          chrome.action.setBadgeBackgroundColor({ tabId, color: "#10B981" });
        }
      }
    } catch (e) {
      // Backend is offline, clear badges quietly
      chrome.action.setBadgeText({ tabId, text: "" });
    }
  }
});

// 4. Handle runtime messages (e.g. from content scripts inline buttons)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "trigger_selection_scan" && sender.tab && sender.tab.id) {
    const tabId = sender.tab.id;
    const textToScan = request.text;
    
    chrome.tabs.sendMessage(tabId, { action: "show_loading_overlay" });
    
    fetch(`${API_BASE}/predict-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: textToScan })
    })
      .then(response => {
        if (!response.ok) throw new Error("API scan failed");
        return response.json();
      })
      .then(data => {
        chrome.tabs.sendMessage(tabId, {
          action: "display_scan_result",
          payload: {
            scannedText: textToScan,
            prediction: data.prediction,
            riskScore: data.risk_score,
            confidenceScore: data.confidence_score,
            category: data.threat_category,
            reasons: data.reasons,
            recommendations: data.recommendations
          }
        });
      })
      .catch(err => {
        console.error(err);
        chrome.tabs.sendMessage(tabId, {
          action: "display_scan_error",
          error: "Could not connect to PhishGuard AI detector API."
        });
      });
  }
});
