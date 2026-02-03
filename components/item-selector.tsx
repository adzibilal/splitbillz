'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Item, Assignment } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { calculateItemCostPerPerson } from '@/lib/dummy-data';

interface ItemSelectorProps {
  item: Item;
  assignments: Assignment[];
  isSelected: boolean;
  onToggle: (selected: boolean) => void;
}

export function ItemSelector({
  item,
  assignments,
  isSelected,
  onToggle,
}: ItemSelectorProps) {
  const [checked, setChecked] = useState(isSelected);
  
  useEffect(() => {
    setChecked(isSelected);
  }, [isSelected]);

  const itemAssignments = assignments.filter(a => a.itemId === item.id);
  const splitCount = itemAssignments.length || 1;
  const totalPrice = item.price * item.qty;
  const pricePerPerson = calculateItemCostPerPerson(item, assignments);

  const handleChange = (newChecked: boolean) => {
    setChecked(newChecked);
    onToggle(newChecked);
  };

  return (
    <Card
      className={`cursor-pointer transition-colors ${
        checked ? 'border-primary bg-primary/5' : ''
      }`}
      onClick={() => handleChange(!checked)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={checked}
            onCheckedChange={handleChange}
            className="mt-1"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium">{item.name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <p className="text-sm text-muted-foreground">
                {formatCurrency(item.price)}
                {item.qty > 1 && ` × ${item.qty}`}
              </p>
              {splitCount > 1 && (
                <Badge variant="secondary" className="text-xs">
                  Split with {splitCount - 1} {splitCount === 2 ? 'other' : 'others'}
                </Badge>
              )}
            </div>
            {itemAssignments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {itemAssignments.slice(0, 3).map(assignment => (
                  <Badge key={assignment.id} variant="outline" className="text-xs">
                    {assignment.userName}
                  </Badge>
                ))}
                {itemAssignments.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{itemAssignments.length - 3} more
                  </Badge>
                )}
              </div>
            )}
            {checked && splitCount > 1 && (
              <p className="text-sm font-medium text-primary mt-2">
                Your share: {formatCurrency(pricePerPerson)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
