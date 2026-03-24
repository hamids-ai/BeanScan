# BeanScan — Technical Architecture

## 1. Overview / Purpose

BeanScan is a personal coffee journal for home baristas. Users photograph a coffee bag, AI extracts the bag/roaster name via OCR, and a second AI lookup auto-populates full coffee metadata (origin, roast level, flavor profile, etc.). Users maintain one brew log per coffee (grind, rating, tasting notes). Multi-user, private collections.

**Scope:** Web app (mobile-first responsive). No native mobile app. No social features, search, or data export in MVP.

---

## 2. System Architecture

**Pattern:** Monolithic React SPA + Supabase BaaS + Deno edge functions.

```
Browser (React SPA)
    │  HTTPS
    ▼
Supabase Auth  ←──── JWT ────► Edge Functions (Deno)
Supabase DB    ◄──── RLS ────►   ocr-extract  → Claude API (vision)
(PostgreSQL)                      lookup-coffee → Claude API (text) + cache
                                  save-coffee   → DB write + bg photo resolve
```

No traditional backend server. All server-side logic lives in Supabase edge functions.

---

## 3. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + React Router DOM 7, Vite 7, JavaScript (JSX) |
| Styling | CSS custom properties (design tokens), component CSS |
| Backend | Supabase (PostgreSQL, Auth, Edge Functions on Deno runtime) |
| AI / OCR | Anthropic Claude API |
| Client lib | @supabase/supabase-js 2.99 |
| Hosting | Supabase cloud (database + functions); frontend TBD |

**No separate backend server.** Edge functions are the only server-side compute.

---

## 4. Data Architecture

### Tables (PostgreSQL via Supabase)

**`profiles`** — Extended user info
- `id` (uuid, FK → auth.users), `name` (text)
- Auto-created via `handle_new_user()` trigger on signup

**`coffees`** — Core data record (brew log embedded as columns)
- `id`, `user_id` (FK → auth.users)
- Required: `bag_name`, `roaster_name`
- AI-populated: `roaster_location`, `origins`, `roast_level` (enum), `varietal`, `altitude`, `processing_method` (enum), `flavor_profile` (comma-separated string), `body_category` (enum), `body_description`, `photo_url`
- Brew log: `brew_date`, `roast_date`, `grind_setting` (numeric 5,1, required), `rating` (enum), `tasting_notes`, `body_notes`, `brew_last_updated`
- `date_added` (timestamptz)

**`lookup_cache`** — 90-day cache for Claude coffee lookups
- `cache_key` (text PK: `"roastername|bagname"` lowercase), `result` (jsonb), `cached_at`
- No RLS; shared across all users

**`daily_add_counts`** — Rate limiting
- `user_id`, `day` (date), `count` — enforces 20 coffees/day per user

### RLS
All user tables use Row Level Security. Policies ensure `user_id = auth.uid()`.

### Data Flow
```
User photo → base64 → ocr-extract → bag_name, roaster_name
                                          │
                              lookup-coffee:
                                  check cache → hit: return immediately
                                  Phase 1: roaster direct site
                                  Phase 2: retail sites (fill nulls in order)
                                  Phase 3: agent loop (if < 6 fields)
                                  cache result → return { fields, source, inferredFields }
                                          │
                              CoffeeFormScreen (pre-filled; "AI inferred" shown on Phase 3 fields)
                                          │
                              save-coffee (POST) → coffees table
```

---

## 5. Integrations & APIs

### External APIs Consumed
- **Claude API (Anthropic)**
  - `claude-opus-4-6`: OCR — extract bag name + roaster name from image
  - `claude-haiku-4-5-20251001`: Metadata lookup — structured JSON of coffee specs
  - Auth: `CLAUDE_API_KEY` env var in edge functions

### Edge Functions Exposed (internal, auth-required)
All at `POST /functions/v1/<name>` with `Authorization: Bearer <JWT>`.

| Function | Input | Output |
|----------|-------|--------|
| `ocr-extract` | `{ imageBase64 }` (max 5MB data URI) | `{ bagName, roasterName }` |
| `lookup-coffee` | `{ bagName, roasterName }` | coffee metadata + `source: 'cache'\|'roaster'\|'retail'\|'agent'\|'partial'\|'manual'` + `inferredFields: string[]` |
| `save-coffee` POST | Full coffee object | `{ id, dateAdded }` |
| `save-coffee` PATCH | `{ coffeeId, grindSetting, ...brew fields }` | `{ brewLastUpdated }` |

