import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import "./SynapseMap.css";

// Layout: group by generation (column = generation depth), stack siblings vertically.
function computeLayout(ideas) {
  const byId = new Map(ideas.map((i) => [i.id, i]));
  const generationGroups = new Map();

  ideas.forEach((idea) => {
    const gen = idea.generation ?? 0;
    if (!generationGroups.has(gen)) generationGroups.set(gen, []);
    generationGroups.get(gen).push(idea);
  });

  const COL_WIDTH = 240;
  const ROW_HEIGHT = 92;
  const positions = new Map();

  const sortedGens = [...generationGroups.keys()].sort((a, b) => a - b);
  sortedGens.forEach((gen) => {
    const items = generationGroups.get(gen);
    items.forEach((idea, idx) => {
      positions.set(idea.id, {
        x: gen * COL_WIDTH + 30,
        y: idx * ROW_HEIGHT + 40,
      });
    });
  });

  const edges = ideas
    .filter((i) => i.parentId && byId.has(i.parentId))
    .map((i) => ({
      from: positions.get(i.parentId),
      to: positions.get(i.id),
      id: `${i.parentId}-${i.id}`,
    }));

  const width = (Math.max(...sortedGens, 0) + 1) * COL_WIDTH + 60;
  const maxRows = Math.max(...[...generationGroups.values()].map((g) => g.length), 1);
  const height = maxRows * ROW_HEIGHT + 80;

  return { positions, edges, width, height };
}

export default function SynapseMap({ ideas, onClose, onSelect }) {
  const [hoveredId, setHoveredId] = useState(null);
  const { positions, edges, width, height } = useMemo(() => computeLayout(ideas), [ideas]);

  if (ideas.length === 0) {
    return (
      <div className="map-overlay" onClick={onClose}>
        <div className="map-empty" onClick={(e) => e.stopPropagation()}>
          <p>No ideas to map yet</p>
          <span>Save a few fused ideas, then remix them — the map shows how they branch.</span>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="map-overlay" onClick={onClose}>
      <motion.div
        className="map-panel"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="map-header">
          <div>
            <h2>Synapse Map</h2>
            <span>Lineage of your fused ideas — remixed ideas branch from their parent</span>
          </div>
          <button className="map-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="map-scroll">
          <svg width={width} height={height} className="map-svg">
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="var(--border-bright)" />
              </marker>
            </defs>

            {edges.map((edge) => {
              const isActive = hoveredId && (
                ideas.find((i) => positions.get(i.id) === edge.from)?.id === hoveredId ||
                ideas.find((i) => positions.get(i.id) === edge.to)?.id === hoveredId
              );
              const midX = (edge.from.x + edge.to.x) / 2 + 70;
              return (
                <path
                  key={edge.id}
                  d={`M ${edge.from.x + 140} ${edge.from.y + 20} C ${midX} ${edge.from.y + 20}, ${midX} ${edge.to.y + 20}, ${edge.to.x} ${edge.to.y + 20}`}
                  fill="none"
                  stroke={isActive ? "var(--accent)" : "var(--border-bright)"}
                  strokeWidth={isActive ? 2 : 1.5}
                  markerEnd="url(#arrowhead)"
                  className="map-edge"
                />
              );
            })}

            {ideas.map((idea) => {
              const pos = positions.get(idea.id);
              if (!pos) return null;
              const isRoot = !idea.parentId;
              return (
                <g
                  key={idea.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="map-node"
                  onMouseEnter={() => setHoveredId(idea.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onSelect?.(idea)}
                >
                  <rect
                    width="140"
                    height="40"
                    rx="9"
                    className={`node-rect ${isRoot ? "root" : ""} ${hoveredId === idea.id ? "hovered" : ""}`}
                  />
                  <text x="12" y="16" className="node-pair">{idea.wordA} × {idea.wordB}</text>
                  <text x="12" y="31" className="node-title">
                    {idea.title.length > 22 ? idea.title.slice(0, 22) + "…" : idea.title}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="map-legend">
          <span><span className="legend-dot root" /> Original fusion</span>
          <span><span className="legend-dot" /> Remixed branch</span>
        </div>
      </motion.div>
    </div>
  );
}
