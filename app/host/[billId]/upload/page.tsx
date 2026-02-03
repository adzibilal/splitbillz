'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MobileHeader } from '@/components/mobile-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
          <h2 className="text-2xl font-bold mb-2">Upload Your Receipt</h2>
          <p className="text-muted-foreground">
            Take a photo or upload an image of your receipt. We&apos;ll extract the items automatically.
          </p>
        </div>

        <Card className="border-2 border-dashed mb-4">
          <CardContent className="p-8">
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">
                  {isUploading ? 'Processing...' : 'Tap to upload'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  PNG, JPG up to 10MB
                </p>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Camera className="h-4 w-4" />
                    <span>Camera</span>
                  </div>
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Gallery</span>
                  </div>
                </div>
              </div>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </label>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            size="lg"
            variant="outline"
            className="w-full h-12"
            onClick={handleSkip}
            disabled={isUploading}
          >
            Skip & Enter Manually
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            For demo purposes, OCR is simulated
          </p>
        </div>
      </div>
    </div>
  );
}
