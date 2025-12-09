# Mandao Service Store

Multi-tenant e-commerce storefront built with Next.js 15.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui + Radix
- **State Management:** Zustand
- **Data Fetching:** TanStack Query v5
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
mandao-service-store/
├── app/                    # Next.js App Router
├── components/              # React components
├── lib/                    # Utilities and helpers
├── types/                  # TypeScript type definitions
└── .tracking/              # Progress tracking
```

## Features

- Multi-tenant support (subdomain-based)
- Public storefront
- Shopping cart
- Checkout with Stripe
- Customer authentication
- Account management
- Template system
