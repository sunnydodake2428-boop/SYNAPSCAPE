import { useState } from "react";
import { motion } from "framer-motion";
import { X, LogOut, Mail, ChevronRight, ArrowLeft, } from "lucide-react";
import "./SettingsModal.css";





const SUPPORT_EMAIL = "sunnydodake2428@gmail.com"; // <-- replace with your real email
const LINKEDIN_URL = "https://www.linkedin.com/in/sanmay-dodake-a705a1342";
const ISSUE_OPTIONS = [
  { label: "Fusion isn't generating ideas", subject: "SynapseScape — Fusion not working" },
  { label: "Gauntlet verdict seems wrong", subject: "SynapseScape — Gauntlet issue" },
  { label: "Vault / saved ideas problem", subject: "SynapseScape — Vault issue" },
  { label: "Login / account issue", subject: "SynapseScape — Login issue" },
  { label: "Something else", subject: "SynapseScape — Support request" },
];

export default function SettingsModal({ onClose, onLogout }) {
  const [view, setView] = useState("main"); // "main" | "help"
  const [customIssue, setCustomIssue] = useState("");

  function openMail(subject, body = "") {
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }

  function handleCustomSubmit(e) {
    e.preventDefault();
    if (!customIssue.trim()) return;
    openMail("SynapseScape — Support request", customIssue.trim());
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <div className="modal-header">
          {view === "help" ? (
            <button className="back-btn" onClick={() => setView("main")}>
              <ArrowLeft size={16} /> Settings
            </button>
          ) : (
            <span className="modal-title">Settings</span>
          )}
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {view === "main" ? (
          <div className="settings-list">
            <button className="settings-row" onClick={() => setView("help")}>
              <Mail size={16} />
              <span>Help & Support</span>
              <ChevronRight size={14} className="row-chevron" />
            </button>
            <button className="settings-row danger" onClick={onLogout}>
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        ) : (
          <div className="help-list">
            {ISSUE_OPTIONS.slice(0, 4).map((opt) => (
              <button key={opt.label} className="settings-row" onClick={() => openMail(opt.subject)}>
                <span>{opt.label}</span>
                <ChevronRight size={14} className="row-chevron" />
              </button>
            ))}

            <form onSubmit={handleCustomSubmit} className="custom-issue-form">
              <label>Other — describe your issue</label>
              <textarea
                value={customIssue}
                onChange={(e) => setCustomIssue(e.target.value)}
                placeholder="Tell us what's going wrong..."
                rows={3}
              />
              <button type="submit" className="custom-issue-submit">
                <Mail size={14} /> Email this to support
              </button>
            </form>
          </div>
        )}

       <div className="credit-chip">
  <div className="credit-identity">
    <div className="credit-avatar">S</div>
    <div className="credit-text">
      <span className="credit-name">SanmayOne</span>
      <span className="credit-role">Developer</span>
    </div>
  </div>
  <div className="credit-links">
    <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" title="LinkedIn">
      <LinkedinIcon />
    </a>
    <a href={`mailto:${SUPPORT_EMAIL}`} title="Email">
      <Mail size={13} />
    </a>
  </div>
</div>


      </motion.div>
    </div>
  );


  function LinkedinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/>
    </svg>
  );
}

}