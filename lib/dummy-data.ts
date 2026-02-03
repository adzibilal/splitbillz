import { Bill, Item, Assignment, User, BillWithDetails } from './types';

// Mock Bills
export const mockBills: Bill[] = [
  {
    id: 'bill-open-123',
    hostId: 'user-host-1',
    hostName: 'Adzi Bilal',
    restaurantName: 'Warung Makan Sederhana',
    status: 'OPEN',
    taxServiceRate: 10,
    createdAt: new Date('2026-02-03T12:00:00'),
  },
  {
    id: 'bill-review-456',
    hostId: 'user-host-2',
    hostName: 'Budi Santoso',
    restaurantName: 'Restoran Padang Raya',
    status: 'REVIEW',
    taxServiceRate: 15,
    createdAt: new Date('2026-02-03T13:30:00'),
  },
  {
    id: 'bill-finalized-789',
    hostId: 'user-host-3',
    hostName: 'Citra Dewi',
    restaurantName: 'Cafe Kopi Kenangan',
    status: 'FINALIZED',
    taxServiceRate: 10,
    paymentInfo: {
      bank: 'BCA',
      account: '1234567890',
      name: 'Citra Dewi',
    },
    createdAt: new Date('2026-02-02T18:00:00'),
  },
];

// Mock Items for bill-open-123
export const mockItemsOpen: Item[] = [
  { id: 'item-1', billId: 'bill-open-123', name: 'Nasi Goreng Spesial', price: 25000, qty: 1 },
  { id: 'item-2', billId: 'bill-open-123', name: 'Ayam Bakar', price: 30000, qty: 1 },
  { id: 'item-3', billId: 'bill-open-123', name: 'Es Teh Manis', price: 5000, qty: 3 },
  { id: 'item-4', billId: 'bill-open-123', name: 'Soto Ayam', price: 20000, qty: 1 },
  { id: 'item-5', billId: 'bill-open-123', name: 'Tempe Goreng', price: 8000, qty: 2 },
];

// Mock Items for bill-review-456
export const mockItemsReview: Item[] = [
  { id: 'item-6', billId: 'bill-review-456', name: 'Rendang', price: 45000, qty: 2 },
  { id: 'item-7', billId: 'bill-review-456', name: 'Gulai Ikan', price: 40000, qty: 1 },
  { id: 'item-8', billId: 'bill-review-456', name: 'Sayur Nangka', price: 15000, qty: 1 },
  { id: 'item-9', billId: 'bill-review-456', name: 'Nasi Putih', price: 5000, qty: 4 },
  { id: 'item-10', billId: 'bill-review-456', name: 'Teh Botol', price: 6000, qty: 4 },
  { id: 'item-11', billId: 'bill-review-456', name: 'Kerupuk', price: 3000, qty: 2 },
  { id: 'item-12', billId: 'bill-review-456', name: 'Sambal Ijo', price: 5000, qty: 1 },
  { id: 'item-13', billId: 'bill-review-456', name: 'Perkedel', price: 8000, qty: 3 },
];

// Mock Items for bill-finalized-789
export const mockItemsFinalized: Item[] = [
  { id: 'item-14', billId: 'bill-finalized-789', name: 'Americano', price: 28000, qty: 2 },
  { id: 'item-15', billId: 'bill-finalized-789', name: 'Cappuccino', price: 32000, qty: 1 },
  { id: 'item-16', billId: 'bill-finalized-789', name: 'Croissant', price: 25000, qty: 2 },
  { id: 'item-17', billId: 'bill-finalized-789', name: 'Sandwich', price: 35000, qty: 1 },
  { id: 'item-18', billId: 'bill-finalized-789', name: 'Chocolate Cake', price: 30000, qty: 1 },
  { id: 'item-19', billId: 'bill-finalized-789', name: 'Orange Juice', price: 20000, qty: 1 },
];

export const allMockItems = [...mockItemsOpen, ...mockItemsReview, ...mockItemsFinalized];

// Mock Assignments for bill-open-123
export const mockAssignmentsOpen: Assignment[] = [
  { id: 'assign-1', itemId: 'item-1', userId: 'user-host-1', userName: 'Adzi Bilal' },
  { id: 'assign-2', itemId: 'item-2', userId: 'user-1', userName: 'Rina' },
  { id: 'assign-3', itemId: 'item-3', userId: 'user-host-1', userName: 'Adzi Bilal' },
  { id: 'assign-4', itemId: 'item-3', userId: 'user-1', userName: 'Rina' },
  { id: 'assign-5', itemId: 'item-5', userId: 'user-host-1', userName: 'Adzi Bilal' },
  { id: 'assign-6', itemId: 'item-5', userId: 'user-1', userName: 'Rina' },
];

