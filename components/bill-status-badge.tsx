import { Badge } from '@/components/ui/badge';
import { BillStatus } from '@/lib/types';

interface BillStatusBadgeProps {
  status: BillStatus;
}

export function BillStatusBadge({ status }: BillStatusBadgeProps) {
  const variants: Record<BillStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    PENDING_OCR: { variant: 'secondary', label: 'Processing' },
    OPEN: { variant: 'default', label: 'Open' },
    REVIEW: { variant: 'outline', label: 'In Review' },
    FINALIZED: { variant: 'outline', label: 'Finalized' },
  };

  const { variant, label } = variants[status];

  return <Badge variant={variant}>{label}</Badge>;
}
