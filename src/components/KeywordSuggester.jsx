import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Loader2, ArrowRight } from "lucide-react";
import "./KeywordSuggester.css";

const CATEGORY_COLORS = {
  nature: "var(--success)",
  technology: "var(--cyan)",
  tech: "var(--cyan)",
  art: "var(--accent-bright)",
  science: "var(--cyan)",
  culture: "var(--accent-bright)",
  history: "var(--text-secondary)",
  default: "var(--text-secondary)",
};

export default function KeywordSuggester({
  onPick,
  onRequestInitial,
  onRequestPartner,
  isLoading,
  suggestions,
  wordA,
  wordB,
}) {
  const slotFilled = { A: Boolean(wordA.trim()), B: Boolean(wordB.trim()) };
  const nextSlot = !slotFilled.A ? "A" : !slotFilled.B ? "B" : null;

  function handleTriggerClick() {
    if (nextSlot === "B" && slotFilled.A) {
      onRequestPartner(wordA.trim());
    } else {
      onRequestInitial();
    }
  }

  return (
    <div className="keyword-suggester">
      {nextSlot === "B" && slotFilled.A ? (
        <button className="suggest-trigger partner-mode" onClick={handleTriggerClick} disabled={isLoading}>
          {isLoading ? <Loader2 size={14} className="spin" /> : <Wand2 size={14} />}
          Suggest a partner for "{wordA}" <ArrowRight size={12} />
        </button>
      ) : (
        <button className="suggest-trigger" onClick={handleTriggerClick} disabled={isLoading || nextSlot === null}>
          {isLoading ? <Loader2 size={14} className="spin" /> : <Wand2 size={14} />}
          AI suggest concepts
        </button>
      )}

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
                title={s.whyGood ?? ""}
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