import { Zap } from "lucide-react";
import "./UsageBadge.css";

const DAILY_LIMIT = 8;

export default function UsageBadge({ remaining }) {
  if (remaining === null) return null;

  const isLow = remaining <= 2;
  const isOut = remaining <= 0;

  return (
    <div className={`usage-badge ${isOut ? "out" : isLow ? "low" : ""}`}>
      <Zap size={12} />
      {isOut ? "No fusions left today" : `${remaining} of ${DAILY_LIMIT} fusions left today`}
    </div>
  );
}