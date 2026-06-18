import { motion, useMotionValue, useTransform } from "framer-motion";
import { Check, X, Lightbulb, RefreshCw } from "lucide-react";
import Gauntlet from "./Gauntlet";
import "./IdeaCard.css";

export default function IdeaCard({ idea, onSave, onDiscard, onRemix, isRemixing, onRunGauntlet, gauntletResult, gauntletLoading }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-8, 0, 8]);
  const saveOpacity = useTransform(x, [20, 120], [0, 1]);
  const discardOpacity = useTransform(x, [-120, -20], [1, 0]);

  function handleDragEnd(_, info) {
    if (info.offset.x > 120) {
      onSave(idea);
    } else if (info.offset.x < -120) {
      onDiscard(idea);
    }
  }

  return (
    <motion.div
      className="idea-card"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.92, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      <motion.div className="swipe-badge save-badge" style={{ opacity: saveOpacity }}>
        <Check size={14} /> KEEP
      </motion.div>
      <motion.div className="swipe-badge discard-badge" style={{ opacity: discardOpacity }}>
        <X size={14} /> SKIP
      </motion.div>

      <div className="idea-card-header">
        <div className="fusion-pair">
          <button
            className="pair-word remixable"
            onClick={() => onRemix?.("A")}
            disabled={isRemixing}
            title="Remix this concept"
          >
            {idea.wordA}
            {isRemixing === "A" ? <RefreshCw size={11} className="spin" /> : <RefreshCw size={11} className="remix-icon" />}
          </button>
          <span className="pair-symbol">×</span>
          <button
            className="pair-word remixable"
            onClick={() => onRemix?.("B")}
            disabled={isRemixing}
            title="Remix this concept"
          >
            {idea.wordB}
            {isRemixing === "B" ? <RefreshCw size={11} className="spin" /> : <RefreshCw size={11} className="remix-icon" />}
          </button>
        </div>
        <Lightbulb size={18} className="idea-icon" />
      </div>

      <h2 className="idea-title">{idea.title}</h2>
      <p className="idea-tagline">{idea.tagline}</p>
      <p className="idea-description">{idea.description}</p>

      <div className="metrics-row">
        <Metric label="Feasibility" value={idea.feasibility} color="var(--cyan)" />
        <Metric label="Impact" value={idea.impact} color="var(--accent-bright)" />
        <Metric label="Novelty" value={idea.novelty} color="var(--success)" />
      </div>

      {idea.prototypeSteps?.length > 0 && (
        <div className="prototype-steps">
          <span className="steps-label">Prototype path</span>
          <ol>
            {idea.prototypeSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {idea.tags?.length > 0 && (
        <div className="tag-row">
          {idea.tags.map((tag) => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
        </div>
      )}

      <Gauntlet
        result={gauntletResult}
        isLoading={gauntletLoading}
        onRun={() => onRunGauntlet?.(idea)}
      />

      <div className="card-actions">
        <button className="action-btn discard" onClick={() => onDiscard(idea)}>
          <X size={18} />
        </button>
        <button className="action-btn save" onClick={() => onSave(idea)}>
          <Check size={18} />
        </button>
      </div>
    </motion.div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div className="metric">
      <div className="metric-ring">
        <svg viewBox="0 0 36 36" className="ring-svg">
          <circle cx="18" cy="18" r="15.5" className="ring-bg" />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            className="ring-fg"
            style={{
              stroke: color,
              strokeDasharray: `${(value / 100) * 97.4} 97.4`,
            }}
          />
        </svg>
        <span className="ring-value">{value}</span>
      </div>
      <span className="metric-label">{label}</span>
    </div>
  );
}