// Mock Assignments for bill-review-456
export const mockAssignmentsReview: Assignment[] = [
  { id: 'assign-7', itemId: 'item-6', userId: 'user-host-2', userName: 'Budi Santoso' },
  { id: 'assign-8', itemId: 'item-6', userId: 'user-2', userName: 'Ahmad' },
  { id: 'assign-9', itemId: 'item-7', userId: 'user-3', userName: 'Siti' },
  { id: 'assign-10', itemId: 'item-8', userId: 'user-4', userName: 'Deni' },
  { id: 'assign-11', itemId: 'item-9', userId: 'user-host-2', userName: 'Budi Santoso' },
  { id: 'assign-12', itemId: 'item-9', userId: 'user-2', userName: 'Ahmad' },
  { id: 'assign-13', itemId: 'item-9', userId: 'user-3', userName: 'Siti' },
  { id: 'assign-14', itemId: 'item-9', userId: 'user-4', userName: 'Deni' },
  { id: 'assign-15', itemId: 'item-10', userId: 'user-host-2', userName: 'Budi Santoso' },
  { id: 'assign-16', itemId: 'item-10', userId: 'user-2', userName: 'Ahmad' },
  { id: 'assign-17', itemId: 'item-10', userId: 'user-3', userName: 'Siti' },
  { id: 'assign-18', itemId: 'item-10', userId: 'user-4', userName: 'Deni' },
  { id: 'assign-19', itemId: 'item-11', userId: 'user-host-2', userName: 'Budi Santoso' },
  { id: 'assign-20', itemId: 'item-11', userId: 'user-2', userName: 'Ahmad' },
  { id: 'assign-21', itemId: 'item-12', userId: 'user-3', userName: 'Siti' },
  { id: 'assign-22', itemId: 'item-13', userId: 'user-4', userName: 'Deni' },
  { id: 'assign-23', itemId: 'item-13', userId: 'user-2', userName: 'Ahmad' },
  { id: 'assign-24', itemId: 'item-13', userId: 'user-host-2', userName: 'Budi Santoso' },
];

// Mock Assignments for bill-finalized-789
export const mockAssignmentsFinalized: Assignment[] = [
  { id: 'assign-25', itemId: 'item-14', userId: 'user-host-3', userName: 'Citra Dewi' },
  { id: 'assign-26', itemId: 'item-14', userId: 'user-5', userName: 'Farah' },
  { id: 'assign-27', itemId: 'item-15', userId: 'user-6', userName: 'Gita' },
  { id: 'assign-28', itemId: 'item-16', userId: 'user-host-3', userName: 'Citra Dewi' },
  { id: 'assign-29', itemId: 'item-16', userId: 'user-5', userName: 'Farah' },
  { id: 'assign-30', itemId: 'item-17', userId: 'user-6', userName: 'Gita' },
  { id: 'assign-31', itemId: 'item-18', userId: 'user-5', userName: 'Farah' },
  { id: 'assign-32', itemId: 'item-19', userId: 'user-6', userName: 'Gita' },
];

export const allMockAssignments = [...mockAssignmentsOpen, ...mockAssignmentsReview, ...mockAssignmentsFinalized];

// Mock Users
export const mockUsers: User[] = [
  { id: 'user-host-1', name: 'Adzi Bilal' },
  { id: 'user-host-2', name: 'Budi Santoso' },
  { id: 'user-host-3', name: 'Citra Dewi' },
  { id: 'user-1', name: 'Rina' },
  { id: 'user-2', name: 'Ahmad' },
  { id: 'user-3', name: 'Siti' },
  { id: 'user-4', name: 'Deni' },
  { id: 'user-5', name: 'Farah', hasPaid: true },
  { id: 'user-6', name: 'Gita', hasPaid: false },
];

// Helper function to get bill with all details
export function getBillWithDetails(billId: string): BillWithDetails | null {
  const bill = mockBills.find(b => b.id === billId);
  if (!bill) return null;

  const items = allMockItems.filter(i => i.billId === billId);
  const assignments = allMockAssignments.filter(a => 
    items.some(item => item.id === a.itemId)
  );
  
  const userIds = new Set(assignments.map(a => a.userId));
  const users = mockUsers.filter(u => userIds.has(u.id));

  return {
    ...bill,
    items,
    assignments,
    users,
  };
}

// Helper function to calculate item cost per person
export function calculateItemCostPerPerson(item: Item, assignments: Assignment[]): number {
  const itemAssignments = assignments.filter(a => a.itemId === item.id);
  const splitCount = itemAssignments.length || 1;
  return (item.price * item.qty) / splitCount;
}

// Helper function to calculate user total
export function calculateUserTotal(
  userId: string,
  items: Item[],
  assignments: Assignment[],
  taxServiceRate: number
): { subtotal: number; tax: number; total: number } {
  const userAssignments = assignments.filter(a => a.userId === userId);
  
  const subtotal = userAssignments.reduce((sum, assignment) => {
    const item = items.find(i => i.id === assignment.itemId);
    if (!item) return sum;
    return sum + calculateItemCostPerPerson(item, assignments);
  }, 0);

  const tax = subtotal * (taxServiceRate / 100);
  const total = subtotal + tax;

  return { subtotal, tax, total };
}

// Helper function to get all participants for a bill
export function getBillParticipants(billId: string): User[] {
  const bill = getBillWithDetails(billId);
  if (!bill) return [];
  return bill.users;
}
