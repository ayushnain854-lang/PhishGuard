const API_BASE = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", async () => {
  const statusPred = document.getElementById("status-pred");
  const riskFill = document.getElementById("risk-fill");
  const riskScoreText = document.getElementById("risk-score-text");
  const domainNameText = document.getElementById("domain-name-text");
  const detailsBox = document.getElementById("details-box");
  const scanBtn = document.getElementById("scan-btn");
  const dashBtn = document.getElementById("dash-btn");

  // Helper to update UI elements based on scan result
  function updateUI(prediction, riskScore, reasons, domainName) {
    domainNameText.textContent = domainName;
    riskScoreText.textContent = `Risk: ${riskScore}%`;
    riskFill.style.width = `${riskScore}%`;

    // Reset classes
    statusPred.className = "status-value";
    statusPred.textContent = prediction;

    if (prediction === "Phishing") {
      statusPred.classList.add("phishing");
      riskFill.style.backgroundColor = "var(--color-phish)";
    } else if (prediction === "Suspicious") {
      statusPred.classList.add("warning");
      riskFill.style.backgroundColor = "var(--color-warn)";
    } else {
      statusPred.classList.add("safe");
      riskFill.style.backgroundColor = "var(--color-safe)";
    }

    // Display Explanations (XAI)
    if (reasons && reasons.length > 0) {
      detailsBox.innerHTML = reasons
        .map(reason => `<div style="margin-bottom: 4px;">• ${reason}</div>`)
        .join("");
      detailsBox.style.display = "block";
    } else {
      detailsBox.style.display = "none";
    }
  }

  // Scan current tab
  async function scanCurrentTab() {
    try {
      domainNameText.textContent = "Scanning...";
      statusPred.textContent = "Checking...";
      statusPred.className = "status-value";
      riskFill.style.width = "20%";
      riskFill.style.backgroundColor = "var(--text-muted)";

      // Get active Chrome tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url) {
        updateUI("Error", 0, ["Unable to access tab address."], "No Active Tab");
        return;
      }

      // Ignore browser-internal URLs
      if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("about:")) {
        updateUI("Safe", 0, ["Internal browser system page."], "Browser Settings");
        return;
      }

      // Parse domain name
      let domainName = "Unknown Domain";
      try {
        const parsedUrl = new URL(tab.url);
        domainName = parsedUrl.hostname;
      } catch (err) {
        domainName = tab.url;
      }

      // Call Flask Backend
      const response = await fetch(`${API_BASE}/predict-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: tab.url })
      });

      if (!response.ok) {
        throw new Error("HTTP error connecting to detector API");
      }

      const data = await response.json();
      updateUI(data.prediction, data.risk_score, data.reasons, domainName);

    } catch (error) {
      console.error("Scan Error:", error);
      updateUI("Offline", 0, ["Make sure the PhishGuard Flask API server is running on http://localhost:5000."], "Scanner Offline");
    }
  }

  // Initial Scan run
  scanCurrentTab();

  // Button Listeners
  scanBtn.addEventListener("click", scanCurrentTab);
  dashBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:5173" });
  });
});
