import { BrandRadarGrid } from "@/components/brand-radar/brand-radar-grid";

export default function BrandRadarPage() {
  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Brand Radar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-matched brands based on your niche, engagement, and content style.
        </p>
      </div>
      <BrandRadarGrid />
    </div>
  );
}
