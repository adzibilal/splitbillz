# Splitbillz Testing Checklist

## Pre-Demo Setup
- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Run `npm run dev` to start the development server
- [ ] Open http://localhost:3000 in browser
- [ ] Test on mobile viewport (use browser dev tools)
- [ ] Test on desktop viewport

## Host Flow Testing

### 1. Create Bill Flow
- [ ] Navigate to landing page `/`
- [ ] Click "Create New Bill"
- [ ] Enter host name (required field validation)
- [ ] Enter restaurant name (optional)
- [ ] Click "Continue" - should redirect to upload page
- [ ] Verify bill ID is generated and visible in URL

### 2. Upload Receipt
- [ ] See upload interface with clear CTAs
- [ ] Click "Skip & Enter Manually"
- [ ] Should redirect to edit page

### 3. Edit Items
- [ ] See empty or pre-filled items list
- [ ] Click "Add Item" to add new item
- [ ] Fill in item name, price, quantity
- [ ] Edit tax/service rate
- [ ] Delete an item using trash icon
- [ ] Verify subtotal calculation
- [ ] Verify tax calculation
- [ ] Verify total calculation
- [ ] Click "Save & Share" with no items (should show error)
- [ ] Add at least one valid item
- [ ] Click "Save & Share" - should redirect to manage page

### 4. Manage Bill
- [ ] See bill summary with status badge
- [ ] See shareable link section
- [ ] Click "Share Link" button
- [ ] Verify QR code displays
- [ ] Copy link to clipboard (check toast notification)
- [ ] Close dialog
- [ ] See list of items with assignment indicators
- [ ] See participants list (if any joined)
- [ ] Click "Lock for Review"
- [ ] Should redirect to review page

### 5. Review Bill
- [ ] See "Bill Locked" alert
- [ ] See breakdown by person
- [ ] Each person shows their items and totals
- [ ] Fill in payment information form
- [ ] Bank/E-wallet name (required)
- [ ] Account number (required)
- [ ] Account holder name (required)
- [ ] Try to finalize without filling all fields (should show error)
- [ ] Fill all fields correctly
- [ ] Click "Finalize & Send Payment Info"
- [ ] Should redirect to finalized page

### 6. Settlement Tracking
- [ ] See "Bill Finalized" status
- [ ] See payment information card
- [ ] See progress bar showing paid vs pending
- [ ] See list of contributors with payment status
- [ ] Green checkmark for paid users
- [ ] Yellow clock icon for pending users
- [ ] Click "Remind" button on pending user (should show toast)
- [ ] Verify totals are calculated correctly

## Contributor Flow Testing

### 7. Join Bill
- [ ] Navigate to `/join/bill-open-123`
- [ ] See bill preview with restaurant name
- [ ] See host name
- [ ] See number of items
- [ ] See number of existing participants
- [ ] See total amount
- [ ] Enter your name (required validation)
- [ ] Click "Join Bill" - should redirect based on bill status

### 8. Select Items (OPEN status)
- [ ] See welcome message with your name
- [ ] See all items in list
- [ ] Click item card to select/deselect
- [ ] Checkbox should toggle
- [ ] Selected items should have blue border
- [ ] See who else selected each item
- [ ] See "Split with X others" badge on shared items
- [ ] See running total at bottom
- [ ] Verify subtotal calculation
- [ ] Verify tax calculation
- [ ] Verify your total displays correctly
- [ ] Try to confirm with no items (should show error)
- [ ] Select at least one item
- [ ] Click "Confirm Selection"
- [ ] Should show success toast

### 9. Summary (REVIEW status)
- [ ] Navigate to `/join/bill-review-456`
- [ ] Enter name and join
- [ ] See "Waiting for host to finalize" message
- [ ] See your name displayed
- [ ] See "In Review" badge
- [ ] See list of your items
- [ ] See split indicators on shared items
- [ ] See breakdown: subtotal, tax, total
- [ ] See other participants list
- [ ] Click refresh button (should simulate update)

### 10. Payment (FINALIZED status)
- [ ] Navigate to `/join/bill-finalized-789`
- [ ] Enter name and join
- [ ] See payment alert
- [ ] See large total amount prominently
- [ ] See payment information card
- [ ] Click copy button on account number (should show toast)
- [ ] See breakdown of your items
- [ ] See itemized list with split indicators
- [ ] Verify calculations are correct
- [ ] Click "I Have Paid" button
- [ ] Should show success state
- [ ] See green checkmark and confirmation message
- [ ] Button should not be clickable again

## Mobile-Specific Testing

### Touch & Interactions
- [ ] All buttons are easily tappable (44x44px minimum)
- [ ] Bottom action bars are thumb-friendly
- [ ] Text is readable without zooming (16px minimum)
- [ ] Forms have appropriate keyboard types
- [ ] Input fields have proper focus states
- [ ] Navigation feels smooth

### Layout & Design
- [ ] Single column layout on mobile
- [ ] No horizontal scrolling
- [ ] Adequate padding around elements
- [ ] Cards are well-spaced
- [ ] Headers are sticky and functional
- [ ] Content doesn't overlap with fixed elements

### Performance
- [ ] Pages load quickly
- [ ] Transitions are smooth
- [ ] No janky animations
- [ ] Toasts appear and disappear smoothly
- [ ] Images load properly

## Cross-Browser Testing
- [ ] Chrome/Edge (Desktop)
- [ ] Chrome (Mobile/Android)
- [ ] Safari (Mobile/iOS)
- [ ] Firefox

## Edge Cases

### Empty States
- [ ] Bill with no items
- [ ] Bill with no participants
- [ ] User with no items selected

### Invalid URLs
- [ ] Navigate to non-existent bill ID
- [ ] Should show appropriate error

### Navigation
- [ ] Back button works correctly
- [ ] Breadcrumb navigation is logical
- [ ] Can't access wrong status pages directly

### Data Validation
- [ ] Empty name fields are rejected
- [ ] Empty item names are rejected
- [ ] Negative prices are prevented
- [ ] Zero quantities are prevented

## UI/UX Checklist

### Feedback & Notifications
- [ ] Success toasts appear for positive actions
- [ ] Error toasts appear for failed validations
- [ ] Loading states show during async operations
- [ ] Buttons are disabled during processing

### Consistency
- [ ] Typography is consistent throughout
- [ ] Colors follow the design system
- [ ] Spacing is uniform
- [ ] Icons are used consistently
- [ ] Button styles are consistent

### Accessibility
- [ ] Form labels are present
- [ ] Error messages are clear
- [ ] Focus states are visible
- [ ] Color contrast is sufficient
- [ ] Touch targets are adequate

## Demo-Specific Tests

### Multi-Window Testing
- [ ] Open host flow in one window
- [ ] Open contributor flow in another
- [ ] Simulate collaborative experience
- [ ] Verify state management works

### Pre-populated Bills
- [ ] bill-open-123 works correctly
- [ ] bill-review-456 works correctly
- [ ] bill-finalized-789 works correctly

## Final Checks
- [ ] All pages are responsive
- [ ] No console errors
- [ ] No broken links
- [ ] README is up to date
- [ ] DEMO_GUIDE is accurate
- [ ] Environment variables documented

## Known Limitations (Document These)
- [ ] Data resets on page refresh (in-memory only)
- [ ] OCR is simulated
- [ ] Real-time updates are simulated
- [ ] No actual authentication
- [ ] No database persistence

## Post-Demo Discussion Points
- [ ] Integration plan with Supabase
- [ ] n8n OCR workflow setup
- [ ] Deployment strategy
- [ ] Analytics requirements
- [ ] Performance monitoring
- [ ] Error tracking
