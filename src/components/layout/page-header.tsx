"use client";

type Stat = { value: string; label: string; change?: string };

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
    <div className="border-b border-[#D8E8EE] pb-6 mb-8 pt-10">
      <p className="text-[11px] font-sans font-500 uppercase tracking-[2px] text-[#8AAABB] mb-3">
        {getDateLine()}
      </p>
      <h1 className="text-[34px] font-serif font-normal leading-[1.15] text-[#1A2C38] mb-1">
        {headline}
      </h1>
      {subheading && (
        <p className="text-[14px] font-sans text-[#4A6070] mt-2">{subheading}</p>
      )}
      {stats && stats.length > 0 && (
        <div className="flex items-center gap-0 mt-6 -mb-1">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center">
              {i > 0 && <div className="w-px h-10 bg-[#D8E8EE] mx-6" />}
              <div>
                <p className="text-[24px] font-serif font-normal text-[#1A2C38] leading-tight">{stat.value}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[12px] font-sans text-[#8AAABB]">{stat.label}</span>
                  {stat.change && <span className="text-[11px] font-sans text-[#3D7A58]">{stat.change}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
