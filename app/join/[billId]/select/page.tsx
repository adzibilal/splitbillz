'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MobileHeader } from '@/components/mobile-header';
import { BottomActionBar } from '@/components/bottom-action-bar';
import { ItemSelector } from '@/components/item-selector';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBill } from '@/context/bill-context';
import { calculateItemCostPerPerson } from '@/lib/calculations';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Info } from 'lucide-react';

export default function SelectItemsPage() {
  const router = useRouter();
  const params = useParams();
  const billId = params.billId as string;
  const {
    getBillWithDetails,
    assignItem,
    unassignItem,
    currentUserId,
    currentUserName
  } = useBill();
  const { toast } = useToast();

  const [billDetails, setBillDetails] = useState(getBillWithDetails(billId));
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Redirect if no user set
    if (!currentUserId || !currentUserName) {
      router.push(`/join/${billId}`);
      return;
    }

    const details = getBillWithDetails(billId);
    if (!details) return;

    setBillDetails(details);

    // Load previously selected items
    const userAssignments = details.assignments.filter(a => a.userId === currentUserId);
    setSelectedItems(new Set(userAssignments.map(a => a.itemId)));

    // Check bill status
    if (details.status === 'REVIEW') {
      router.push(`/join/${billId}/summary`);
    } else if (details.status === 'FINALIZED') {
      router.push(`/join/${billId}/payment`);
    }
  }, [billId, getBillWithDetails, currentUserId, currentUserName, router]);

  if (!billDetails || !currentUserId || !currentUserName) {
    return null;
  }

  const { items, assignments, taxServiceRate } = billDetails;

  const handleToggleItem = (itemId: string, selected: boolean) => {
    const newSelected = new Set(selectedItems);

    if (selected) {
      newSelected.add(itemId);
      assignItem(itemId, currentUserId, currentUserName);
    } else {
      newSelected.delete(itemId);
      unassignItem(itemId, currentUserId);
    }

    setSelectedItems(newSelected);
  };

  // Calculate total
  const subtotal = Array.from(selectedItems).reduce((sum, itemId) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return sum;
    return sum + calculateItemCostPerPerson(item, assignments);
  }, 0);

  const tax = subtotal * (taxServiceRate / 100);
  const total = subtotal + tax;

  const handleConfirm = () => {
    if (selectedItems.size === 0) {
      toast({
        title: 'No items selected',
        description: 'Please select at least one item',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Selection saved!',
      description: 'Wait for host to finalize the bill',
    });

    // In a real app, would wait for bill status to change
    // For demo, just show a message
    setTimeout(() => {
      router.push(`/join/${billId}/summary`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background pb-40">
      <MobileHeader title="Select Items" />

      <div className="container max-w-md mx-auto px-4 py-6">
        {/* User Info */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Selecting as</p>
                <p className="font-semibold">{currentUserName}</p>
              </div>
              <Badge variant="secondary">
                {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Select the items you ordered. If an item is shared, the cost will be split automatically.
          </AlertDescription>
        </Alert>

        {/* Items List */}
        <div className="space-y-3 mb-4">
          {items.map(item => (
            <ItemSelector
              key={item.id}
              item={item}
              assignments={assignments}
              isSelected={selectedItems.has(item.id)}
              onToggle={(selected) => handleToggleItem(item.id, selected)}
            />
          ))}
        </div>

        {/* Summary Card */}
        {selectedItems.size > 0 && (
          <Card className="sticky bottom-24 border-primary/50 bg-background">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Your Selection</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax & Service ({taxServiceRate}%)</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Your Total</span>
                  <span className="font-bold text-lg text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomActionBar
        primaryLabel="Confirm Selection"
        onPrimaryAction={handleConfirm}
        primaryDisabled={selectedItems.size === 0}
        info={
          selectedItems.size > 0
            ? `${selectedItems.size} ${selectedItems.size === 1 ? 'item' : 'items'} selected • ${formatCurrency(total)}`
            : 'Select at least one item'
        }
      />
    </div>
  );
}
