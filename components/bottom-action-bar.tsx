import { Button } from '@/components/ui/button';

interface BottomActionBarProps {
  primaryLabel: string;
  onPrimaryAction: () => void;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  secondaryDisabled?: boolean;
  info?: React.ReactNode;
}

export function BottomActionBar({
  primaryLabel,
  onPrimaryAction,
  primaryDisabled = false,
  secondaryLabel,
  onSecondaryAction,
  secondaryDisabled = false,
  info,
}: BottomActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container px-4 py-3 space-y-2">
        {info && <div className="text-sm text-muted-foreground">{info}</div>}
        <div className="flex gap-2">
          {secondaryLabel && onSecondaryAction && (
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={onSecondaryAction}
              disabled={secondaryDisabled}
            >
              {secondaryLabel}
            </Button>
          )}
          <Button
            className="flex-1 h-12 text-base font-semibold"
            onClick={onPrimaryAction}
            disabled={primaryDisabled}
          >
            {primaryLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
