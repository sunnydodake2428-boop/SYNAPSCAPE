import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import "./FusionInput.css";

export default function FusionInput({ wordA, wordB, onWordAChange, onWordBChange, onFuse, isLoading, error }) {
  const canFuse = wordA.trim().length > 0 && wordB.trim().length > 0 && !isLoading;

  function handleSubmit(e) {
    e.preventDefault();
    if (!canFuse) return;
    onFuse(wordA.trim(), wordB.trim());
  }

  function randomPair() {
    const words = [
      "rainforest", "blockchain", "jazz", "drone", "compost", "haiku",
      "satellite", "ceramics", "subway", "mycelium", "origami", "seismograph",
      "lighthouse", "fermentation", "graffiti", "coral reef", "vinyl", "wind turbine",
    ];
    const a = words[Math.floor(Math.random() * words.length)];
    let b = words[Math.floor(Math.random() * words.length)];
    while (b === a) b = words[Math.floor(Math.random() * words.length)];
    onWordAChange(a);
    onWordBChange(b);
  }

  return (
    <div className="fusion-input">
      <form onSubmit={handleSubmit} className="fusion-form">
        <div className="fusion-row">
          <div className="word-slot">
            <label htmlFor="wordA">Concept A</label>
            <input
              id="wordA"
              value={wordA}
              onChange={(e) => onWordAChange(e.target.value)}
              placeholder="rainforest"
              maxLength={40}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>

          <div className="fusion-symbol">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  className="symbol-orb pulsing"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <Sparkles size={18} />
                </motion.div>
              ) : (
                <motion.div
                  key="plus"
                  className="symbol-orb"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileHover={{ scale: 1.08 }}
                >
                  +
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="word-slot">
            <label htmlFor="wordB">Concept B</label>
            <input
              id="wordB"
              value={wordB}
              onChange={(e) => onWordBChange(e.target.value)}
              placeholder="blockchain"
              maxLength={40}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="fusion-actions">
          <button type="button" className="btn-ghost" onClick={randomPair} disabled={isLoading}>
            Surprise me
          </button>
          <motion.button
            type="submit"
            className="btn-fuse"
            disabled={!canFuse}
            whileTap={{ scale: 0.97 }}
          >
            {isLoading ? (
              <motion.span
                className="fuse-spinner"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              />
            ) : (
              <>
                Fuse ideas <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </div>

        {error && <p className="fusion-error">{error}</p>}
      </form>
    </div>
  );
}
