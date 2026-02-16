'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MobileHeader } from '@/components/mobile-header';
import { BottomActionBar } from '@/components/bottom-action-bar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useBill } from '@/context/bill-context';
import { Receipt, Users, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function JoinBillPage() {
  const router = useRouter();
  const params = useParams();
  const billId = params.billId as string;
  const { getBillWithDetails, currentUserName, fetchBill, isLoading, joinBill } = useBill();

  const [name, setName] = useState('');
  // Initialize from currentUserName if available, but after mount/fetch

  useEffect(() => {
    fetchBill(billId);
  }, [billId, fetchBill]);

  const billDetails = getBillWithDetails(billId);

  useEffect(() => {
    if (currentUserName) setName(currentUserName);

    if (billDetails && currentUserName) {
      // Check if this user is actually IN this bill's participants?
      // For now, if currentUserName is set, we assume they joined or defined it.
      // Redirect logic can be simpler:
      if (billDetails.status === 'OPEN') {
        // Don't auto-redirect if we just arrived, let user confirm name? 
        // But existing logic did redirect. I'll keep it but wait for explicit 'Join' if name matches?
        // Actually, if I just joined via Link and I have a name from previous session, I might want to use it.
      }
    }
  }, [billDetails, currentUserName]);

  if (isLoading && !billDetails) {
    return (
      <div className="min-h-screen bg-background p-4">
        <MobileHeader title="Join Bill" showBack={false} />
        <div className="container max-w-md mx-auto py-6 space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!billDetails) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="Join Bill" />
        <div className="container max-w-md mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Bill not found</p>
        </div>
      </div>
    );
  }

  const { items, users } = billDetails;
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const total = subtotal * (1 + billDetails.taxServiceRate / 100);

  const handleJoin = async () => {
    if (!name.trim()) return;

    await joinBill(billId, name.trim());

    // Navigate based on bill status
    if (billDetails.status === 'OPEN') {
      router.push(`/join/${billId}/select`);
    } else if (billDetails.status === 'REVIEW') {
      router.push(`/join/${billId}/summary`);
    } else if (billDetails.status === 'FINALIZED') {
      router.push(`/join/${billId}/payment`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <MobileHeader title="Join Bill" showBack={false} />

      <div className="container max-w-md mx-auto px-4 py-6">
        {/* Bill Preview */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Receipt className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">
              {billDetails.restaurantName || 'Split Bill'}
            </h2>
            <p className="text-center text-muted-foreground mb-4">
              Hosted by <span className="font-medium">{billDetails.hostName}</span>
            </p>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{items.length}</p>
                <p className="text-xs text-muted-foreground">Items</p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground">People</p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-lg font-bold">{formatCurrency(total)}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>

            {billDetails.status !== 'OPEN' && (
              <div className="mt-4 flex justify-center">
                <Badge variant="outline">
                  {billDetails.status === 'REVIEW' && 'In Review'}
                  {billDetails.status === 'FINALIZED' && 'Finalized'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Name Input */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Enter Your Name</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {billDetails.status === 'OPEN'
                    ? 'This will be shown to others when you select items'
                    : 'This will be used to identify your payment'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && name.trim()) {
                      handleJoin();
                    }
                  }}
                  autoFocus
                  className="h-12"
                />
              </div>

              {users.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Already joined:</p>
                  <div className="flex flex-wrap gap-2">
                    {users.slice(0, 5).map(user => (
                      <Badge key={user.id} variant="secondary">
                        {user.name}
                      </Badge>
                    ))}
                    {users.length > 5 && (
                      <Badge variant="secondary">+{users.length - 5} more</Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomActionBar
        primaryLabel="Join Bill"
        onPrimaryAction={handleJoin}
        primaryDisabled={!name.trim()}
      />
    </div>
  );
}
