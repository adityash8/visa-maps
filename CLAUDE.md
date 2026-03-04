# Visa Maps

## What This Is
Interactive world map showing visa requirements for any passport. Color-coded countries (visa-free, eVisa, visa-on-arrival, visa-required) with affiliate CTAs for flights, visas, and insurance.

## Tech Stack
- **Framework**: Next.js 14, TypeScript, Tailwind CSS v4
- **Map**: MapLibre GL JS (free, no token needed) with CartoDB Positron basemap
- **Data**: Static JSON files — 50 passports × 194 destinations = 9,700 visa rules
- **GeoJSON**: Natural Earth 110m admin-0 countries (177 features, uses `ISO_A2_EH` property)
- **UI**: cmdk (passport search), vaul (mobile drawer), lucide-react (icons), class-variance-authority
- **Analytics**: PostHog (optional — degrades gracefully without key)
- **Waitlist**: Supabase (optional — returns 200 without config)

## Project Structure
```
app/
  page.tsx              — main map page (client component)
  passport/[country]/   — 50 SEO pages (SSG via generateStaticParams)
  api/waitlist/         — POST endpoint (Supabase upsert)
components/
  map/                  — visa-map.tsx, map-legend.tsx, use-map-colors.ts
  panels/               — country-detail.tsx, country-panel.tsx (desktop), country-bottom-sheet.tsx (mobile)
  controls/             — passport-selector.tsx, dual-passport-toggle.tsx, filter-bar.tsx, share-button.tsx
  affiliate/            — flight-cta.tsx, visa-cta.tsx, insurance-cta.tsx
  seo/                  — passport-hero.tsx, visa-summary-table.tsx
lib/
  constants.ts          — visa categories, colors, types
  visa-data.ts          — load/cache JSON, O(1) lookups, dual-passport union logic
  affiliate-links.ts    — Google Flights, iVisa, SafetyWing URL builders
  analytics.ts          — typed PostHog event wrappers
  use-local-passport.ts — localStorage + URL param (?p=US&p2=GB) persistence
public/data/
  passports.json        — 50 passports (code, name, flag, rank)
  visa-rules.json       — nested map: rules[passport][destination] → {category, duration?, notes?}
  countries.geojson     — Natural Earth 110m boundaries
```

## Key Architecture Decisions
- MapLibre GL (not Mapbox) — free, no API token required
- `ISO_A2_EH` GeoJSON property (not `ISO_A2`) — fixes Norway/France having `-99`
- Map container wrapped in positioned parent div — MapLibre overrides container to `position: relative`
- Color expression stored in ref — prevents stale closure when data loads before map `load` event
- Supabase client is lazy-initialized — prevents build crash when env vars are missing

## Running Locally
```bash
npm install
npm run dev        # http://localhost:3000
```
No API keys needed — map, data, and all UI work without configuration.

Optional keys (in `.env.local`, see `.env.example`):
- `NEXT_PUBLIC_POSTHOG_KEY` — enables analytics
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — enables waitlist persistence

## Deployment
Deployed on Vercel: https://visa-maps.vercel.app
- `vercel --prod` to deploy
- No env vars required for basic functionality

## Known Limitations / Future Work
- Visa data is static/approximate — needs real API or regular updates
- No country name labels on the map itself (relies on basemap labels)
- SEO pages use country codes in tables instead of full names
- No sitemap.xml or robots.txt yet
- OG image not yet generated
- Filter uses hex color with alpha suffix (`#22c55e40`) for dimming — works but not ideal
