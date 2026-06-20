import { forwardRef } from "react";
import "./ShareCard.css";

const VERDICT_COLORS = {
  "BUILD IT": "#4ADE80",
  "BUILD A SMALLER VERSION FIRST": "#22D3EE",
  "DON'T BUILD THIS": "#FF6B6B",
};

const ShareCard = forwardRef(function ShareCard({ idea }, ref) {
  return (
    <div ref={ref} className="share-card">
      <div className="share-card-brand">
        <div className="share-brand-mark">S</div>
        <span>SynapseScape</span>
      </div>

      <span className="share-pair">{idea.wordA} × {idea.wordB}</span>
      <h1 className="share-title">{idea.title}</h1>
      <p className="share-tagline">{idea.tagline}</p>

      <div className="share-metrics">
        <ShareMetric label="Feasibility" value={idea.feasibility} color="#22D3EE" />
        <ShareMetric label="Impact" value={idea.impact} color="#9B82FF" />
        <ShareMetric label="Novelty" value={idea.novelty} color="#4ADE80" />
      </div>

      {idea.gauntlet && (
        <div
          className="share-verdict"
          style={{ "--vc": VERDICT_COLORS[idea.gauntlet.verdict] ?? "#8B92A5" }}
        >
          {idea.gauntlet.verdict} · {idea.gauntlet.confidence}% confidence
        </div>
      )}

      <span className="share-footer">Fused at synapscape.vercel.app</span>
    </div>
  );
});

export default ShareCard;

function ShareMetric({ label, value, color }) {
  return (
    <div className="share-metric">
      <div className="share-ring-value" style={{ color }}>{value}</div>
      <span className="share-ring-label">{label}</span>
    </div>
  );
}