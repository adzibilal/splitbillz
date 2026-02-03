'use client';

import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { copyToClipboard } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';

interface ShareLinkDialogProps {
  billId: string;
  trigger?: React.ReactNode;
}

export function ShareLinkDialog({ billId, trigger }: ShareLinkDialogProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${billId}`;

  const handleCopy = async () => {
    try {
      await copyToClipboard(shareUrl);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Share this link with your friends',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the link manually',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my bill on Splitbillz',
          text: 'Split the bill with me!',
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Share2 className="mr-2 h-4 w-4" />
            Share Link
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this bill</DialogTitle>
          <DialogDescription>
            Anyone with this link can join and select their items
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="flex-1"
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex justify-center p-4 bg-white rounded-lg">
            <QRCodeSVG value={shareUrl} size={200} />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleCopy}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <Button
                type="button"
                className="flex-1"
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
