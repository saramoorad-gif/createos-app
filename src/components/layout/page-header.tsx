"use client";

type Stat = {
  value: string;
  label: string;
  change?: string;
};

interface PageHeaderProps {
  headline: React.ReactNode;
  subheading?: string;
  stats?: Stat[];
}

function getDateLine() {
  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const month = now.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  const date = now.getDate();
  const year = now.getFullYear();
  return `${day} · ${month} ${date}, ${year}`;
}

export function PageHeader({ headline, subheading, stats }: PageHeaderProps) {
  return (
    <div className="border-b border-[#E5E0D8] pb-6 mb-8 pt-8">
      {/* Date line */}
      <p className="text-[11px] font-sans font-500 uppercase tracking-[2px] text-[#9A9088] mb-3">
        {getDateLine()}
      </p>

      {/* Headline */}
      <h1 className="text-[36px] font-serif font-normal leading-[1.15] text-[#1C1714] mb-1">
        {headline}
      </h1>

      {/* Subheading */}
      {subheading && (
        <p className="text-[13px] font-sans text-[#9A9088] mt-2">
          {subheading}
        </p>
      )}

      {/* Stats bar */}
      {stats && stats.length > 0 && (
        <div className="flex items-center gap-0 mt-6 -mb-1">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center">
              {i > 0 && <div className="w-px h-10 bg-[#E5E0D8] mx-6" />}
              <div>
                <p className="text-[24px] font-serif font-normal text-[#1C1714] leading-tight">
                  {stat.value}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[12px] font-sans text-[#9A9088]">
                    {stat.label}
                  </span>
                  {stat.change && (
                    <span className="text-[11px] font-sans text-[#4A9060]">
                      {stat.change}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
