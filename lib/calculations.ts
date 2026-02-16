import { Item, Assignment } from './types';

/**
 * Calculates how much an item costs for a single person assigned to it.
 */
export function calculateItemCostPerPerson(item: Item, assignments: Assignment[]): number {
  const itemAssignments = assignments.filter(a => a.itemId === item.id);
  const splitCount = itemAssignments.length || 1;
  return (item.price * item.qty) / splitCount;
}

/**
 * Calculates the total for a specific user.
 */
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
    // We pass all assignments to calculateItemCostPerPerson so it can count splitters
    return sum + calculateItemCostPerPerson(item, assignments);
  }, 0);

  const tax = subtotal * (taxServiceRate / 100);
  const total = subtotal + tax;

  return { subtotal, tax, total };
}
