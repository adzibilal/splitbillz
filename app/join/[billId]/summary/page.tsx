'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MobileHeader } from '@/components/mobile-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useBill } from '@/context/bill-context';
import { calculateUserTotal, calculateItemCostPerPerson } from '@/lib/dummy-data';
import { formatCurrency } from '@/lib/utils';
import { Clock, RefreshCw, Users } from 'lucide-react';

export default function SummaryPage() {
  const router = useRouter();
  const params = useParams();
  const billId = params.billId as string;
  const { getBillWithDetails, currentUserId, currentUserName } = useBill();
  
  const [billDetails, setBillDetails] = useState(getBillWithDetails(billId));
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Redirect if no user set
    if (!currentUserId || !currentUserName) {
      router.push(`/join/${billId}`);
      return;
    }

    const details = getBillWithDetails(billId);
    if (!details) return;

    setBillDetails(details);

    // Check bill status
    if (details.status === 'OPEN') {
      router.push(`/join/${billId}/select`);
    } else if (details.status === 'FINALIZED') {
      router.push(`/join/${billId}/payment`);
    }
  }, [billId, getBillWithDetails, currentUserId, currentUserName, router]);

  if (!billDetails || !currentUserId) {
    return null;
  }

  const { items, assignments, users, taxServiceRate } = billDetails;

  // Get user's items
  const userAssignments = assignments.filter(a => a.userId === currentUserId);
  const userItems = userAssignments
    .map(a => items.find(i => i.id === a.itemId))
    .filter(Boolean);

  // Calculate user's total
  const { subtotal, tax, total } = calculateUserTotal(
    currentUserId,
    items,
    assignments,
    taxServiceRate
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const details = getBillWithDetails(billId);
      setBillDetails(details);
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader 
        title="Summary"
        rightAction={
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        }
      />

      <div className="container max-w-md mx-auto px-4 py-6">
        {/* Status Alert */}
        <Alert className="mb-6 border-amber-500/50 bg-amber-500/5">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <p className="font-semibold mb-1">Waiting for host to finalize</p>
            <p className="text-sm text-muted-foreground">
              The host is reviewing the bill. You'll be notified when payment info is ready.
            </p>
          </AlertDescription>
        </Alert>

        {/* User Info */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your name</p>
                <p className="font-semibold text-lg">{currentUserName}</p>
              </div>
              <Badge variant="outline">In Review</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Your Items */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userItems.length > 0 ? (
              <>
                <div className="space-y-2">
                  {userItems.map(item => {
                    if (!item) return null;
                    const itemAssignments = assignments.filter(a => a.itemId === item.id);
                    const costPerPerson = calculateItemCostPerPerson(item, assignments);
                    const isSplit = itemAssignments.length > 1;

                    return (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          {isSplit && (
                            <p className="text-xs text-muted-foreground">
                              Split with {itemAssignments.length - 1} {itemAssignments.length === 2 ? 'other' : 'others'}
                            </p>
                          )}
                        </div>
                        <p className="font-medium">{formatCurrency(costPerPerson)}</p>
                      </div>
                    );
                  })}
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax & Service ({taxServiceRate}%)</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Your Total</span>
                    <span className="font-bold text-xl text-primary">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                You haven't selected any items
              </p>
            )}
          </CardContent>
        </Card>

        {/* Other Participants */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Other Participants ({users.length - 1})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {users
                .filter(u => u.id !== currentUserId)
                .map(user => (
                  <Badge key={user.id} variant="secondary">
                    {user.name}
                  </Badge>
                ))}
              {users.length === 1 && (
                <p className="text-sm text-muted-foreground">
                  No other participants yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Pull down to refresh or wait for host to finalize
          </p>
        </div>
      </div>
    </div>
  );
}
