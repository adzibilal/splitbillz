import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Item, Assignment } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface ItemCardProps {
  item: Item;
  assignments?: Assignment[];
  showAssignments?: boolean;
  children?: React.ReactNode;
}

export function ItemCard({
  item,
  assignments = [],
  showAssignments = false,
  children,
}: ItemCardProps) {
  const itemAssignments = assignments.filter(a => a.itemId === item.id);
  const totalPrice = item.price * item.qty;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{item.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground">
                {formatCurrency(item.price)}
                {item.qty > 1 && ` × ${item.qty}`}
              </p>
              {item.qty > 1 && (
                <Badge variant="secondary" className="text-xs">
                  {formatCurrency(totalPrice)}
                </Badge>
              )}
            </div>
            {showAssignments && itemAssignments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {itemAssignments.map(assignment => (
                  <Badge key={assignment.id} variant="outline" className="text-xs">
                    {assignment.userName}
                  </Badge>
                ))}
                {itemAssignments.length > 1 && (
                  <Badge variant="secondary" className="text-xs">
                    Split {itemAssignments.length} ways
                  </Badge>
                )}
              </div>
            )}
          </div>
          {children && <div className="flex-shrink-0">{children}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
