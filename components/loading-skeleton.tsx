export function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-muted rounded-lg p-4">
          <div className="h-5 bg-muted-foreground/20 rounded w-3/4 mb-2" />
          <div className="h-4 bg-muted-foreground/20 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-4 animate-pulse">
      <div className="space-y-3">
        <div className="h-5 bg-muted rounded w-2/3" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-3/4" />
      </div>
    </div>
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-4 animate-pulse">
      <div className="flex justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-1/3" />
        </div>
        <div className="w-16 h-8 bg-muted rounded" />
      </div>
    </div>
  );
}
