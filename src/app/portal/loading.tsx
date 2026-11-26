export default function PortalLoading() {
  return (
    <div className="space-y-8">
      {/* Top Welcome Skeleton with Left-to-Right Shimmer Shine */}
      <div className="bg-ivory p-6 sm:p-8 border border-sage-dark/40 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6 animate-shimmer rounded-sm">
        <div className="space-y-3">
          <div className="h-3 w-32 bg-sage/70 rounded-xs" />
          <div className="h-7 w-64 bg-sage rounded-xs" />
          <div className="h-4 w-48 bg-sage/50 rounded-xs" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-sage rounded-xs" />
          <div className="h-10 w-28 bg-sage/70 rounded-xs" />
        </div>
      </div>

      {/* Grid Cards Skeleton with Shimmer Effect */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-ivory p-6 border border-sage-dark/40 shadow-card space-y-4 animate-shimmer rounded-sm">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-sage rounded-xs" />
              <div className="w-8 h-8 rounded-full bg-sage/60" />
            </div>
            <div className="h-6 w-40 bg-sage rounded-xs" />
            <div className="h-14 w-full bg-sage-light/80 rounded-xs" />
            <div className="h-10 w-full bg-forest/20 rounded-xs" />
          </div>
        ))}
      </div>

      {/* Recent Activity Skeleton with Shimmer */}
      <div className="bg-ivory p-6 sm:p-8 border border-sage-dark/40 shadow-card space-y-4 animate-shimmer rounded-sm">
        <div className="h-5 w-44 bg-sage rounded-xs" />
        <div className="divide-y divide-sage-dark/30">
          {[1, 2, 3].map((row) => (
            <div key={row} className="py-4 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-48 bg-sage rounded-xs" />
                <div className="h-3 w-32 bg-sage/50 rounded-xs" />
              </div>
              <div className="h-8 w-24 bg-sage rounded-xs" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
