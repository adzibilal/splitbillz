'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MobileHeader } from '@/components/mobile-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useBill } from '@/context/bill-context';
import { Receipt } from 'lucide-react';

export default function CreateBillPage() {
  const router = useRouter();
  const { createBill } = useBill();
  const [hostName, setHostName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!hostName.trim()) return;

    setIsCreating(true);
    try {
      const billId = await createBill(hostName.trim(), restaurantName.trim() || undefined);
      if (billId) {
        router.push(`/host/${billId}/edit`);
      }
    } catch (error) {
      // Error handled in context toast
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="Create New Bill" />

      <div className="container max-w-md mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Receipt className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-center mb-2">
              Start a New Bill
            </h2>
            <p className="text-center text-muted-foreground text-sm">
              Enter your details to create a shareable bill
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hostName">Your Name *</Label>
            <Input
              id="hostName"
              type="text"
              placeholder="e.g., Adzi"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              autoFocus
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">
              This will be shown to others as the bill organizer
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="restaurantName">Restaurant Name (Optional)</Label>
            <Input
              id="restaurantName"
              type="text"
              placeholder="e.g., Warung Makan Sederhana"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="h-12"
            />
          </div>

          <Button
            size="lg"
            className="w-full h-12 mt-6"
            onClick={handleCreate}
            disabled={!hostName.trim() || isCreating}
          >
            {isCreating ? 'Creating...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
