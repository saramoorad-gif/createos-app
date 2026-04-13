"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { healthScore } from "@/lib/placeholder-data";
import { Heart } from "lucide-react";

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

function getProgressColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

export function HealthScore() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Creator Health Score</CardTitle>
          <Heart className="h-4 w-4 text-terra-500" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Overall Score Circle */}
        <div className="flex items-center justify-center mb-5">
          <div className="relative flex items-center justify-center">
            <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#F5F0EB"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#C4714A"
                strokeWidth="8"
                strokeDasharray={`${healthScore.overall * 2.64} ${264 - healthScore.overall * 2.64}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-serif font-bold text-foreground">
                {healthScore.overall}
              </span>
              <span className="block text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-3">
          {Object.entries(healthScore.categories).map(([category, score]) => (
            <div key={category}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{category}</span>
                <span className={`text-xs font-semibold ${getScoreColor(score)}`}>
                  {score}
                </span>
              </div>
              <Progress
                value={score}
                className="h-1.5"
                indicatorClassName={getProgressColor(score)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
