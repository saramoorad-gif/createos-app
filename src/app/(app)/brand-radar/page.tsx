import { PageHeader } from "@/components/layout/page-header";
import { Star, Sparkles, TrendingUp, Search, Bell } from "lucide-react";

const upcomingFeatures = [
  { icon: Search, title: "AI Brand Matching", desc: "Get matched with brands hiring creators in your niche based on your content style and engagement." },
  { icon: Star, title: "Creator Ease Ratings", desc: "See how other creators rate working with each brand — payment speed, revision limits, creative freedom." },
  { icon: Sparkles, title: "AI Pitch Generator", desc: "Generate personalized outreach pitches for any brand based on your profile and their campaign style." },
  { icon: TrendingUp, title: "Rate Benchmarking", desc: "See what brands are paying creators like you — UGC rates, influencer rates, and whitelisting fees." },
  { icon: Bell, title: "Brand Alerts", desc: "Get notified when a brand in your niche starts a new campaign or increases their creator budget." },
];

export default function BrandRadarPage() {
  return (
    <div>
      <PageHeader
        headline={<>Brand <em className="italic text-[#7BAFC8]">Radar</em></>}
        subheading="Discover brands hiring creators in your niche."
      />

      <div className="max-w-2xl mx-auto text-center py-8">
        <div className="h-16 w-16 rounded-full bg-[#F2F8FB] border-[1.5px] border-[#D8E8EE] flex items-center justify-center mx-auto mb-4">
          <Star className="h-7 w-7 text-[#7BAFC8]" />
        </div>
        <h2 className="text-[22px] font-serif text-[#1A2C38] mb-2">Coming soon</h2>
        <p className="text-[14px] font-sans text-[#4A6070] max-w-md mx-auto mb-8">
          Brand Radar uses AI to match you with brands actively hiring creators. We&apos;re building something special — here&apos;s what&apos;s coming.
        </p>

        <div className="space-y-3 text-left">
          {upcomingFeatures.map(f => (
            <div key={f.title} className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-[10px] bg-[#F2F8FB] flex items-center justify-center flex-shrink-0">
                <f.icon className="h-5 w-5 text-[#7BAFC8]" />
              </div>
              <div>
                <h3 className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{f.title}</h3>
                <p className="text-[13px] font-sans text-[#8AAABB] mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-[#F2F8FB] border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5">
          <p className="text-[13px] font-sans text-[#3D6E8A]" style={{ fontWeight: 500 }}>
            Want early access? We&apos;ll notify you when Brand Radar launches.
          </p>
          <button className="mt-3 bg-[#1E3F52] text-white rounded-[8px] px-6 py-2.5 text-[13px] font-sans hover:bg-[#2a5269] transition-colors" style={{ fontWeight: 600 }}>
            Notify me when it launches
          </button>
        </div>
      </div>
    </div>
  );
}
