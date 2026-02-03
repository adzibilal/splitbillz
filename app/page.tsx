import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Receipt, Users, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4">
            <Receipt className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Splitbillz</h1>
          <p className="text-muted-foreground text-lg">
            Split bills easily with friends
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">No Registration</h3>
                <p className="text-sm text-muted-foreground">
                  Start splitting bills instantly without sign-up
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Easy Splitting</h3>
                <p className="text-sm text-muted-foreground">
                  Upload receipt, share link, and let everyone pick their items
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Fair & Transparent</h3>
                <p className="text-sm text-muted-foreground">
                  Everyone sees what they ordered and pays their fair share
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link href="/host/create" className="block">
            <Button size="lg" className="w-full h-14 text-lg">
              Create New Bill
            </Button>
          </Link>

          <Link href="/join/bill-open-123" className="block">
            <Button size="lg" variant="outline" className="w-full h-14 text-lg">
              Join Existing Bill
            </Button>
          </Link>
        </div>

        {/* Demo Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Demo mode - all data is simulated
          </p>
        </div>
      </div>
    </div>
  );
}
