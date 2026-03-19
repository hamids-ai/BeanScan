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
                              lookup-coffee (check cache → Claude → cache result)
                                          │
                              CoffeeFormScreen (pre-filled, user edits)
                                          │
                              save-coffee (POST) → coffees table
                                          └─ background: resolve photo_url via og:image scrape
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
| `lookup-coffee` | `{ bagName, roasterName }` | coffee metadata + `source: 'cache'\|'claude'\|'manual'` |
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
- **Photo URL:** Claude is asked to return a `photoUrl` to a professional coffee bag image from roaster site or known retailers (drinktrade.com, beanbox.com, mistobox.com, driftaway.coffee). URL is validated via HTTP HEAD before storage.

### Fallback Chain
1. Claude lookup → 2. Return `source: 'manual'` → 3. User fills form manually

### Context Management
No conversation history. Each Claude call is a single stateless request. No agent orchestration. Responses are parsed as JSON immediately.

### Caching
`lookup_cache` table: 90-day TTL, keyed on `"roastername|bagname"` (lowercase). Checked before any Claude call in `lookup-coffee`.

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
- Edge functions (Supabase secrets): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLAUDE_API_KEY`

---

## 11. Open Questions / Decisions Log

| # | Question | Status |
|---|----------|--------|
| 1 | Frontend hosting (Vercel vs Netlify vs other) | **Unresolved** |
| 2 | What to do when `photo_url` resolves to a broken image after save? | **Unresolved** — no retry or re-resolve mechanism exists |
| 3 | Body notes field exists in DB and BrewLogScreen but not in product spec brew log table | **Unresolved** — possible spec/code drift |
| 4 | Supabase Auth `lock` workaround in `supabase.js` (custom lock function) | **Unresolved** — cause unknown; investigate before prod |
| 5 | No staging environment | **Accepted risk** for MVP |
| 6 | Manual coffee entry path (no photo) | **Implemented** — Add Manually button on AddCoffeeScreen skips OCR+lookup, goes straight to blank form |
| 7 | Brew Log Reminders (push notifications) | **Deferred** — not in MVP |
| 8 | Search/filter, duplicate detection, data export | **Deferred** — post-MVP |

### Rejected Alternatives
- **Separate Node.js backend:** Rejected — Supabase edge functions sufficient; reduces infra complexity.
- **Tesseract.js for OCR:** Rejected — Claude vision performs better on bag photos with varied fonts/layouts.
- **Perplexity API for metadata:** Planned in spec but replaced — Claude Haiku used instead (single API vendor, cheaper, sufficient quality).
- **Separate brew_logs table:** Rejected — brew log embedded in coffees table (one log per coffee, simpler schema).
- **MongoDB:** Rejected — Supabase PostgreSQL chosen for built-in auth and RLS.
