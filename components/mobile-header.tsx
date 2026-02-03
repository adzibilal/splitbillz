'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function MobileHeader({
  title,
  showBack = true,
  onBack,
  rightAction,
}: MobileHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2 flex-1">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          )}
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>
        {rightAction && <div className="flex items-center">{rightAction}</div>}
      </div>
    </header>
  );
}
