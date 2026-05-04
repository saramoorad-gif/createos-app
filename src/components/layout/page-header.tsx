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
    <div className="pt-10">
      <div className="page-head">
        <div className="left">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#8AAABB] mb-3">
            {getDateLine()}
          </p>
          <h1>{headline}</h1>
          {subheading && (
            <div className="meta" style={{ marginTop: 10, fontFamily: "inherit", textTransform: "none", letterSpacing: 0, fontSize: 14, color: "#4A6070" }}>
              {subheading}
            </div>
          )}
        </div>
      </div>
      {stats && stats.length > 0 && (
        <div className="kpi-row">
          {stats.map((stat) => (
            <div key={stat.label} className="kpi">
              <span className="l">{stat.label}</span>
              <span className="v">{stat.value}</span>
              {stat.change && <span className="d up">{stat.change}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
