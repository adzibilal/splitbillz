# Splitbillz Demo Guide

This guide will help you demonstrate the Splitbillz app to stakeholders.

## Quick Demo Flow

### Option 1: Host Flow (Full Journey)

1. **Landing Page** (`/`)
   - Click "Create New Bill"

2. **Create Bill** (`/host/create`)
   - Enter your name (e.g., "Adzi")
   - Optionally add restaurant name
   - Click "Continue"

3. **Upload Receipt** (`/host/[billId]/upload`)
   - Click "Skip & Enter Manually" (OCR is simulated)

4. **Edit Items** (`/host/[billId]/edit`)
   - Add items manually or edit pre-filled items
   - Adjust tax/service rate
   - Click "Save & Share"

5. **Manage Bill** (`/host/[billId]/manage`)
   - Click "Share Link" to see QR code and copy link
   - Wait for contributors to join (simulate by opening link in new tab)
   - Click "Lock for Review" when ready

6. **Review Bill** (`/host/[billId]/review`)
   - Review breakdown by person
   - Enter payment information (Bank, Account Number, Name)
   - Click "Finalize & Send Payment Info"

7. **Settlement Tracking** (`/host/[billId]/finalized`)
   - View payment status
   - See who has paid vs pending
   - Send reminders (simulated)

### Option 2: Contributor Flow

1. **Join Bill** (`/join/bill-open-123`)
   - Enter your name
   - Click "Join Bill"

2. **Select Items** (`/join/bill-open-123/select`)
   - Check items you ordered
   - See running total with tax
   - Click "Confirm Selection"

3. **Summary** (`/join/bill-open-123/summary`)
   - View your selected items
   - See breakdown with tax
   - Wait for host to finalize

4. **Payment** (change URL to `/join/bill-finalized-789/payment`)
   - See total amount to pay
   - View payment information
   - Copy account details
   - Click "I Have Paid"

## Pre-populated Demo Bills

Use these URLs to demonstrate different stages:

### Bill 1: Open (Accepting Selections)
- URL: `/join/bill-open-123`
- Status: OPEN
- Restaurant: Warung Makan Sederhana
- 5 items, 2 existing participants

### Bill 2: In Review
- URL: `/join/bill-review-456`
- Status: REVIEW
- Restaurant: Restoran Padang Raya
- 8 items, 4 participants
- Shows locked state

### Bill 3: Finalized
- URL: `/join/bill-finalized-789`
- Status: FINALIZED
- Restaurant: Cafe Kopi Kenangan
- 6 items, 3 participants
- 2 paid, 1 pending
- Payment info available

## Key Features to Highlight

### Mobile-First Design
- Show responsive design by resizing browser
- Large touch targets (44x44px minimum)
- Bottom-aligned actions for thumb-friendly UX
- Clean, single-column layout

### No Registration
- Emphasize instant start without sign-up
- Anonymous sessions work seamlessly
- Share link is all you need

### Smart Splitting
- Demonstrate shared items (e.g., Es Teh Manis in bill-open-123)
- Show automatic cost distribution
- Tax/service charge split proportionally

### Real-time Updates (Simulated)
- Multiple people can select items simultaneously
- Host sees all selections live
- Contributors see who else selected items

### Fair & Transparent
- Everyone sees the full bill
- Clear breakdown per person
- No hidden costs

## Tips for Demo

1. **Use Two Browser Windows**: Open host and contributor flows side by side

2. **Tell a Story**: "Imagine we just finished dinner at a restaurant..."

3. **Highlight Pain Points**: "Usually someone has to calculate everything manually..."

4. **Show Mobile View**: Use browser dev tools or actual mobile device

5. **Emphasize Speed**: "From upload to payment info in under a minute"

6. **Point Out UX Details**:
   - Toast notifications for feedback
   - Loading states during transitions
   - Clear CTAs at every step
   - Progress indicators

## Common Questions

**Q: Is OCR really working?**
A: In this demo, OCR is simulated. In production, it will use n8n workflow with AI vision.

**Q: How does authentication work?**
A: Demo uses in-memory state. Production will use Supabase Anonymous Auth for persistent sessions.

**Q: Can I see real-time updates?**
A: Demo simulates updates. Production will use Supabase Realtime for live sync.

**Q: Where is data stored?**
A: Currently in-memory (resets on refresh). Production will use PostgreSQL via Supabase.

## Next Steps Discussion

After the demo, discuss:
- Integration timeline with Supabase
- n8n OCR workflow setup
- Testing strategy
- Deployment platform
- Analytics & monitoring needs
