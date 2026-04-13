"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import type { CuppingScores } from "@/lib/types";
import { CUPPING_DIMENSIONS } from "@/lib/constants";

interface CuppingRadarProps {
  scores: CuppingScores;
  size?: "sm" | "lg";
}

export function CuppingRadar({ scores, size = "sm" }: CuppingRadarProps) {
  const data = CUPPING_DIMENSIONS.map((d) => ({
    dimension: d.label,
    score: scores[d.key as keyof CuppingScores],
  }));

  const dimensions = size === "sm" ? { w: 200, h: 200 } : { w: 300, h: 300 };

  return (
    <div style={{ width: dimensions.w, height: dimensions.h }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#E7E5E4" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: size === "sm" ? 10 : 12, fill: "#78716C" }}
          />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          <Radar
            dataKey="score"
            stroke="#065F46"
            fill="#065F46"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
