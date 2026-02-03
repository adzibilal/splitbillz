import { LoadingSkeleton } from '@/components/loading-skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-md mx-auto px-4 py-6">
        <LoadingSkeleton />
      </div>
    </div>
  );
}
