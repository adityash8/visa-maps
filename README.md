# Visa Maps

Interactive world map showing visa requirements for your passport. Select your nationality, see which countries are visa-free, eVisa, visa-on-arrival, or visa-required — all color-coded on a map with direct links to book flights and apply for visas.

**Live demo**: [visa-maps.vercel.app](https://visa-maps.vercel.app)

## Features

- Color-coded world map for 50 passports × 194 destinations
- Dual passport mode — shows the best access from either passport
- Filter by visa category with country counts
- Click any country for details + affiliate CTAs (flights, visa, insurance)
- Mobile-optimized with bottom sheet panels
- Share via URL (`?p=IN&p2=US`), Twitter, WhatsApp
- 50 SEO-optimized passport pages at `/passport/[country]`
- Waitlist signup (Supabase)
- PostHog analytics

## Quick Start

```bash
npm install
npm run dev
```

No API keys required. Open [localhost:3000](http://localhost:3000).

## Tech

Next.js 14 · TypeScript · Tailwind v4 · MapLibre GL · cmdk · vaul
