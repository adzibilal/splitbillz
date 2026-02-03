export type BillStatus = 'PENDING_OCR' | 'OPEN' | 'REVIEW' | 'FINALIZED';

export interface Bill {
  id: string;
  hostId: string;
  hostName: string;
  restaurantName?: string;
  status: BillStatus;
  taxServiceRate: number; // percentage
  paymentInfo?: PaymentInfo;
  createdAt: Date;
}

export interface PaymentInfo {
  bank: string;
  account: string;
  name: string;
}

export interface Item {
  id: string;
  billId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Assignment {
  id: string;
  itemId: string;
  userId: string;
  userName: string;
}

export interface User {
  id: string;
  name: string;
  hasPaid?: boolean;
}

export interface BillWithDetails extends Bill {
  items: Item[];
  assignments: Assignment[];
  users: User[];
}
