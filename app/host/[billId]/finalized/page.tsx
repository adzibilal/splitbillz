'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MobileHeader } from '@/components/mobile-header';
import { BillStatusBadge } from '@/components/bill-status-badge';
import { PaymentInfoCard } from '@/components/payment-info-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useBill } from '@/context/bill-context';
import { calculateUserTotal } from '@/lib/dummy-data';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle2, Clock, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function FinalizedBillPage() {
  const params = useParams();
  const billId = params.billId as string;
  const { getBillWithDetails } = useBill();
  const { toast } = useToast();
  
  const [billDetails, setBillDetails] = useState(getBillWithDetails(billId));

  useEffect(() => {
    const details = getBillWithDetails(billId);
    setBillDetails(details);
  }, [billId, getBillWithDetails]);

  if (!billDetails || !billDetails.paymentInfo) {
    return <div>Bill not found or not finalized</div>;
  }

  const { items, assignments, users, taxServiceRate, paymentInfo } = billDetails;

  // Calculate totals per user
  const userTotals = users.map(user => {
    const totals = calculateUserTotal(user.id, items, assignments, taxServiceRate);
    return {
      user,
      ...totals,
    };
  });

  const grandTotal = userTotals.reduce((sum, ut) => sum + ut.total, 0);
  const paidUsers = users.filter(u => u.hasPaid);
  const pendingUsers = users.filter(u => !u.hasPaid);
  const collectedAmount = paidUsers.reduce((sum, user) => {
    const userTotal = userTotals.find(ut => ut.user.id === user.id);
    return sum + (userTotal?.total || 0);
  }, 0);
  const progressPercentage = (collectedAmount / grandTotal) * 100;

  const handleSendReminder = (userName: string) => {
    toast({
      title: 'Reminder sent',
      description: `Reminder sent to ${userName}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="Bill Settlement" showBack={false} />

      <div className="container max-w-md mx-auto px-4 py-6">
        {/* Status Card */}
        <Card className="mb-6 border-green-500/50 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Bill Finalized</h3>
                <p className="text-sm text-muted-foreground">
                  Payment information has been shared. Track payment status below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bill Summary */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {billDetails.restaurantName || 'Bill Summary'}
              </CardTitle>
              <BillStatusBadge status={billDetails.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold">{formatCurrency(grandTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Collected</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(collectedAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-semibold text-amber-600">
                  {formatCurrency(grandTotal - collectedAmount)}
                </span>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              {paidUsers.length} of {users.length} paid ({Math.round(progressPercentage)}%)
            </p>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <div className="mb-6">
          <PaymentInfoCard paymentInfo={paymentInfo} />
        </div>

        {/* Payment Status */}
        <div className="space-y-6">
          {/* Paid */}
          {paidUsers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h2 className="font-semibold">Paid ({paidUsers.length})</h2>
              </div>
              <div className="space-y-2">
                {paidUsers.map(user => {
                  const userTotal = userTotals.find(ut => ut.user.id === user.id);
                  return (
                    <Card key={user.id} className="border-green-500/50 bg-green-500/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(userTotal?.total || 0)}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Paid
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pending */}
          {pendingUsers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <h2 className="font-semibold">Pending ({pendingUsers.length})</h2>
              </div>
              <div className="space-y-2">
                {pendingUsers.map(user => {
                  const userTotal = userTotals.find(ut => ut.user.id === user.id);
                  return (
                    <Card key={user.id} className="border-amber-500/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-amber-600" />
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(userTotal?.total || 0)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendReminder(user.name)}
                          >
                            <Bell className="h-4 w-4 mr-1" />
                            Remind
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