### Auth in Edge Functions
JWT extracted from `Authorization` header → base64url decoded → `sub` claim used as `userId`.

---

## 6. AI / LLM Layer

### Models
- **OCR:** `claude-opus-4-6` — chosen for accuracy on low-quality bag photos
- **Metadata:** `claude-haiku-4-5-20251001` — fast and cheap for structured lookup

### Prompt Architecture
- **OCR prompt:** Vision prompt asking to extract only `bagName` and `roasterName` as JSON. Instructs to return null if not found.
- **Metadata prompt:** Text prompt with roaster + bag name, requests structured JSON response with all coffee spec fields. Includes enum constraints for `roastLevel`, `processingMethod`, `bodyCategory`.
- **Photo URL:** Sourced from scraped product pages (roaster site preferred, aggregators as fallback). URL is validated via HTTP HEAD before storage.

### Lookup Pipeline — Roaster-First Scraper + Agent Loop Fallback

The `lookup-coffee` edge function mirrors how a knowledgeable coffee enthusiast would manually research a coffee: check the roaster's own website first, then check popular retail/aggregator sites for any remaining gaps, and finally fall back to an AI agent for obscure coffees not well-represented on the web.

```
Cache check
    ↓ miss
Phase 1: Roaster Direct Site (roaster's own website)
    ↓ fill any remaining null fields
Phase 2: Popular Coffee Retail Sites (checked in order)
    ↓ if any fields still null after both phases
Phase 3: Agentic Claude Loop (obscure roasters only)
    ↓
Merge (field-level, first source wins) → Cache → Return
```

#### Quality Fields
- **10 tracked fields:** `roasterLocation`, `origins`, `roastLevel`, `processingMethod`, `flavorProfile`, `varietal`, `altitude`, `bodyCategory`, `bodyDescription`, `photoUrl`
- **Phase 3 trigger:** runs if any fields remain null after Phases 1 and 2 complete

#### Phase 1 — Roaster Direct Site
The roaster's own website is the highest-trust source of truth.

1. Brave Search: `"{bagName}" "{roasterName}" coffee` — filter results to the roaster's own domain (heuristic: domain contains a word from `roasterName`)
2. Fetch full HTML of the best matching product page URL
   - Raw HTML fetch captures content in collapsed/accordion UI sections — no special handling needed
   - Try Shopify `.json` endpoint first as a fast path if URL appears to be Shopify
   - Otherwise parse `<script type="application/ld+json">` (JSON-LD / Schema.org `Product`) — structured and reliable when present
   - If JSON-LD is insufficient, extract first ~8,000 chars of visible text
3. Pass content to Claude for field extraction
4. Record all non-null fields found — these are never overwritten by later phases
5. `photoUrl` sourced here is preferred over all other phases

#### Phase 2 — Popular Coffee Retail Sites
Retail and aggregator sites are checked in this exact order to fill any fields still null after Phase 1:

| Order | Site |
|---|---|
| 1 | drinktrade.com |
| 2 | beanbox.com |
| 3 | wholelattelove.com |
| 4 | mistobox.com |
| 5 | coffeereview.com |

For each site:
1. Brave Search with `site:` operator: `site:{domain} "{bagName}" "{roasterName}"`
2. Fetch full HTML of the top result, parse JSON-LD then raw text as above
3. Pass content to Claude for extraction
4. Only fill fields that are still `null` — never overwrite a value already found in Phase 1 or an earlier Phase 2 site
5. Move to the next site if fields are still missing; stop early if all 10 fields are populated

#### Phase 3 — Agentic Claude Loop (Fallback for Obscure Coffees)
Only runs if any of the 10 quality fields are still null after Phases 1 and 2. Designed for small or new roasters with minimal web presence.

Claude runs as a lightweight agent with two tools: `brave_search(query)` and `fetch_page(url)`. It reasons about which fields are still missing, formulates targeted searches, and iterates until it has enough data or exhausts its budget.

Constraints:
- Max 4 tool-use iterations (each search or fetch counts as one)
- Max 3 Claude calls (each receives accumulated tool results as context)
- Phase timeout: 10 seconds
- Agent receives the partial result from Phases 1 and 2 as context — only hunts for still-null fields
- Agent stops early if ≥ 6 fields are populated before budget is exhausted
- On the final synthesis call, Claude uses everything gathered plus its own training knowledge to fill any remaining nulls it can reasonably infer

Fields populated by Phase 3 are tracked separately in `inferredFields` (see Source Tagging below) so the UI can annotate them as "AI inferred."

