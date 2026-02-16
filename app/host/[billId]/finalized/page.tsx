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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBill } from '@/context/bill-context';
import { calculateUserTotal } from '@/lib/calculations';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle2, Clock, Bell, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function FinalizedBillPage() {
  const params = useParams();
  const billId = params.billId as string;
  const { getBillWithDetails, updatePaymentStatus } = useBill();
  const { toast } = useToast();

  const [billDetails, setBillDetails] = useState(getBillWithDetails(billId));

  useEffect(() => {
    const details = getBillWithDetails(billId);
    if (details) setBillDetails(details);
  }, [billId, getBillWithDetails]);

  if (!billDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { items, assignments, users, taxServiceRate, paymentInfo, restaurantName } = billDetails;

  // Group users by payment status
  const paidUsers = users.filter(u => u.hasPaid);
  const pendingUsers = users.filter(u => !u.hasPaid);

  const totalBill = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalTaxService = totalBill * (taxServiceRate / 100);
  const grandTotal = totalBill + totalTaxService;

  const totalCollected = paidUsers.reduce((sum, user) => {
    const userTotal = calculateUserTotal(user.id, items, assignments, taxServiceRate);
    return sum + userTotal.total;
  }, 0);

  const collectionProgress = (totalCollected / grandTotal) * 100;

  const handleSendReminder = (userName: string) => {
    toast({
      title: 'Reminder sent',
      description: `Reminder sent to ${userName}`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Bill Settlement" />

      <div className="container max-w-md mx-auto px-4 py-6">
        {/* Progress Card */}
        <Card className="mb-8 border-primary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Collection Progress</span>
              <span className="text-primary">{Math.round(collectionProgress)}%</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={collectionProgress} className="h-3 mb-4" />
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-muted-foreground">Collected</p>
                <p className="font-bold text-lg text-green-600">{formatCurrency(totalCollected)}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Total Bill</p>
                <p className="font-bold text-lg">{formatCurrency(grandTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="pending">
              Pending ({pendingUsers.length})
            </TabsTrigger>
            <TabsTrigger value="paid">
              Paid ({paidUsers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingUsers.length === 0 ? (
              <div className="text-center py-12 px-4 border-2 border-dashed rounded-xl">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-bold text-lg">All Collected!</h3>
                <p className="text-muted-foreground">Everyone has paid their share.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map(user => {
                  const userTotal = calculateUserTotal(user.id, items, assignments, taxServiceRate);
                  return (
                    <Card key={user.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold">{user.name}</p>
                              <p className="text-sm font-semibold text-primary">
                                {formatCurrency(userTotal.total)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendReminder(user.name)}
                            >
                              <Bell className="h-4 w-4 mr-1" />
                              Remind
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => updatePaymentStatus(billId, user.id, true)}
                            >
                              Mark Paid
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="paid" className="space-y-4">
            {paidUsers.length === 0 ? (
              <div className="text-center py-12 px-4 border-2 border-dashed rounded-xl">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-bold">No Payments Yet</h3>
                <p className="text-muted-foreground text-sm">Waiting for participants to confirm.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paidUsers.map(user => {
                  const userTotal = calculateUserTotal(user.id, items, assignments, taxServiceRate);
                  return (
                    <Card key={user.id} className="border-green-500/20 bg-green-500/5">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center font-bold text-green-700">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold">{user.name}</p>
                              <p className="text-sm font-semibold text-green-600">
                                {formatCurrency(userTotal.total)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-green-100 text-green-800 hover:bg-green-200"
                            onClick={() => updatePaymentStatus(billId, user.id, false)}
                          >
                            Mark Unpaid
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {paymentInfo && (
          <div className="mt-8">
            <h3 className="font-bold mb-4">Host Payment Info</h3>
            <PaymentInfoCard paymentInfo={paymentInfo} />
          </div>
        )}
      </div>
    </div>
  );
}
