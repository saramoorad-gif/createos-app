"use client";

// Skeleton loading components

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#F0EAE0] rounded-[8px] ${className || ""}`}>
      <style>{`
        @keyframes shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
      `}</style>
      <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.4), transparent)", animation: "shimmer 1.5s ease-in-out infinite" }} />
    </div>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex items-center gap-0 mt-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center">
          {i > 0 && <div className="w-px h-10 bg-[#D8E8EE] mx-6" />}
          <div>
            <Shimmer className="h-7 w-20 mb-1" />
            <Shimmer className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
      <div className="flex gap-4 px-5 py-3 bg-[#F0EAE0] border-b border-[#D8E8EE]">
        {Array.from({ length: cols }).map((_, i) => (
          <Shimmer key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-5 py-4 border-b border-[#EEE8E0] last:border-b-0">
          {Array.from({ length: cols }).map((_, j) => (
            <Shimmer key={j} className={`h-4 flex-1 ${j === 0 ? "max-w-[120px]" : ""}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5">
          <div className="flex items-center justify-between mb-3">
            <Shimmer className="h-5 w-28" />
            <Shimmer className="h-6 w-16" />
          </div>
          <Shimmer className="h-3 w-full mb-2" />
          <Shimmer className="h-[3px] w-full mb-2" />
          <div className="flex justify-between">
            <Shimmer className="h-3 w-20" />
            <Shimmer className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#D8E8EE] pb-6 pt-10">
        <Shimmer className="h-3 w-40 mb-3" />
        <Shimmer className="h-9 w-72 mb-2" />
        <Shimmer className="h-4 w-56" />
        <StatCardsSkeleton />
      </div>
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-4">
          <Shimmer className="h-3 w-32 mb-4" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <Shimmer className="h-10 w-[3px]" />
              <div className="flex-1">
                <Shimmer className="h-4 w-48 mb-1" />
                <Shimmer className="h-3 w-32" />
              </div>
              <Shimmer className="h-3 w-16" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Shimmer key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export { Shimmer };
