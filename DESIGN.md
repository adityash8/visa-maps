# Visa Maps design contract

Visa Maps is an operating surface for travelers comparing ordinary-passport entry information for short tourist visits. The map leads; the interface makes the source, conditions and limits easy to inspect. The current PRD and explicit finish authorization supply the audience and task. No interview or new product proposition was introduced.

The working question is: "What source-checked rule do we have for this passport and destination?" The answer may be No data. No data is a grey map state and an explicit destination-list label. Source checked means tool-assisted reading of official sources, not human immigration review or eligibility approval. The data scope disclosure keeps that distinction visible.

## System

Hallmark 2 Editorial was deal 3/3, seed `travelers-compare-passport-entry-3e2b·2650459c·2026-10-23·r0`, adapted through its app-screen rules. Taste app seed `981024` supplied Instrument Sans and a quiet tonal frame. The home greeting, marketing composition and decorative motion from that sheet do not fit a map tool; the functional atlas remains the signature. Impeccable Operate mode governs controls, density, states and focus.

Instrument Sans is loaded locally in 400, 500 and 600 weights with its OFL license. Role-based colours and the shared spacing scale live in `app/tokens.css` and `app/globals.css`. Light and dark themes follow the device preference. Existing category colours stay synchronized with MapLibre's tested expressions. Colour is on data and selection state; ordinary chrome remains neutral.

One 1600px capped app frame contains the product header, passport controls and workspace. Desktop uses a 320px destination index and the map; below 768px the map appears before the destination index. Country detail becomes a focus-trapped mobile sheet only on mobile. The desktop detail does not open an invisible modal. The initial mobile map view is wider and centered farther north to show a useful regional view.

## Interaction and content

All buttons, inputs and menu options have at least 44px hit targets, immediate visible keyboard focus, hover/press feedback and reduced-motion support. Passport choices retain all 50 original entries. A second passport is explicitly chosen from the other 49; adding it never defaults to a duplicate. Escape dismisses a passport menu and restores focus.

The original rule rows contain 194 destinations per passport because home is excluded. Their union has 195 country codes. `public/data/destinations.json` retains that union and derives English region names from `Intl.DisplayNames`; no visa facts are inferred. A single passport exposes 194 destinations. The list is independent of the 177-feature map and includes all 29 catalogue countries without usable geometry. Dual mode excludes both home countries and shows the best reviewed rule and its winning passport.

Loading, full, no-data, empty-search, failed-load and retry states are implemented. A source-checked detail shows the category, conditions, known stay limit, full source link, checked date and a stale notice after 30 days. Known entry restrictions that do not fit a visa category stay No data, with a prominent sourced restriction notice. Every detail carries: "Check official sources before travel. Entry is not guaranteed."

Flight links name the actual destination and origin country in the Google Flights query. The visa application action is disabled unless `NEXT_PUBLIC_IVISA_PARTNER_URL` is an approved HTTPS iVisa URL without credentials; the provider-issued URL is preserved unmodified and receives a visible affiliate disclosure. Actual partner enrollment, destination-specific attribution and provider approval remain release gates. No tracking ID or referral parameter is invented.

Waitlist configuration failures show an honest unavailable state. A saved email means waitlist membership only; alerts and email delivery are explicitly inactive. Analytics uses native local events only.

## Search pages

All 50 passport routes are readable static pages. They filter through the same reviewed-rule validator, list provenance and unknown destinations by name, and link into the selected map destination. Unsupported passport routes return 404. Titles do not claim passport ranks or unreviewed visa-free counts. Pages without reviewed records are noindex; the sitemap includes reviewed pages. Canonicals use the confirmed existing `https://visa-maps.vercel.app` origin, overridable by `NEXT_PUBLIC_SITE_URL`. Native PNG social preview and SVG icon are included.

## Evidence

Actual baseline Hallmark render: 13 Floor FAIL, 2 Reflex, with five native screenshots and the same target URL and source paths used for the kept comparison. Original 12 Playwright tests remain unchanged. New UI acceptance covers catalogue reachability, keyboard selection, source/stale/unknown detail, winning passport, links, retry, honest waitlist failure, widths 320/375/414/768/1440 in light/dark, SEO and real MapLibre render timing plus a screenshot pixel.

Proof is stored outside the repository under `/Users/adityasheth/factory/proof/STA-98/design-pass-v3-hallmark`. Runtime/provider configuration, immigration accuracy and source acceptance are separate from interface verification. A fresh independent review is owned by the parent task.