#### Merge Logic
Results are assembled field-by-field. The first source that provides a non-null value for a field wins — it is never overwritten by a later source.

```
Phase 1 (roaster site)           ← highest trust, first priority
  ↓ fill remaining nulls with
Phase 2 (retail sites, in order) ← drinktrade fills before beanbox, etc.
  ↓ fill remaining nulls with
Phase 3 (agent / Claude inferred) ← lowest trust, last resort
```

`photoUrl` prefers Phase 1 (roaster site), then Phase 2 (retail sites). Phase 3 is not used as a source for `photoUrl`.

#### Source Tagging
Every lookup response includes two fields for traceability and UI annotation:

**`source`** — overall phase that completed the result:

| Value | Meaning |
|---|---|
| `cache` | Returned from 90-day lookup cache (no phases run) |
| `roaster` | Phase 1 filled all 10 fields (no Phase 2 or 3 needed) |
| `retail` | Phases 1+2 filled all 10 fields (no Phase 3 needed) |
| `agent` | Phase 3 ran and filled all remaining null fields |
| `partial` | All phases ran, some fields still null — form pre-filled with what was found |
| `manual` | Complete failure — user fills form from scratch |

**`inferredFields`** — array of field names whose values came from Phase 3 (e.g., `["varietal", "altitude"]`). Used by the frontend to display the "AI inferred" annotation. Empty array if Phase 3 did not run or contributed no fields.

### Lookup UX Requirements

These requirements apply to the frontend during and after the lookup pipeline runs.

**Progress Indicator (during lookup)**
Display a 3-step visual progress indicator with a status text message that updates as each phase runs:

| Phase running | Status message |
|---|---|
| Phase 1 | "Looking up roaster site..." |
| Phase 2 | "Checking popular coffee retail sites..." |
| Phase 3 | "Searching the web for more details..." |

Both the step indicator and the text message update in real time. The indicator remains visible until the lookup completes and the form is populated. The Phase 3 step only appears if Phase 3 actually runs.

**"AI Inferred" Field Annotation (after lookup)**
Any field whose name appears in `inferredFields` is annotated with an **"AI inferred"** label in two places:
1. Inline on the coffee form (CoffeeFormScreen) before the user saves — so the user can review and correct if needed
2. On the Coffee Detail screen after saving — as a persistent visual indicator of confidence level

**Null Field Display**
Missing fields (`null` in the data layer) are displayed as **"N/A"** in the UI. This is a purely presentational rule — the database and API always use `null`.

### Fallback Chain
1. Cache hit → return immediately
2. Phase 1 (roaster direct) → Phase 2 (retail sites, fill nulls in order) → Phase 3 (agent loop, if any fields still null) → `partial` → `manual`

### Context Management
- OCR: single stateless Claude call, no history
- Lookup Phases 1 & 2: single stateless Claude call per page extraction
- Lookup Phase 3: multi-turn within one edge function invocation; accumulated context passed explicitly between iterations; no persistent conversation state

### Caching
`lookup_cache` table: 90-day TTL, keyed on `"roastername|bagname"` (lowercase). Checked before any phase runs. Written after any phase produces a result (including `partial`). Cached result includes `inferredFields` so annotation is preserved on cache hits.

---

## 7. Security & Auth

**Auth:** Supabase Auth — email/password only. JWT sessions stored in browser (localStorage via Supabase client).

**Password rules:** min 8 chars, 1 uppercase, 1 lowercase, 1 number (enforced client-side; Supabase enforced server-side).

**Authorization:** RLS on all tables. Edge functions decode JWT and filter queries by `user_id`.

**Secrets:** `CLAUDE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` stored as Supabase environment secrets (not in code). Frontend uses only the anon key (`VITE_SUPABASE_ANON_KEY`).

**Not in MVP:** Email verification, password reset, rate limiting on login (Supabase default handles brute force).

---

## 8. Scalability & Performance

**Expected load:** Low — personal/hobby app, likely <100 users in beta.

**Rate limiting:** 20 new coffees/day/user (enforced in `save-coffee` via `daily_add_counts`).

**API cost control:** 90-day lookup cache. Estimated max $0.10/coffee (OCR + metadata).

**Photo resolution:** Done asynchronously using `EdgeRuntime.waitUntil()` — non-blocking after response sent. Scrapes only first 50KB of HTML with 8-second timeout.

**Bottlenecks:** Claude API latency (~1-3s per call). Two sequential calls (OCR → lookup) adds up. No streaming in MVP.

