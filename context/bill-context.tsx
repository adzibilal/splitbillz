'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Bill,
  Item,
  Assignment,
  User,
  BillWithDetails,
  BillStatus,
  DbBill,
  DbItem,
  DbAssignment,
  DbParticipant,
} from '@/lib/types';
import { generateId } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface BillContextType {
  // State
  bills: Bill[];
  items: Item[];
  assignments: Assignment[];
  participants: Record<string, User[]>; // billId -> User[]
  currentUserId: string | null;
  currentUserName: string | null;
  isLoading: boolean;

  // Actions
  fetchBill: (billId: string) => Promise<void>;
  createBill: (hostName: string, restaurantName?: string) => Promise<string | null>;
  updateBill: (billId: string, updates: Partial<Bill>) => Promise<void>;
  getBill: (billId: string) => Bill | null;
  getBillWithDetails: (billId: string) => BillWithDetails | null;

  addItem: (billId: string, item: Omit<Item, 'id' | 'billId'>) => Promise<void>;
  updateItem: (itemId: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;

  assignItem: (itemId: string, userId: string, userName: string) => Promise<void>;
  unassignItem: (itemId: string, userId: string) => Promise<void>;

  joinBill: (billId: string, userName: string) => Promise<void>;
  setCurrentUser: (userId: string, userName: string) => void;
  updatePaymentStatus: (billId: string, userId: string, hasPaid: boolean) => Promise<void>;
}

const BillContext = createContext<BillContextType | undefined>(undefined);

// Mappers
const mapBill = (db: DbBill): Bill => ({
  id: db.id,
  hostId: db.host_id,
  hostName: db.host_name,
  restaurantName: db.restaurant_name || undefined,
  status: db.status as BillStatus,
  taxServiceRate: Number(db.tax_service_rate),
  paymentInfo: db.payment_info,
  createdAt: new Date(db.created_at),
});

const mapItem = (db: DbItem): Item => ({
  id: db.id,
  billId: db.bill_id,
  name: db.name,
  price: Number(db.price),
  qty: db.qty,
});

const mapParticipant = (db: DbParticipant): User => ({
  id: db.user_id, // Mapping participant user_id to User.id
  name: db.name,
  hasPaid: db.has_paid,
});

const mapAssignment = (db: DbAssignment, userName: string): Assignment => ({
  id: db.id,
  itemId: db.item_id,
  userId: db.user_id,
  userName: userName, // Need to join/lookup name
});

export function BillProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [bills, setBills] = useState<Bill[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [participants, setParticipants] = useState<Record<string, User[]>>({});

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeBillId, setActiveBillId] = useState<string | null>(null);

  // Initialize Auth
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        try {
          const { data: { user }, error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
          if (user) setCurrentUserId(user.id);
        } catch (error: any) {
          console.error('Anonymous sign-in failed:', error);
          toast({
            title: 'Authentication Error',
            description: 'Failed to sign in anonymously. Please ensure Anonymous Sign-ins are enabled in your Supabase Dashboard.',
            variant: 'destructive',
          });
        }
      } else {
        setCurrentUserId(session.user.id);
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setCurrentUserId(session.user.id);
        }
      });
    };
    initAuth();
  }, []);

  // Realtime Subscriptions
  useEffect(() => {
    if (!activeBillId) return;

    const channel = supabase
      .channel(`bill-${activeBillId}`)
      // Bills changes
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bills',
        filter: `id=eq.${activeBillId}`
      }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setBills(prev => prev.map(b => b.id === activeBillId ? mapBill(payload.new as DbBill) : b));
        }
      })
      // Items changes
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'items',
        filter: `bill_id=eq.${activeBillId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setItems(prev => [...prev.filter(i => i.id !== payload.new.id), mapItem(payload.new as DbItem)]);
        } else if (payload.eventType === 'UPDATE') {
          setItems(prev => prev.map(i => i.id === payload.new.id ? mapItem(payload.new as DbItem) : i));
        } else if (payload.eventType === 'DELETE') {
          setItems(prev => prev.filter(i => i.id !== payload.old.id));
        }
      })
      // Participants changes
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'participants',
        filter: `bill_id=eq.${activeBillId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const user = mapParticipant(payload.new as DbParticipant);
          setParticipants(prev => {
            const billParts = prev[activeBillId] || [];
            const filtered = billParts.filter(u => u.id !== user.id);
            return {
              ...prev,
              [activeBillId]: [...filtered, user]
            };
          });
        }
      })
      // Assignments changes
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'assignments',
      }, async (payload) => {
        // Assignments don't have bill_id, so we need to be careful or join?
        // For simplicity, we can refetch assignments for the bill's items if ANY assignment changes
        // OR if we know the item_id belongs to the active bill.
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const assignment = payload.new as DbAssignment;
          // Check if item belongs to active bill (from our state)
          const item = items.find(i => i.id === assignment.item_id && i.billId === activeBillId);
          if (item) {
            // We need the userName. We can look it up in participants.
            const billParts = participants[activeBillId] || [];
            const user = billParts.find(u => u.id === assignment.user_id);
            const mapped = mapAssignment(assignment, user?.name || 'Unknown');
            setAssignments(prev => [...prev.filter(a => a.id !== mapped.id), mapped]);
          }
        } else if (payload.eventType === 'DELETE') {
          setAssignments(prev => prev.filter(a => a.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeBillId, items, participants]);

  const fetchBill = useCallback(async (billId: string) => {
    setActiveBillId(billId);
    setIsLoading(true);
    try {
      // 1. Fetch Bill
      const { data: billData, error: billError } = await supabase
        .from('bills')
        .select('*')
        .eq('id', billId)
        .single();

      if (billError) throw billError;
      if (!billData) return;

      // 2. Fetch Items
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('bill_id', billId);

      if (itemsError) throw itemsError;

      // 3. Fetch Participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .eq('bill_id', billId);

      if (participantsError) throw participantsError;

      // 4. Fetch Assignments (for these items)
      const itemIds = itemsData ? itemsData.map(i => i.id) : [];
      let assignmentsData: any[] = [];
      if (itemIds.length > 0) {
        const { data, error } = await supabase
          .from('assignments')
          .select('*')
          .in('item_id', itemIds);
        if (error) throw error;
        assignmentsData = data || [];
      }

      // Update State
      const bill = mapBill(billData);
      setBills(prev => [...prev.filter(b => b.id !== billId), bill]);

      if (itemsData) {
        const newItems = itemsData.map(mapItem);
        setItems(prev => [...prev.filter(i => i.billId !== billId), ...newItems]);
      }

      const billUsers: User[] = [];
      const userIdToNameMap = new Map<string, string>();

      if (participantsData) {
        participantsData.forEach(p => {
          const user = mapParticipant(p);
          billUsers.push(user);
          userIdToNameMap.set(user.id, user.name);

          if (user.id === currentUserId) {
            setCurrentUserName(user.name);
          }
        });
        setParticipants(prev => ({ ...prev, [billId]: billUsers }));
      }

      if (assignmentsData) {
        const newAssignments = assignmentsData.map((a: DbAssignment) =>
          mapAssignment(a, userIdToNameMap.get(a.user_id) || 'Unknown')
        );
        setAssignments(prev => [...prev.filter(a => !itemIds.includes(a.itemId)), ...newAssignments]);
      }

    } catch (error) {
      console.error('Error fetching bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bill data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, toast]);

  const createBill = useCallback(async (hostName: string, restaurantName?: string): Promise<string | null> => {
    if (!currentUserId) {
      await supabase.auth.signInAnonymously();
    }

    try {
      // 1. Insert Bill
      const { data: billData, error: billError } = await supabase
        .from('bills')
        .insert({
          host_name: hostName,
          restaurant_name: restaurantName,
          status: 'PENDING_OCR',
          host_id: currentUserId // Should be auto-set by default but good to be explicit/match RLS? default is auth.uid()
        })
        .select()
        .single();

      if (billError) throw billError;

      // 2. Insert Host as Participant
      const { error: partError } = await supabase.from('participants').insert({
        bill_id: billData.id,
        user_id: currentUserId,
        name: hostName
      });

      if (partError) throw partError;

      const newBill = mapBill(billData);
      setBills(prev => [...prev, newBill]);
      setCurrentUserName(hostName);

      return newBill.id;
    } catch (error) {
      console.error('Error creating bill:', error);
      toast({ title: 'Error', description: 'Failed to create bill', variant: 'destructive' });
      return null;
    }
  }, [currentUserId, toast]);

  const updateBill = useCallback(async (billId: string, updates: Partial<Bill>) => {
    try {
      // Map updates to DB columns
      const dbUpdates: any = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.taxServiceRate !== undefined) dbUpdates.tax_service_rate = updates.taxServiceRate;
      if (updates.paymentInfo) dbUpdates.payment_info = updates.paymentInfo;
      // ... others

      const { error } = await supabase.from('bills').update(dbUpdates).eq('id', billId);
      if (error) throw error;

      setBills(prev => prev.map(b => b.id === billId ? { ...b, ...updates } : b));
    } catch (error) {
      console.error('Error updating bill:', error);
      toast({ title: 'Error', description: 'Failed to update bill', variant: 'destructive' });
    }
  }, [toast]);

  const getBill = useCallback((billId: string): Bill | null => {
    return bills.find(b => b.id === billId) || null;
  }, [bills]);

  const getBillWithDetails = useCallback((billId: string): BillWithDetails | null => {
    const bill = getBill(billId);
    if (!bill) return null;

    const billItems = items.filter(i => i.billId === billId);
    const itemIds = new Set(billItems.map(i => i.id));
    const billAssignments = assignments.filter(a => itemIds.has(a.itemId));
    const billParticipants = participants[billId] || [];

    return {
      ...bill,
      items: billItems,
      assignments: billAssignments,
      users: billParticipants,
    };
  }, [bills, items, assignments, participants, getBill]);

  const addItem = useCallback(async (billId: string, item: Omit<Item, 'id' | 'billId'>) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert({
          bill_id: billId,
          name: item.name,
          price: item.price,
          qty: item.qty
        })
        .select()
        .single();

      if (error) throw error;

      const newItem = mapItem(data);
      setItems(prev => [...prev, newItem]);
    } catch (error) {
      console.error('Error adding item:', error);
      toast({ title: 'Error', description: 'Failed to add item', variant: 'destructive' });
    }
  }, [toast]);

  const updateItem = useCallback(async (itemId: string, updates: Partial<Item>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.qty !== undefined) dbUpdates.qty = updates.qty;

      const { error } = await supabase.from('items').update(dbUpdates).eq('id', itemId);
      if (error) throw error;

      setItems(prev => prev.map(i => i.id === itemId ? { ...i, ...updates } : i));
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', variant: 'destructive', description: 'Failed to update item' });
    }
  }, [toast]);

  const deleteItem = useCallback(async (itemId: string) => {
    try {
      const { error } = await supabase.from('items').delete().eq('id', itemId);
      if (error) throw error;
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', variant: 'destructive', description: 'Failed to delete item' });
    }
  }, [toast]);

  const assignItem = useCallback(async (itemId: string, userId: string, userName: string) => {
    // Check existing
    if (assignments.find(a => a.itemId === itemId && a.userId === userId)) return;

    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          item_id: itemId,
          user_id: userId,
          quantity: 1
        })
        .select()
        .single();

      if (error) throw error;

      const newAssignment = mapAssignment(data, userName);
      setAssignments(prev => [...prev, newAssignment]);

      // Also ensure user is in users list?
      // They should be if they are participant.
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', variant: 'destructive', description: 'Failed to assign item' });
    }
  }, [assignments, toast]);

  const unassignItem = useCallback(async (itemId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .match({ item_id: itemId, user_id: userId });

      if (error) throw error;
      setAssignments(prev => prev.filter(a => !(a.itemId === itemId && a.userId === userId)));
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', variant: 'destructive', description: 'Failed to unassign item' });
    }
  }, [toast]);

  const joinBill = useCallback(async (billId: string, userName: string) => {
    if (!currentUserId) {
      // Should be signed in by init
      return;
    }
    try {
      // Check if already participant
      const { data: existing } = await supabase
        .from('participants')
        .select('*')
        .eq('bill_id', billId)
        .eq('user_id', currentUserId)
        .single();

      if (existing) {
        // Update name if changed?
        if (existing.name !== userName) {
          await supabase.from('participants').update({ name: userName }).eq('id', existing.id);
        }
      } else {
        // Insert
        await supabase.from('participants').insert({
          bill_id: billId,
          user_id: currentUserId,
          name: userName
        });
      }
      setCurrentUserName(userName);
      // Refresh
      await fetchBill(billId);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to join bill', variant: 'destructive' });
    }
  }, [currentUserId, fetchBill, toast]);

  // Compatibility wrapper
  const setCurrentUser = useCallback((userId: string, userName: string) => {
    setCurrentUserId(userId);
    setCurrentUserName(userName);
  }, []);

  const updatePaymentStatus = useCallback(async (billId: string, userId: string, hasPaid: boolean) => {
    try {
      const { error } = await supabase
        .from('participants')
        .update({ has_paid: hasPaid })
        .match({ bill_id: billId, user_id: userId });

      if (error) throw error;

      setParticipants(prev => {
        const billParts = prev[billId] || [];
        return {
          ...prev,
          [billId]: billParts.map(u => u.id === userId ? { ...u, hasPaid } : u)
        };
      });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to update payment status', variant: 'destructive' });
    }
  }, [toast]);

  const value: BillContextType = {
    bills,
    items,
    assignments,
    participants,
    currentUserId,
    currentUserName,
    isLoading,
    createBill,
    updateBill,
    getBill,
    getBillWithDetails,
    fetchBill,
    addItem,
    updateItem,
    deleteItem,
    assignItem,
    unassignItem,
    setCurrentUser,
    joinBill,
    updatePaymentStatus,
  };

  return <BillContext.Provider value={value}>{children}</BillContext.Provider>;
}

export function useBill() {
  const context = useContext(BillContext);
  if (context === undefined) {
    throw new Error('useBill must be used within a BillProvider');
  }
  return context;
}
