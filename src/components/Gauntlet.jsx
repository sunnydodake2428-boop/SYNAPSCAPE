import { motion, AnimatePresence } from "framer-motion";
import { Swords, ShieldCheck, Gavel, Loader2 } from "lucide-react";
import "./Gauntlet.css";

const VERDICT_STYLES = {
  "BUILD IT": { color: "var(--success)", label: "BUILD IT" },
  "BUILD A SMALLER VERSION FIRST": { color: "var(--cyan)", label: "BUILD SMALLER FIRST" },
  "DON'T BUILD THIS": { color: "var(--danger)", label: "DON'T BUILD THIS" },
};

export default function Gauntlet({ result, isLoading, onRun }) {
  if (!result && !isLoading) {
    return (
      <button className="gauntlet-trigger" onClick={onRun}>
        <Swords size={14} />
        Run the Gauntlet
      </button>
    );
  }

  if (isLoading) {
    return (
      <div className="gauntlet-loading">
        <Loader2 size={16} className="spin" />
        Skeptic and builder are arguing it out...
      </div>
    );
  }

  const verdictStyle = VERDICT_STYLES[result.verdict] ?? VERDICT_STYLES["BUILD A SMALLER VERSION FIRST"];

  return (
    <motion.div
      className="gauntlet-result"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="gauntlet-round skeptic">
        <div className="round-label"><Swords size={13} /> THE SKEPTIC</div>
        <p>{result.skepticAttack}</p>
      </div>

      <div className="gauntlet-round builder">
        <div className="round-label"><ShieldCheck size={13} /> THE BUILDER</div>
        <p>{result.builderResponse}</p>
      </div>

      <div className="gauntlet-verdict" style={{ "--verdict-color": verdictStyle.color }}>
        <div className="verdict-top">
          <Gavel size={14} />
          <span className="verdict-label">{verdictStyle.label}</span>
          <span className="verdict-confidence">{result.confidence}% confidence</span>
        </div>
        <p className="verdict-reason">{result.verdictReason}</p>
      </div>
    </motion.div>
  );
}
