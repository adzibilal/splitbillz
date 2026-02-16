'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useBill } from '@/context/bill-context';
import { Item } from '@/lib/types';
import { User } from 'lucide-react';

interface AssignmentDialogProps {
    item: Item;
    billId: string;
    trigger?: React.ReactNode;
}

export function AssignmentDialog({ item, billId, trigger }: AssignmentDialogProps) {
    const { participants, assignments, assignItem, unassignItem } = useBill();
    const [open, setOpen] = useState(false);

    const billParticipants = participants[billId] || [];
    const itemAssignments = assignments.filter(a => a.itemId === item.id);

    const handleToggle = async (userId: string, userName: string, isAssigned: boolean) => {
        if (isAssigned) {
            await unassignItem(item.id, userId);
        } else {
            await assignItem(item.id, userId, userName);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        Assign
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Item</DialogTitle>
                    <DialogDescription>
                        Who is splitting "{item.name}"?
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {billParticipants.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No participants found</p>
                    ) : (
                        billParticipants.map((participant) => {
                            const isAssigned = itemAssignments.some(a => a.userId === participant.id);
                            return (
                                <div
                                    key={participant.id}
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                                    onClick={() => handleToggle(participant.id, participant.name, isAssigned)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-medium">{participant.name}</span>
                                    </div>
                                    <Checkbox
                                        checked={isAssigned}
                                        onCheckedChange={() => handleToggle(participant.id, participant.name, isAssigned)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="pt-4 flex justify-end">
                    <Button onClick={() => setOpen(false)}>Done</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
