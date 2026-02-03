'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MobileHeader } from '@/components/mobile-header';
import { PaymentInfoCard } from '@/components/payment-info-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBill } from '@/context/bill-context';
import { calculateUserTotal, calculateItemCostPerPerson } from '@/lib/dummy-data';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, PartyPopper } from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const billId = params.billId as string;
  const { getBillWithDetails, updatePaymentStatus, currentUserId, currentUserName } = useBill();
  const { toast } = useToast();
  
  const [billDetails, setBillDetails] = useState(getBillWithDetails(billId));
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    // Redirect if no user set
    if (!currentUserId || !currentUserName) {
      router.push(`/join/${billId}`);
      return;
    }

    const details = getBillWithDetails(billId);
    if (!details) return;

    setBillDetails(details);

    // Check if user already paid
    const user = details.users.find(u => u.id === currentUserId);
    if (user?.hasPaid) {
      setHasPaid(true);
    }

    // Check bill status
    if (details.status === 'OPEN') {
      router.push(`/join/${billId}/select`);
    } else if (details.status === 'REVIEW') {
      router.push(`/join/${billId}/summary`);
    }
  }, [billId, getBillWithDetails, currentUserId, currentUserName, router]);

  if (!billDetails || !currentUserId || !billDetails.paymentInfo) {
    return null;
  }

  const { items, assignments, taxServiceRate, paymentInfo } = billDetails;

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

  const handleMarkAsPaid = () => {
    setHasPaid(true);
    updatePaymentStatus(currentUserId, true);
    
    toast({
      title: 'Payment confirmed!',
      description: 'Host has been notified',
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader title="Payment" showBack={false} />

      <div className="container max-w-md mx-auto px-4 py-6">
        {/* Payment Status */}
        {hasPaid ? (
          <Alert className="mb-6 border-green-500/50 bg-green-500/5">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    Payment Confirmed
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Thank you! The host has been notified of your payment.
                  </p>
                </div>
                <PartyPopper className="h-6 w-6 text-green-600 flex-shrink-0" />
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 border-primary/50 bg-primary/5">
            <AlertDescription>
              <p className="font-semibold mb-1">Ready to pay</p>
              <p className="text-sm text-muted-foreground">
                Transfer the amount below to the host's account
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Your Total */}
        <Card className="mb-6 border-primary/50">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Amount to Pay</p>
              <p className="text-4xl font-bold text-primary mb-1">
                {formatCurrency(total)}
              </p>
              <p className="text-sm text-muted-foreground">
                As {currentUserName}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <div className="mb-6">
          <PaymentInfoCard paymentInfo={paymentInfo} amount={total} />
        </div>

        {/* Your Items Breakdown */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Button */}
        {!hasPaid && (
          <Button
            size="lg"
            className="w-full h-14 text-base"
            onClick={handleMarkAsPaid}
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            I Have Paid
          </Button>
        )}

        {hasPaid && (
          <Card className="border-green-500/50 bg-green-500/5">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-green-900 dark:text-green-100">
                Payment Confirmed
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                You're all set! Thanks for using Splitbillz.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
