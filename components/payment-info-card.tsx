'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentInfo } from '@/lib/types';
import { copyToClipboard } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PaymentInfoCardProps {
  paymentInfo: PaymentInfo;
  amount?: number;
}

export function PaymentInfoCard({ paymentInfo, amount }: PaymentInfoCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async (text: string, label: string) => {
    try {
      await copyToClipboard(text);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy manually',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Payment Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Bank/E-wallet</p>
            <p className="font-medium">{paymentInfo.bank}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Account Number</p>
            <div className="flex items-center gap-2">
              <p className="font-medium font-mono">{paymentInfo.account}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleCopy(paymentInfo.account, 'Account number')}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Account Holder</p>
            <p className="font-medium">{paymentInfo.name}</p>
          </div>

          {amount && (
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground mb-1">Amount to Transfer</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(amount)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
