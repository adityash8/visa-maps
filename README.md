# Visa Maps

Explore sourced visa information for ordinary-passport tourist visits. Choose a passport, compare destinations and open the official source before planning travel.

**Live demo**: [visa-maps.vercel.app](https://visa-maps.vercel.app)

## Features

- All 50 passport choices; a 195-country catalogue provides 194 destinations after excluding the selected passport's home country. Search also reaches countries without map geometry.
- Single or optional dual passport selection, category filters and shareable URLs such as `?p=IN&p2=US`. Details name the passport whose rule is shown.
- Map and readable destination lists with conditions, official source, check date and stale-data notices. Unknown pairs remain grey and show No data.
- Fifty passport guides, canonical metadata, sitemap and robots routes.
- Destination-specific Google Flights search. Visa application links remain unavailable until a real provider-issued partner URL is configured.
- Waitlist persistence when Supabase is configured. Missing configuration returns an error; signing up does not claim confirmed alerts or email delivery.

The initial source-checked dataset contains **1,616 pairs** covering the Schengen area, Japan, Singapore, India and the Maldives where the checked sources support a category. It replaces the previous approximate labels. [Source-review metadata](public/data/source-review.json) records scope, sources and exclusions. `factory-official-source-review-v1` means a tool-assisted reading of official sources, not human immigration review. Human review is still required before customer launch. No government scraper is installed.

Check official sources before travel. Entry is not guaranteed.

## Quick Start

```bash
npm ci
npm run dev
```

Use Node.js 24. The map and source-checked catalogue work without application API keys. Open [localhost:3000](http://localhost:3000).

Optional runtime configuration:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical HTTPS origin; defaults to the existing production URL above. |
| `NEXT_PUBLIC_IVISA_PARTNER_URL` | Complete provider-issued HTTPS referral URL on `ivisa.com` or `www.ivisa.com`. It is used unchanged. Real partner enrollment, destination support and attribution must be verified separately. |
| `NEXT_PUBLIC_SUPABASE_URL` | Existing shared Supabase project for waitlist persistence. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | That project's public anonymous key, with the intended insert-only waitlist policy. |

Store real configuration outside Git. No PostHog SDK or network analytics is included. Allowlisted local browser events contain no email address or personal identity.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Browser checks use native Chromium on desktop and mobile, including the actual MapLibre worker, painted country colour, destination access, source details, missing-data states and loading failures. Configure `PLAYWRIGHT_BASE_URL` for an existing production server. Unit persistence fixtures do not establish hosted waitlist acceptance.

Actual affiliate tracking, confirmed email alerts, weekly unpublished rule-change review and human source approval remain launch gates. No Stripe billing or booking flow is part of this prototype.

## Tech

Next.js 16 · React 19 · TypeScript · Tailwind v4 · MapLibre GL 6
