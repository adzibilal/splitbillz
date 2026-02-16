'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MobileHeader } from '@/components/mobile-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Camera, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UploadReceiptPage() {
  const router = useRouter();
  const params = useParams();
  const billId = params.billId as string;
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate upload and OCR processing
    setIsUploading(true);
    toast({
      title: 'Processing receipt...',
      description: 'This may take a few seconds',
    });

    setTimeout(() => {
      setIsUploading(false);
      router.push(`/host/${billId}/edit`);
    }, 2000);
  };

  const handleSkip = () => {
    router.push(`/host/${billId}/edit`);
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="Upload Receipt" />

      <div className="container max-w-md mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold">Upload Your Receipt</h2>
            <Badge className="bg-amber-500">Coming Soon</Badge>
          </div>
          <p className="text-muted-foreground">
            Take a photo or upload an image of your receipt. Automatic OCR extraction is currently in development.
          </p>
        </div>

        <Card className="border-2 border-dashed mb-4 opacity-60 grayscale pointer-events-none relative overflow-hidden">
          <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Badge variant="outline" className="bg-background text-lg py-1 px-4 border-2">Coming Soon</Badge>
          </div>
          <CardContent className="p-8">
            <label htmlFor="file-upload" className="cursor-not-allowed">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">
                  Upload Feature Coming Soon
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  PNG, JPG up to 10MB
                </p>
              </div>
            </label>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full h-12"
            onClick={handleSkip}
          >
            Enter Items Manually
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Please enter your bill items manually while OCR is being improved
          </p>
        </div>
      </div>
    </div>
  );
}
