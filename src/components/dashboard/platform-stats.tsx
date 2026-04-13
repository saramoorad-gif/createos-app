"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { platformStats, totalFollowers } from "@/lib/placeholder-data";

const platformConfig: Record<
  string,
  { label: string; color: string; progressColor: string; dotColor: string }
> = {
  tiktok: {
    label: "TikTok",
    color: "text-foreground",
    progressColor: "bg-black",
    dotColor: "bg-black",
  },
  instagram: {
    label: "Instagram",
    color: "text-pink-700",
    progressColor: "bg-pink-500",
    dotColor: "bg-pink-500",
  },
  youtube: {
    label: "YouTube",
    color: "text-red-700",
    progressColor: "bg-red-500",
    dotColor: "bg-red-500",
  },
};

export function PlatformStats() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Platform Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(platformStats).map(([platform, stats]) => {
          const config = platformConfig[platform];
          const pct = Math.round((stats.followers / totalFollowers) * 100);
          return (
            <div key={platform} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${config.dotColor}`} />
                  <span className="text-sm font-semibold">{config.label}</span>
                </div>
                <span className="text-sm font-serif font-bold">
                  {(stats.followers / 1000).toFixed(0)}K
                </span>
              </div>
              <Progress
                value={pct}
                className="h-2"
                indicatorClassName={config.progressColor}
              />
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Eng: {stats.engagementRate}%</span>
                <span>Avg views: {(stats.avgViews / 1000).toFixed(1)}K</span>
                <span>{stats.growth}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
