'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MobileHeader } from '@/components/mobile-header';
import { BottomActionBar } from '@/components/bottom-action-bar';
import { BillStatusBadge } from '@/components/bill-status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useBill } from '@/context/bill-context';
import { calculateUserTotal } from '@/lib/dummy-data';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

export default function ReviewBillPage() {
  const router = useRouter();
  const params = useParams();
  const billId = params.billId as string;
  const { getBillWithDetails, updateBill } = useBill();
  const { toast } = useToast();
  
  const [billDetails, setBillDetails] = useState(getBillWithDetails(billId));
  const [bank, setBank] = useState('');
  const [account, setAccount] = useState('');
  const [accountName, setAccountName] = useState(billDetails?.hostName || '');
  const [isFinalizing, setIsFinalizing] = useState(false);

  useEffect(() => {
    const details = getBillWithDetails(billId);
    setBillDetails(details);
    if (details) {
      setAccountName(details.hostName);
    }
  }, [billId, getBillWithDetails]);

  if (!billDetails) {
    return <div>Bill not found</div>;
  }

  const { items, assignments, users, taxServiceRate } = billDetails;

  // Calculate totals per user
  const userTotals = users.map(user => {
    const totals = calculateUserTotal(user.id, items, assignments, taxServiceRate);
    const userItems = assignments
      .filter(a => a.userId === user.id)
      .map(a => items.find(i => i.id === a.itemId))
      .filter(Boolean);
    
    return {
      user,
      ...totals,
      items: userItems,
    };
  });

  const grandTotal = userTotals.reduce((sum, ut) => sum + ut.total, 0);

  const handleFinalize = () => {
    if (!bank.trim() || !account.trim() || !accountName.trim()) {
      toast({
        title: 'Payment info required',
        description: 'Please fill in all payment details',
        variant: 'destructive',
      });
      return;
    }

    setIsFinalizing(true);

    setTimeout(() => {
      updateBill(billId, {
        status: 'FINALIZED',
        paymentInfo: {
          bank: bank.trim(),
          account: account.trim(),
          name: accountName.trim(),
        },
      });

      toast({
        title: 'Bill finalized!',
        description: 'Payment info sent to all participants',
      });

      router.push(`/host/${billId}/finalized`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <MobileHeader title="Review Bill" />

      <div className="container max-w-md mx-auto px-4 py-6">
        {/* Status Alert */}
        <Card className="mb-6 border-amber-500/50 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Bill Locked</h3>
                <p className="text-sm text-muted-foreground">
                  Participants can no longer change their selections. Review the breakdown and add payment info to finalize.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bill Header */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {billDetails.restaurantName || 'Bill Summary'}
              </CardTitle>
              <BillStatusBadge status={billDetails.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <span className="font-semibold">Grand Total</span>
              <span className="font-bold text-xl">{formatCurrency(grandTotal)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Per Person Breakdown */}
        <div className="mb-6">
          <h2 className="font-semibold mb-3">Breakdown by Person</h2>
          <div className="space-y-3">
            {userTotals.map(({ user, subtotal, tax, total, items: userItems }) => (
              <Card key={user.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{user.name}</CardTitle>
                    <Badge variant="secondary">{formatCurrency(total)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    {userItems.map(item => (
                      <div key={item!.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item!.name}</span>
                        <span>{formatCurrency(item!.price)}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax & Service</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-1">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Info Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank">Bank / E-wallet Name *</Label>
              <Input
                id="bank"
                type="text"
                placeholder="e.g., BCA, Gopay, OVO"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Account Number *</Label>
              <Input
                id="account"
                type="text"
                placeholder="e.g., 1234567890"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName">Account Holder Name *</Label>
              <Input
                id="accountName"
                type="text"
                placeholder="Name on account"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="h-10"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomActionBar
        primaryLabel={isFinalizing ? 'Finalizing...' : 'Finalize & Send Payment Info'}
        onPrimaryAction={handleFinalize}
        primaryDisabled={!bank.trim() || !account.trim() || !accountName.trim() || isFinalizing}
      />
    </div>
  );
}
