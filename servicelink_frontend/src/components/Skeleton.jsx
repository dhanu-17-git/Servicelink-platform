const Skeleton = ({ className = '' }) => (
  <div className={`relative overflow-hidden rounded-2xl bg-gray-100 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.7s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
  </div>
);

export const CardSkeleton = ({ image = true }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 space-y-4">
    {image && <Skeleton className="h-36 w-full" />}
    <div className="flex items-center gap-4">
      <Skeleton className="h-14 w-14 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded-full" />
        <Skeleton className="h-3 w-1/2 rounded-full" />
      </div>
    </div>
    <Skeleton className="h-3 w-full rounded-full" />
    <Skeleton className="h-3 w-5/6 rounded-full" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-10 w-28 rounded-xl" />
    </div>
  </div>
);

export default Skeleton;
