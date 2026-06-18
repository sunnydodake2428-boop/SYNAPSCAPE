import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Loader2 } from "lucide-react";
import "./KeywordSuggester.css";

const CATEGORY_COLORS = {
  nature: "var(--success)",
  technology: "var(--cyan)",
  art: "var(--accent-bright)",
  science: "var(--cyan)",
  culture: "var(--accent-bright)",
  history: "var(--text-secondary)",
  default: "var(--text-secondary)",
};

export default function KeywordSuggester({ onPick, onRequestSuggestions, isLoading, suggestions }) {
  return (
    <div className="keyword-suggester">
      <button className="suggest-trigger" onClick={onRequestSuggestions} disabled={isLoading}>
        {isLoading ? <Loader2 size={14} className="spin" /> : <Wand2 size={14} />}
        AI suggest concepts
      </button>

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            className="suggestion-chips"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {suggestions.map((s, i) => (
              <motion.button
                key={`${s.word}-${i}`}
                className="suggestion-chip"
                style={{ "--chip-color": CATEGORY_COLORS[s.category] ?? CATEGORY_COLORS.default }}
                onClick={() => onPick(s.word)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="chip-dot" />
                {s.word}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
