interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} />;
}

export function FlightCardSkeleton() {
  return (
    <div className="card p-6 md:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="skeleton w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <div className="skeleton h-5 w-24 rounded" />
              <div className="skeleton h-3 w-36 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="skeleton h-8 w-20 rounded" />
              <div className="skeleton h-3 w-12 rounded" />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-px w-full rounded" />
            </div>
            <div className="flex flex-col items-end space-y-2">
              <div className="skeleton h-8 w-20 rounded" />
              <div className="skeleton h-3 w-12 rounded" />
            </div>
          </div>
        </div>
        <div className="lg:border-l lg:pl-8 space-y-3 min-w-[180px]" style={{ borderColor: 'var(--color-border)' }}>
          <div className="skeleton h-3 w-20 rounded ml-auto" />
          <div className="skeleton h-10 w-32 rounded ml-auto" />
          <div className="skeleton h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <div className="skeleton h-5 w-28 rounded" />
          <div className="skeleton h-3 w-40 rounded" />
        </div>
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="skeleton h-4 w-16 rounded" />
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-4 w-16 rounded" />
      </div>
    </div>
  );
}