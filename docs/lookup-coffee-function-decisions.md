# lookup-coffee Function: Key Decisions & Architecture

## Current State

---

### Overview

`supabase/functions/lookup-coffee/index.ts` is a Deno edge function that takes `{ bagName, roasterName }` and returns structured coffee metadata. It runs a 3-phase pipeline, stopping as soon as all fields are populated. Results are cached in Supabase (`lookup_cache` table) for 90 days.

**Fields returned:**
`roasterLocation`, `origins`, `roastLevel`, `varietal`, `altitude`, `processingMethod`, `flavorProfile`, `bodyCategory`, `bodyDescription`, `photoUrl`

**Additional response fields:**
- `source` — one of: `cache`, `roaster`, `retail`, `agent`, `partial`, `manual`
- `inferredFields[]` — list of fields populated by Phase 3 (AI knowledge, not scraped)

---

### Caching

- Cache key: `"${roasterName.toLowerCase()}|${bagName.toLowerCase()}"`
- TTL: 90 days (checked via `cached_at >= cutoff`)
- On hit: returns immediately with `source: 'cache'`
- On miss: runs full pipeline, then upserts result including `inferredFields`

---

### Phase 1 — Roaster's Own Website

**Goal:** Extract as many fields as possible directly from the roaster's own website. This is the highest-trust source — the roaster's site has authoritative data about their own coffee.

**How it works:**
1. Runs up to 3 progressively looser Brave searches:
   - `"${bagName}" "${roasterName}" coffee`
   - `${simplifiedBagName} "${roasterName}" coffee`
   - `${simplifiedBagName} ${roasterName} coffee`
2. Filters results to URLs whose hostname contains a word from `roasterName` (`isRoasterDomain`)
3. Picks the roaster-domain URL with the highest `urlBagNameScore` (see Scoring section)
4. Fetches and parses that page → extracts all fields via Claude Haiku → returns full result

---

### Phase 2 — Retail / Aggregator Sites

**Goal:** Fill all remaining null fields by scraping retail sites in a fixed priority order.

**Retail site order:**
1. `drinktrade.com`
2. `wholelattelove.com`
3. `mistobox.com`
4. `coffeereview.com`
5. `beanbox.com` ← moved to last; tends to have sparse/unreliable data

**How it works (per site):**
1. **Direct Shopify URL probe first** — constructs `https://{domain}/products/{bag-name-slug}` and does a HEAD request (4s timeout). If 200 OK, fetches that URL directly. This skips Brave search entirely for Shopify-based sites, saving 3–4 API calls.
2. **Brave search fallback** — if direct URL fails, tries up to 6 search queries in order:
   - `site:{domain} "{bagName}" "{roasterName}"`
   - `site:{domain} "{bagName}" "{firstWordOfRoaster}"`
   - `site:{domain} {simplified} "{firstWord}"`
   - `"{roasterSlug}-{bagSlug}" site:{domain}`
   - `"{roasterSlug}-{bagSlug}" {domain}`
   - `site:{domain} {simplified}`
3. Scores all results by `urlBagNameScore`. **Requires score ≥ 2** to proceed — this prevents fetching wrong-coffee pages that share only generic words like "organic" or "peru".
4. Fetches page → extracts fields → merges into accumulated result (first non-null wins; `mergeFields`).
5. Stops early if all fields are populated.

---

### Phase 3 — AI Knowledge + Agentic Loop

**Goal:** Fill any remaining null fields using Claude's training knowledge. Fields filled here are tagged in `inferredFields[]`.

**Step 1 — Quick synthesis (no tools):**
- Sends a single Claude Haiku request with the extraction prompt + instruction to use training knowledge
- Special note in prompt: only provide `roasterLocation` if certain — do not guess
- If any fields are populated → **returns immediately** (does NOT proceed to agentic loop)
- **Key decision:** Originally the agentic loop timeout was silently discarding quick synthesis results. Fix: if `inferredFields.length > 0` after quick synthesis, return right away.

**Step 2 — Agentic loop (only if quick synthesis found nothing):**
- Max 4 tool iterations, max 2 Claude calls
- Tools available: `brave_search`, `fetch_page`
- Claude is told which fields are still null and what's already been found
- Runs iteratively until `end_turn` or limits hit

**Step 3 — Final synthesis:**
- After the agentic loop, sends everything gathered to Claude for a final extraction pass
- Merges new fields into result, tagging them in `inferredFields[]`

