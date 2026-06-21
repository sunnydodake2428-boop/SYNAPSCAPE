import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Archive, Swords, TrendingUp } from "lucide-react";
import { getStats } from "../lib/statsDb";
import "./StatsView.css";

export default function StatsView() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  if (!stats) return <div className="stats-loading">Loading your stats...</div>;

  return (
    <motion.div className="stats-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="stats-grid">
        <StatCard icon={<Flame size={18} />} label="Ideas fused" value={stats.totalFused} />
        <StatCard icon={<Archive size={18} />} label="Saved to vault" value={stats.totalSaved} />
        <StatCard icon={<Swords size={18} />} label="Gauntlet runs" value={stats.gauntletTotal} />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Survival rate"
          value={stats.survivalRate !== null ? `${stats.survivalRate}%` : "—"}
        />
      </div>

      {stats.gauntletTotal > 0 && (
        <div className="verdict-breakdown">
          <span className="breakdown-label">Verdict breakdown</span>
          <VerdictBar label="Build it" count={stats.verdicts["BUILD IT"]} total={stats.gauntletTotal} color="var(--success)" />
          <VerdictBar label="Build smaller first" count={stats.verdicts["BUILD A SMALLER VERSION FIRST"]} total={stats.gauntletTotal} color="var(--cyan)" />
          <VerdictBar label="Don't build" count={stats.verdicts["DON'T BUILD THIS"]} total={stats.gauntletTotal} color="var(--danger)" />
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function VerdictBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="verdict-row">
      <span className="verdict-row-label">{label}</span>
      <div className="verdict-track">
        <div className="verdict-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="verdict-row-count">{count}</span>
    </div>
  );
}