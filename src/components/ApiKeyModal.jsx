import { useState } from "react";
import { motion } from "framer-motion";
import { X, Key } from "lucide-react";
import "./ApiKeyModal.css";

export default function ApiKeyModal({ currentKey, onSave, onClose }) {
  const [key, setKey] = useState(currentKey || "");

  function handleSave(e) {
    e.preventDefault();
    onSave(key.trim());
    onClose();
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
          <div className="modal-title">
            <Key size={16} />
            <span>Groq API Key</span>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <p className="modal-desc">
          Free at console.groq.com/keys. Stored only in your browser's localStorage — never sent anywhere except Groq.
        </p>

        <form onSubmit={handleSave}>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="gsk_..."
            autoFocus
          />
          <button type="submit" className="modal-save">Save key</button>
        </form>
      </motion.div>
    </div>
  );
}
