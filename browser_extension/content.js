// Content Script for PhishGuard AI

let overlayDiv = null;

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "show_loading_overlay") {
    showLoading();
  } else if (message.action === "display_scan_result") {
    removeLoading();
    showModal(message.payload);
  } else if (message.action === "display_scan_error") {
    removeLoading();
    showToast(message.error, "error");
  }
});

function showLoading() {
  removeLoading();
  overlayDiv = document.createElement("div");
  overlayDiv.id = "phishguard-loading-overlay";
  Object.assign(overlayDiv.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    width: "250px",
    padding: "16px",
    borderRadius: "12px",
    backgroundColor: "rgba(17, 24, 39, 0.95)",
    color: "#f3f4f6",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.6)",
    border: "1px solid #3b82f6",
    zIndex: "999999",
    fontFamily: "system-ui, sans-serif",
    fontSize: "14px",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  });

  overlayDiv.innerHTML = `
    <div style="width: 18px; height: 18px; border: 2px solid #06b6d4; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
    <div>Analyzing selection text...</div>
    <style>
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  `;
  document.body.appendChild(overlayDiv);
}

function removeLoading() {
  const loading = document.getElementById("phishguard-loading-overlay");
  if (loading) loading.remove();
}

function showModal(data) {
  // Remove existing modals if any
  const existing = document.getElementById("phishguard-result-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "phishguard-result-modal";
  
  // Decide colors
  let color = "#10b981"; // Safe
  let bg = "rgba(16, 185, 129, 0.1)";
  if (data.prediction === "Phishing") {
    color = "#ef4444";
    bg = "rgba(239, 68, 68, 0.1)";
  } else if (data.prediction === "Suspicious") {
    color = "#f59e0b";
    bg = "rgba(245, 158, 11, 0.1)";
  }

  Object.assign(modal.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    width: "320px",
    maxHeight: "85vh",
    overflowY: "auto",
    padding: "18px",
    borderRadius: "16px",
    backgroundColor: "#0f172a",
    color: "#f3f4f6",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.75)",
    border: `1px solid ${color}`,
    zIndex: "999999",
    fontFamily: "system-ui, -apple-system, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    backdropFilter: "blur(12px)"
  });

  const reasonsList = data.reasons.map(r => `<li style="margin-bottom: 4px;">${r}</li>`).join("");
  const recsList = data.recommendations.map(r => `<li style="margin-bottom: 4px;">${r}</li>`).join("");

  modal.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
      <span style="font-weight: 700; color: #3b82f6; font-size: 14px;">🛡️ PhishGuard AI Scanner</span>
      <button id="phishguard-close-btn" style="background: transparent; border: none; color: #9ca3af; cursor: pointer; font-size: 16px;">✕</button>
    </div>
    
    <div style="background-color: ${bg}; border-radius: 8px; padding: 12px; border-left: 4px solid ${color};">
      <div style="font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: bold; letter-spacing: 0.05em;">Verdict</div>
      <div style="font-size: 20px; font-weight: 800; color: ${color}; margin-top: 2px;">${data.prediction}</div>
      <div style="font-size: 12px; margin-top: 4px;">Risk: <strong>${data.riskScore}%</strong> | Conf: <strong>${data.confidenceScore}%</strong></div>
    </div>
    
    <div style="font-size: 12px;">
      <strong style="color: #06b6d4;">Threat Category:</strong> ${data.category}
    </div>

    <div style="font-size: 12px;">
      <div style="font-weight: bold; margin-bottom: 4px; color: #9ca3af;">AI Threat Explanation:</div>
      <ul style="margin: 0; padding-left: 16px; color: #cbd5e1; list-style-type: square;">
        ${reasonsList}
      </ul>
    </div>

    <div style="font-size: 12px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px;">
      <div style="font-weight: bold; margin-bottom: 4px; color: #10b981;">Recommendations:</div>
      <ul style="margin: 0; padding-left: 16px; color: #cbd5e1;">
        ${recsList}
      </ul>
    </div>
  `;

  document.body.appendChild(modal);

  // Close event
  document.getElementById("phishguard-close-btn").addEventListener("click", () => {
    modal.remove();
  });
}

function showToast(text, type = "info") {
  const toast = document.createElement("div");
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    left: "20px",
    padding: "12px 18px",
    borderRadius: "8px",
    backgroundColor: type === "error" ? "#ef4444" : "#3b82f6",
    color: "white",
    fontSize: "13px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    zIndex: "999999",
    fontFamily: "system-ui, sans-serif"
  });
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// 4. Injected scan buttons for Gmail and Outlook portal pages
function injectPortalButtons() {
  const isGmail = window.location.hostname.includes("mail.google.com");
  const isOutlook = window.location.hostname.includes("outlook.live.com") || window.location.hostname.includes("outlook.office.com");

  if (isGmail) {
    // Find Gmail subject headings or action areas
    const subjects = document.querySelectorAll(".hP"); // Subject lines in Gmail threads
    subjects.forEach(subject => {
      if (!subject.querySelector(".phishguard-inject")) {
        const btn = document.createElement("span");
        btn.className = "phishguard-inject";
        btn.textContent = "🛡️ Scan PhishGuard";
        Object.assign(btn.style, {
          marginLeft: "10px",
          padding: "3px 8px",
          fontSize: "11px",
          color: "#06b6d4",
          backgroundColor: "rgba(6, 182, 212, 0.12)",
          border: "1px solid #06b6d4",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold"
        });

        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          // Extract email body text (Gmail emails usually sit in elements with class "a3s")
          const emailBody = document.querySelector(".a3s.aiL");
          const textToScan = emailBody ? emailBody.innerText : subject.innerText;
          
          chrome.runtime.sendMessage({
            action: "trigger_selection_scan",
            text: textToScan
          });
        });
        subject.appendChild(btn);
      }
    });
  }
}

// Injections poll
setInterval(injectPortalButtons, 3000);