**Phase 3 timeout:** 25 seconds total (via `Promise.race`). If it times out, returns whatever was accumulated before Phase 3.

---

### Key Helper Functions

| Function | Purpose |
|---|---|
| `braveSearch(query)` | Calls Brave Search API, returns `[{ url, title }]`, max 5 results |
| `fetchPageContent(url)` | Fetches HTML; extracts JSON-LD, meta tags, and visible text; for Shopify URLs also fetches `.json` endpoint in parallel — extracts `imageUrl`, `tags` (array → comma-separated string), and `body_html` (HTML-stripped). These are prepended to the content string in order: Image → Tags → Product description → JSON-LD → meta tags → visible text. Tags are especially reliable as Shopify stores often encode roastLevel, processingMethod, origins, and varietal there. |
| `extractJsonLd(html)` | Parses all `<script type="application/ld+json">` blocks; decodes HTML entities before parsing |
| `extractMetaTags(html)` | Extracts `name`/`property` + `content` pairs from `<meta>` tags |
| `extractText(html)` | Strips scripts/styles/tags, decodes entities, collapses whitespace, truncates to 8000 chars |
| `extractFieldsFromContent(...)` | Sends page content + extraction prompt to Claude Haiku → returns normalized `CoffeeFields` |
| `normalizeResult(raw)` | Validates and normalizes field values: roastLevel matched against ordered list (most specific first to avoid "medium-dark" matching as "medium"), processingMethod and bodyCategory also normalized |
| `mergeFields(base, additions)` | First non-null wins per field; `photoUrl` excluded from Phase 3 merges |
| `urlBagNameScore(url, bagName)` | Counts how many non-generic bag name words appear in the URL path; filters out: `organic, coffee, blend, roast, roasted, light, medium, dark, espresso, decaf, single` |
| `isRoasterDomain(url, name)` | Returns true if any word (>2 chars) from roasterName appears in the URL hostname |
| `simplifyBagName(name)` | Strips punctuation for looser fallback searches |
| `sanitizeName(name)` | Defensive cleanup applied to both `bagName` and `roasterName` on entry: strips `™`/`®`/`©`, parentheticals, brackets, legal suffixes (LLC, Co., etc.), and stray punctuation. Runs before any phase. Complements the OCR prompt — catches manual input noise and anything the prompt misses. |
| `shopifyProductUrl(domain, bagName)` | Constructs `/products/{slug}` URL from bag name |

---

### Extraction Prompt (sent to Claude Haiku)

Instructs Claude to extract all 10 fields from page content. Key hints embedded in the prompt:
- `origins` may be in the product name itself (e.g. "Peru Persy Pusma Martinez" → "Peru")
- `roastLevel` may appear as marketing phrases ("Medium & Cozy") — extract only the standard level words
- `varietal`, `processingMethod`, `flavorProfile` may appear in JSON-LD `additionalProperty` arrays — convert to comma-separated strings
- `altitude` may be labelled "elevation" not "altitude"

---

### Known Issues / Open Debugging

- **OCR misreads roaster name** — ~~resolved 4/2/2026~~ — two-layer fix applied:
  1. **OCR prompt** (`ocr-extract`) now explicitly instructs Haiku to return a clean brand name: strip `™`, `®`, `©`, legal suffixes (LLC, Co., Inc.), parentheticals, and trailing punctuation.
  2. **`sanitizeName()`** in `lookup-coffee` applies the same cleanup defensively on both `bagName` and `roasterName` at the top of the handler, before any phase runs. Catches anything the OCR prompt misses or cases where the user typed a name manually with noise characters. Character-level misread correction (e.g. `"1"` → `"I"`) was intentionally excluded — too risky to apply without context.

- **Phase 2 score ≥ 2 threshold too strict for short/generic bag names** — coffees named things like "Peru Natural" have no identifying words after generic filtering, so all candidates score 0–1 and get rejected. Next step: if all 6 search queries fail to reach score ≥ 2, allow the best-scoring result (score ≥ 1) from query #1 only (the most specific query) as a limited fallback.

- **beanbox.com fields often missing** — `roasterLocation`, `origins`, `roastLevel`, `varietal`, `processingMethod` were not returning. The Shopify `.json` change (4/2/2026) now extracts `tags` and `body_html` which likely covers these fields since beanbox is Shopify-based. Next step: run a beanbox.com coffee through the pipeline to confirm the fix.
