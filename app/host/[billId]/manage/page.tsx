'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MobileHeader } from '@/components/mobile-header';
import { BottomActionBar } from '@/components/bottom-action-bar';
import { ItemCard } from '@/components/item-card';
import { ShareLinkDialog } from '@/components/share-link-dialog';
import { BillStatusBadge } from '@/components/bill-status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useBill } from '@/context/bill-context';
import { Users, Share2, Check, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AssignmentDialog } from '@/components/assignment-dialog';

export default function ManageBillPage() {
  const router = useRouter();
  const params = useParams();
  const billId = params.billId as string;
  const { getBillWithDetails, updateBill, fetchBill, isLoading } = useBill();

  useEffect(() => {
    fetchBill(billId);
  }, [billId, fetchBill]);

  const billDetails = getBillWithDetails(billId);

  if (isLoading && !billDetails) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!billDetails) {
    return <div className="p-4 text-center">Bill not found</div>;
  }

  const { items, assignments, users } = billDetails;

  const assignedItems = items.filter(item =>
    assignments.some(a => a.itemId === item.id)
  );
  const unassignedItems = items.filter(item =>
    !assignments.some(a => a.itemId === item.id)
  );

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const taxAmount = subtotal * (billDetails.taxServiceRate / 100);
  const total = subtotal + taxAmount;

  const handleLockBill = async () => {
    await updateBill(billId, { status: 'REVIEW' });
    router.push(`/host/${billId}/review`);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <MobileHeader
        title="Manage Bill"
        rightAction={
          <ShareLinkDialog
            billId={billId}
            trigger={
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            }
          />
        }
      />

      <div className="container max-w-md mx-auto px-4 py-6">
        {/* Bill Info */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {billDetails.restaurantName || 'Bill Details'}
              </CardTitle>
              <BillStatusBadge status={billDetails.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Host</span>
              <span className="font-medium">{billDetails.hostName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Items</span>
              <span className="font-medium">{items.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Participants</span>
              <span className="font-medium">{users.length}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-semibold">Total Amount</span>
              <span className="font-bold text-lg">{formatCurrency(total)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Share Section */}
        <Card className="mb-6 border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Share2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Share this bill</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Send the link to your friends so they can select their items
                </p>
                <ShareLinkDialog
                  billId={billId}
                  trigger={
                    <Button size="sm" className="w-full">
                      Share Link
                    </Button>
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participants */}
        {users.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {users.map(user => (
                  <Badge key={user.id} variant="secondary">
                    {user.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assigned Items */}
        {assignedItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Check className="h-5 w-5 text-green-600" />
              <h2 className="font-semibold">Assigned Items ({assignedItems.length})</h2>
            </div>
            <div className="space-y-2">
              {assignedItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  assignments={assignments}
                  showAssignments
                  actions={
                    <AssignmentDialog
                      item={item}
                      billId={billId}
                    />
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Unassigned Items */}
        {unassignedItems.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <X className="h-5 w-5 text-amber-600" />
              <h2 className="font-semibold">Unassigned Items ({unassignedItems.length})</h2>
            </div>
            <div className="space-y-2">
              {unassignedItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  actions={
                    <AssignmentDialog
                      item={item}
                      billId={billId}
                    />
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Bill Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Tax & Service ({billDetails.taxServiceRate}%)
                </span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomActionBar
        primaryLabel="Lock for Review"
        onPrimaryAction={handleLockBill}
        info={
          unassignedItems.length > 0
            ? `${unassignedItems.length} item(s) still unassigned`
            : 'All items assigned'
        }
      />
    </div>
  );
}
