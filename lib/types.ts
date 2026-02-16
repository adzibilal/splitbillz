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

// --- Database Types (Supabase) ---

export interface DbBill {
  id: string;
  host_id: string;
  host_name: string;
  restaurant_name: string | null;
  status: string;
  tax_service_rate: number;
  payment_info: any;
  created_at: string;
}

export interface DbItem {
  id: string;
  bill_id: string;
  name: string;
  price: number;
  qty: number;
  created_at: string;
}

export interface DbParticipant {
  id: string;
  bill_id: string;
  user_id: string;
  name: string;
  has_paid: boolean;
  joined_at: string;
}

export interface DbAssignment {
  id: string;
  item_id: string;
  user_id: string;
  quantity: number;
  created_at: string;
}
