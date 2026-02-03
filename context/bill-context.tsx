'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Bill,
  Item,
  Assignment,
  User,
  BillWithDetails,
  PaymentInfo,
} from '@/lib/types';
import {
  mockBills,
  allMockItems,
  allMockAssignments,
  mockUsers,
  getBillWithDetails as getMockBillWithDetails,
} from '@/lib/dummy-data';
import { generateId } from '@/lib/utils';

interface BillContextType {
  // State
  bills: Bill[];
  items: Item[];
  assignments: Assignment[];
  users: User[];
  currentUserId: string | null;
  currentUserName: string | null;

  // Actions
  createBill: (hostName: string, restaurantName?: string) => string;
  updateBill: (billId: string, updates: Partial<Bill>) => void;
  getBill: (billId: string) => Bill | null;
  getBillWithDetails: (billId: string) => BillWithDetails | null;
  
  addItem: (billId: string, item: Omit<Item, 'id' | 'billId'>) => void;
  updateItem: (itemId: string, updates: Partial<Item>) => void;
  deleteItem: (itemId: string) => void;
  
  assignItem: (itemId: string, userId: string, userName: string) => void;
  unassignItem: (itemId: string, userId: string) => void;
  
  setCurrentUser: (userId: string, userName: string) => void;
  updatePaymentStatus: (userId: string, hasPaid: boolean) => void;
}

const BillContext = createContext<BillContextType | undefined>(undefined);

export function BillProvider({ children }: { children: React.ReactNode }) {
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [items, setItems] = useState<Item[]>(allMockItems);
  const [assignments, setAssignments] = useState<Assignment[]>(allMockAssignments);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  const createBill = useCallback((hostName: string, restaurantName?: string): string => {
    const newBill: Bill = {
      id: generateId(),
      hostId: generateId(),
      hostName,
      restaurantName,
      status: 'PENDING_OCR',
      taxServiceRate: 10,
      createdAt: new Date(),
    };
    setBills(prev => [...prev, newBill]);
    return newBill.id;
  }, []);

  const updateBill = useCallback((billId: string, updates: Partial<Bill>) => {
    setBills(prev =>
      prev.map(bill => (bill.id === billId ? { ...bill, ...updates } : bill))
    );
  }, []);

  const getBill = useCallback(
    (billId: string): Bill | null => {
      return bills.find(b => b.id === billId) || null;
    },
    [bills]
  );

  const getBillWithDetails = useCallback(
    (billId: string): BillWithDetails | null => {
      const bill = getBill(billId);
      if (!bill) return null;

      const billItems = items.filter(i => i.billId === billId);
      const billAssignments = assignments.filter(a =>
        billItems.some(item => item.id === a.itemId)
      );

      const userIds = new Set(billAssignments.map(a => a.userId));
      const billUsers = users.filter(u => userIds.has(u.id));

      return {
        ...bill,
        items: billItems,
        assignments: billAssignments,
        users: billUsers,
      };
    },
    [bills, items, assignments, users, getBill]
  );

  const addItem = useCallback((billId: string, item: Omit<Item, 'id' | 'billId'>) => {
    const newItem: Item = {
      ...item,
      id: generateId(),
      billId,
    };
    setItems(prev => [...prev, newItem]);
  }, []);

  const updateItem = useCallback((itemId: string, updates: Partial<Item>) => {
    setItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, ...updates } : item))
    );
  }, []);

  const deleteItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
    // Also remove assignments for this item
    setAssignments(prev => prev.filter(a => a.itemId !== itemId));
  }, []);

  const assignItem = useCallback((itemId: string, userId: string, userName: string) => {
    // Check if already assigned
    const existingAssignment = assignments.find(
      a => a.itemId === itemId && a.userId === userId
    );
    if (existingAssignment) return;

    const newAssignment: Assignment = {
      id: generateId(),
      itemId,
      userId,
      userName,
    };
    setAssignments(prev => [...prev, newAssignment]);

    // Add user to users list if not exists
    if (!users.find(u => u.id === userId)) {
      setUsers(prev => [...prev, { id: userId, name: userName }]);
    }
  }, [assignments, users]);

  const unassignItem = useCallback((itemId: string, userId: string) => {
    setAssignments(prev =>
      prev.filter(a => !(a.itemId === itemId && a.userId === userId))
    );
  }, []);

  const setCurrentUser = useCallback((userId: string, userName: string) => {
    setCurrentUserId(userId);
    setCurrentUserName(userName);
    // Add to users if doesn't exist
    if (!users.find(u => u.id === userId)) {
      setUsers(prev => [...prev, { id: userId, name: userName }]);
    }
  }, [users]);

  const updatePaymentStatus = useCallback((userId: string, hasPaid: boolean) => {
    setUsers(prev =>
      prev.map(user => (user.id === userId ? { ...user, hasPaid } : user))
    );
  }, []);

  const value: BillContextType = {
    bills,
    items,
    assignments,
    users,
    currentUserId,
    currentUserName,
    createBill,
    updateBill,
    getBill,
    getBillWithDetails,
    addItem,
    updateItem,
    deleteItem,
    assignItem,
    unassignItem,
    setCurrentUser,
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
