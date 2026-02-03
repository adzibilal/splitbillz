# Splitbillz

A mobile-first web app for splitting bills easily with friends, built with Next.js 15, TypeScript, and shadcn/ui.

## Features

- **No Registration Required**: Start splitting bills instantly without sign-up
- **Easy Bill Splitting**: Upload receipt, share link, and let everyone pick their items
- **Mobile-First Design**: Optimized for mobile devices with touch-friendly interactions
- **Real-time Updates**: See who's selecting what in real-time (simulated in demo)
- **Fair & Transparent**: Everyone sees what they ordered and pays their fair share
- **Smart Calculations**: Automatically splits shared items and distributes tax/service charges

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Mode

This version uses dummy data for demonstration purposes. All bills, items, and user interactions are simulated in-memory.

### Test Flows

**Host Flow:**
1. Create New Bill → Enter your name
2. Upload Receipt (or skip) → Add/edit items
3. Save & Share → Copy link to share
4. Manage Bill → Monitor selections
5. Lock for Review → Add payment info
6. Finalized → Track payments

**Contributor Flow:**
1. Join Bill → Enter your name
2. Select Items → Choose what you ordered
3. Summary → Review your total
4. Payment → Transfer and confirm

### Sample Bills

The app includes 3 pre-populated demo bills:
- `bill-open-123` - Open bill accepting selections
- `bill-review-456` - Bill in review status
- `bill-finalized-789` - Finalized bill with payment info

## Project Structure

```
splitbillz/
├── app/                    # Next.js app directory
│   ├── host/              # Host flow pages
│   ├── join/              # Contributor flow pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # shadcn components
│   └── ...               # Custom components
├── context/              # React context
├── lib/                  # Utilities and types
└── public/              # Static assets
```

## Mobile-First Design

All components are optimized for mobile:
- Single column layouts
- 44x44px minimum touch targets
- Bottom-aligned primary actions (thumb-friendly)
- Sticky headers with back navigation
- Readable font sizes (16px minimum)

## Building for Production

```bash
npm run build
npm start
```

## Future Enhancements

When ready to integrate with backend:
- Connect to Supabase for data persistence
- Implement anonymous authentication
- Add n8n OCR workflow integration
- Enable real-time updates via Supabase Realtime
- Add Row Level Security policies

## License

MIT
