import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, ChevronDown, Archive, Gavel } from "lucide-react";
import "./Vault.css";

const VERDICT_COLORS = {
  "BUILD IT": "var(--success)",
  "BUILD A SMALLER VERSION FIRST": "var(--cyan)",
  "DON'T BUILD THIS": "var(--danger)",
};

export default function Vault({ ideas, onRemove }) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const filtered = ideas.filter((idea) => {
    const haystack = `${idea.title} ${idea.wordA} ${idea.wordB} ${idea.tags?.join(" ")}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  function exportIdea(idea) {
    const text = `${idea.title}\n${idea.tagline}\n\n${idea.description}\n\nFeasibility: ${idea.feasibility} | Impact: ${idea.impact} | Novelty: ${idea.novelty}\n\nPrototype path:\n${idea.prototypeSteps?.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nTags: ${idea.tags?.join(", ")}`;
    navigator.clipboard.writeText(text);
  }

  if (ideas.length === 0) {
    return (
      <div className="vault-empty">
        <Archive size={32} className="empty-icon" />
        <p>Your vault is empty</p>
        <span>Saved ideas will show up here. Swipe right or tap keep on a fused idea.</span>
      </div>
    );
  }

  return (
    <div className="vault">
      <div className="vault-search">
        <Search size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search saved ideas..."
        />
      </div>

      <div className="vault-list">
        <AnimatePresence>
          {filtered.map((idea) => (
            <motion.div
              key={idea.id}
              className="vault-item"
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div
                className="vault-item-header"
                onClick={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
              >
                <div>
                  <span className="vault-pair">{idea.wordA} × {idea.wordB}</span>
                  <h3>{idea.title}</h3>
                </div>
                <div className="vault-header-right">
                  {idea.gauntlet && (
                    <span
                      className="verdict-badge"
                      style={{ "--badge-color": VERDICT_COLORS[idea.gauntlet.verdict] ?? "var(--text-tertiary)" }}
                    >
                      <Gavel size={11} /> {idea.gauntlet.verdict}
                    </span>
                  )}
                  <motion.div animate={{ rotate: expandedId === idea.id ? 180 : 0 }}>
                    <ChevronDown size={18} />
                  </motion.div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === idea.id && (
                  <motion.div
                    className="vault-item-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <p className="vault-tagline">{idea.tagline}</p>
                    <p className="vault-description">{idea.description}</p>
                    <div className="vault-metrics">
                      <span>Feasibility <b>{idea.feasibility}</b></span>
                      <span>Impact <b>{idea.impact}</b></span>
                      <span>Novelty <b>{idea.novelty}</b></span>
                    </div>
                    {idea.gauntlet && (
                      <div className="vault-gauntlet">
                        <p><b>Skeptic:</b> {idea.gauntlet.skepticAttack}</p>
                        <p><b>Builder:</b> {idea.gauntlet.builderResponse}</p>
                        <p className="vault-gauntlet-reason">{idea.gauntlet.verdictReason}</p>
                      </div>
                    )}
                    <div className="vault-item-actions">
                      <button onClick={() => exportIdea(idea)}>Copy to clipboard</button>
                      <button className="danger" onClick={() => onRemove(idea.id)}>
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
