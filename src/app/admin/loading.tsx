export default function AdminLoading() {
  return (
    <div className="space-y-8">
      {/* Top Banner Skeleton with Shimmer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage-dark/40 pb-6 animate-shimmer">
        <div className="space-y-2">
          <div className="h-3 w-36 bg-sage/70 rounded-xs" />
          <div className="h-8 w-60 bg-sage rounded-xs" />
          <div className="h-4 w-72 bg-sage/50 rounded-xs" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-36 bg-sage rounded-xs" />
          <div className="h-10 w-32 bg-sage/70 rounded-xs" />
        </div>
      </div>

      {/* 4 Stat Metric Cards with Shimmer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-ivory p-6 border border-sage-dark/40 shadow-sm space-y-3 animate-shimmer rounded-sm">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-sage/70 rounded-xs" />
              <div className="w-8 h-8 rounded-full bg-sage/50" />
            </div>
            <div className="h-8 w-20 bg-sage rounded-xs" />
            <div className="h-3 w-32 bg-sage/50 rounded-xs" />
          </div>
        ))}
      </div>

      {/* Tables Skeleton with Shimmer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2].map((col) => (
          <div key={col} className="bg-ivory p-6 border border-sage-dark/40 shadow-sm space-y-4 animate-shimmer rounded-sm">
            <div className="h-5 w-40 bg-sage rounded-xs" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((r) => (
                <div key={r} className="p-3 bg-sage-light/60 rounded-xs flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-sage rounded-xs" />
                    <div className="h-3 w-20 bg-sage/50 rounded-xs" />
                  </div>
                  <div className="h-6 w-16 bg-sage rounded-xs" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
