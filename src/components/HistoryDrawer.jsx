import { motion, AnimatePresence } from "framer-motion";
import { X, History as HistoryIcon } from "lucide-react";
import "./HistoryDrawer.css";

export default function HistoryDrawer({ open, onClose, history, onSelect }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="drawer-overlay"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="history-drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <div className="drawer-header">
              <span><HistoryIcon size={15} /> History</span>
              <button onClick={onClose}><X size={18} /></button>
            </div>

            <div className="drawer-list">
              {history.length === 0 ? (
                <p className="drawer-empty">No fusions yet — your past ideas will show up here.</p>
              ) : (
                history.map((item) => (
                  <button key={item.id} className="drawer-item" onClick={() => onSelect(item)}>
                    <span className="drawer-pair">{item.wordA} × {item.wordB}</span>
                    <span className="drawer-title">{item.title}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

