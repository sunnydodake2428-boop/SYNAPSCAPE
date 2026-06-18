import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { getDailySpark } from "../lib/groqClient";
import "./DailySpark.css";

export default function DailySpark({ onUse }) {
  const [spark, setSpark] = useState(null);

  useEffect(() => {
    getDailySpark().then(setSpark).catch(() => {});
  }, []);

  if (!spark) return null;

  return (
    <motion.button
      className="daily-spark"
      onClick={() => onUse(spark.wordA, spark.wordB)}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <Flame size={13} />
      <span className="spark-label">Today's spark</span>
      <span className="spark-pair">{spark.wordA} × {spark.wordB}</span>
    </motion.button>
  );
}