---

## 9. Error Handling & Observability

**Error handling strategy:** Graceful degradation at every AI step.
- OCR fails → user taken to manual form
- Lookup fails → form shown with only OCR fields pre-filled
- `source` field in lookup response signals which path was taken

**Client-side errors:** Displayed as inline form messages. API errors mapped to user-friendly strings.

**Logging:** `console.log` / `console.error` in edge functions (visible in Supabase function logs). No structured logging or external log sink in MVP.

**Monitoring:** None configured in MVP. Supabase dashboard provides basic function invocation metrics.

**No alerting** in MVP.

---

## 10. Deployment & DevOps

**Environments:** Single environment (no staging). Development uses local Supabase CLI or the production project directly.

**Frontend:** Not yet deployed. Likely Vercel or Netlify (TBD).

**Backend:** Supabase cloud project. Edge functions deployed via Supabase CLI (`supabase functions deploy`).

**Database migrations:** `supabase/migrations/` — single migration file `20260311000001_initial_schema.sql`. Applied via Supabase CLI.

**CI/CD:** None configured. Manual deploy in MVP.

**Environment variables:**
- Frontend (`.env.local`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Edge functions (Supabase secrets): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLAUDE_API_KEY`, `BRAVE_API_KEY`

---

## 11. Open Questions / Decisions Log

| # | Question | Status |
|---|----------|--------|
| 1 | Frontend hosting (Vercel vs Netlify vs other) | **Unresolved** |
| 2 | What to do when `photo_url` resolves to a broken image after save? | **Unresolved** — no retry or re-resolve mechanism exists |
| 3 | Body notes field exists in DB and BrewLogScreen but not in product spec brew log table | **Resolved** — Body Notes is included in the product spec brew log table |
| 4 | Supabase Auth `lock` workaround in `supabase.js` (custom lock function) | **Unresolved** — cause unknown; investigate before prod |
| 5 | No staging environment | **Accepted risk** for MVP |
| 6 | Manual coffee entry path (no photo) | **Implemented** — Add Manually button on AddCoffeeScreen skips OCR+lookup, goes straight to blank form |
| 7 | Brew Log Reminders (push notifications) | **Deferred** — not in MVP |
| 8 | Search/filter, duplicate detection, data export | **Deferred** — post-MVP |
| 9 | lookup-coffee phase order: roaster-first vs. aggregator-first | **Resolved** — roaster site checked first (highest trust), then retail sites in fixed order, then agent loop |
| 10 | How to communicate lookup progress to user | **Resolved** — 3-step visual progress indicator + per-phase status text messages |
| 11 | How to surface AI-inferred field confidence to user | **Resolved** — "AI inferred" label shown inline on form and on Coffee Detail screen for any field sourced from Phase 3; tracked via `inferredFields` array in API response |
| 12 | Phase 3 timeout and overall lookup wait time | **Accepted for now** — Phase 3 capped at 25 seconds; worst-case total ~35s. Option C (run Phase 3 in background, stream results to form) deferred for future improvement |
| 13 | Roaster sites that display attributes as visual graphs (e.g. Stumptown roast level bar chart) | **Accepted for now** — Phase 1 misses visual-only fields; Phase 2 retail sites display the same data as plain text and fill the gap. Future improvement: scan raw HTML for `data-*` attributes on chart/slider elements (Option B), or render page via headless browser + Claude vision (Option C, post-MVP) |

### Rejected Alternatives
- **Separate Node.js backend:** Rejected — Supabase edge functions sufficient; reduces infra complexity.
- **Tesseract.js for OCR:** Rejected — Claude vision performs better on bag photos with varied fonts/layouts.
- **Perplexity API for metadata:** Planned in spec but replaced — Claude Haiku used instead (single API vendor, cheaper, sufficient quality).
- **Separate brew_logs table:** Rejected — brew log embedded in coffees table (one log per coffee, simpler schema).
- **MongoDB:** Rejected — Supabase PostgreSQL chosen for built-in auth and RLS.
- **Brave Search → any URL → Shopify JSON only (v1 lookup):** Rejected — too reliant on Shopify-hosted roasters; product JSON descriptions too sparse; typically returned only 3-5 of 9 fields. Replaced by hybrid curated scraper + agent loop.
- **Claude memory as parallel lookup (v1 lookup):** Rejected as primary strategy — unreliable for small/indie roasters outside Claude's training data. Retained only as fill-in within Phase 3 agent loop.
