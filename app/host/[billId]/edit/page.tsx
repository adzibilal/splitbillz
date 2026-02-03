'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MobileHeader } from '@/components/mobile-header';
import { BottomActionBar } from '@/components/bottom-action-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useBill } from '@/context/bill-context';
import { Item } from '@/lib/types';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

export default function EditItemsPage() {
  const router = useRouter();
  const params = useParams();
  const billId = params.billId as string;
  const { getBillWithDetails, addItem, updateItem, deleteItem, updateBill } = useBill();
  const { toast } = useToast();
  
  const [billDetails, setBillDetails] = useState(getBillWithDetails(billId));
  const [items, setItems] = useState<Item[]>(billDetails?.items || []);
  const [taxServiceRate, setTaxServiceRate] = useState(billDetails?.taxServiceRate || 10);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const details = getBillWithDetails(billId);
    if (details) {
      setBillDetails(details);
      setItems(details.items);
      setTaxServiceRate(details.taxServiceRate);
    }
  }, [billId, getBillWithDetails]);

  const handleAddItem = () => {
    const newItem: Item = {
      id: `temp-${Date.now()}`,
      billId,
      name: '',
      price: 0,
      qty: 1,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (index: number, field: keyof Item, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const handleDeleteItem = (index: number) => {
    const item = items[index];
    if (!item.id.startsWith('temp-')) {
      deleteItem(item.id);
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Validate
    const validItems = items.filter(item => item.name.trim() && item.price > 0);
    if (validItems.length === 0) {
      toast({
        title: 'No items',
        description: 'Please add at least one item',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    // Simulate save
    setTimeout(() => {
      // Save all items
      validItems.forEach(item => {
        if (item.id.startsWith('temp-')) {
          addItem(billId, { name: item.name, price: item.price, qty: item.qty });
        } else {
          updateItem(item.id, { name: item.name, price: item.price, qty: item.qty });
        }
      });

      // Update bill status and tax rate
      updateBill(billId, { status: 'OPEN', taxServiceRate });

      toast({
        title: 'Bill saved!',
        description: 'Ready to share with friends',
      });

      router.push(`/host/${billId}/manage`);
    }, 1000);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="min-h-screen bg-background pb-32">
      <MobileHeader title="Edit Items" />

      <div className="container max-w-md mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-1">Review & Edit Items</h2>
          <p className="text-sm text-muted-foreground">
            Add, edit, or remove items from your bill
          </p>
        </div>

        {/* Tax/Service Rate */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="space-y-2">
              <Label htmlFor="tax">Tax & Service (% of subtotal)</Label>
              <Input
                id="tax"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={taxServiceRate}
                onChange={(e) => setTaxServiceRate(parseFloat(e.target.value) || 0)}
                className="h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <div className="space-y-3 mb-4">
          {items.map((item, index) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteItem(index)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label className="text-xs">Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="0"
                        value={item.price || ''}
                        onChange={(e) => handleUpdateItem(index, 'price', parseFloat(e.target.value) || 0)}
                        className="h-10"
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={item.qty}
                        onChange={(e) => handleUpdateItem(index, 'qty', parseInt(e.target.value) || 1)}
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Item Button */}
        <Button
          variant="outline"
          className="w-full h-12 mb-6"
          onClick={handleAddItem}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>

        {/* Summary */}
        {items.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax & Service ({taxServiceRate}%)</span>
                  <span className="font-medium">{formatCurrency(subtotal * taxServiceRate / 100)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(subtotal * (1 + taxServiceRate / 100))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomActionBar
        primaryLabel={isSaving ? 'Saving...' : 'Save & Share'}
        onPrimaryAction={handleSave}
        primaryDisabled={items.length === 0 || isSaving}
      />
    </div>
  );
}
