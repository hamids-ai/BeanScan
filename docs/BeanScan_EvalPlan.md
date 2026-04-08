# BeanScan — Eval Plan

## Purpose

BeanScan relies on AI at two points in its core flow. Before deploying to production — and after any future change to the lookup pipeline or OCR prompt — you should run a fixed set of evals to confirm quality hasn't regressed. This document defines what to evaluate, how to set up the test fixtures, what metrics to track, and how to run the evals.

---

## What We're Evaluating

There are two AI-powered components, each with its own failure modes.

### 1. OCR (`ocr-extract`)

Claude Vision reads a bag photo and returns `bagName` and `roasterName`. Failure here cascades — a wrong name means the entire lookup pipeline starts with bad input.

**Failure modes:** misread brand name, truncated bag name, wrong roaster extracted, legal suffixes (™, ®) included.

### 2. Lookup Pipeline (`lookup-coffee`)

Given `bagName` + `roasterName`, the pipeline runs up to 3 phases and returns 10 structured fields:

| Field | Type |
|---|---|
| `roasterLocation` | text |
| `origins` | text |
| `roastLevel` | enum: Light / Medium-Light / Medium / Medium-Dark / Dark |
| `varietal` | text |
| `altitude` | text |
| `processingMethod` | enum: Washed / Natural / Honey / Anaerobic |
| `flavorProfile` | text (comma-separated tags) |
| `bodyCategory` | enum: Light / Medium / Full |
| `bodyDescription` | prose |
| `photoUrl` | URL (validated) |

**Failure modes:** missing fields (null when value exists), wrong values, Phase 3 firing for coffees that should resolve in Phase 1/2, incorrect inferences tagged as `inferredFields`.

---

## Eval Metrics

### OCR Metrics
- **Bag name match rate** — % of test cases where extracted `bagName` matches expected (normalized)
- **Roaster name match rate** — % of test cases where extracted `roasterName` matches expected (normalized)
- Normalization: lowercase, strip punctuation, strip legal suffixes (™ ® © Ltd. LLC Coffee Co.)

### Lookup Pipeline Metrics

| Metric | Description |
|---|---|
| **Field coverage** | % of expected-non-null fields that came back non-null |
| **Field accuracy** | % of non-null fields that match ground truth |
| **Phase efficiency** | Which phase completed each lookup (track regressions, e.g., Phase 3 firing for a known well-indexed coffee) |
| **inferredFields accuracy** | For fields in `inferredFields`, what % match ground truth |

### Grading per field type

| Field category | How to grade |
|---|---|
| Enums (`roastLevel`, `processingMethod`, `bodyCategory`) | Exact match after normalization |
| Short text (`origins`, `roasterLocation`, `varietal`, `altitude`) | Normalized match (lowercase, trim whitespace) |
| Prose (`flavorProfile`, `bodyDescription`) | LLM-graded — Claude scores 0 or 1 based on whether meaning aligns |
| `photoUrl` | Presence check only (not null = pass); URL changes over time so exact URL is not checked |

### Pass/Fail logic per field
- Expected `null`, got `null` → **pass** (expected gap)
- Expected `null`, got a value → **pass** (bonus coverage, no penalty)
- Expected a value, got `null` → **fail** (coverage miss)
- Expected a value, got a value → **check accuracy** (graded as above)

---

## Test Set Setup

### Folder Structure

Create this folder structure at the project root (alongside `supabase/` and `frontend/`):

```
evals/
  fixtures/
    ocr/
      images/          ← bag photos go here
      ground_truth.json
    lookup/
      test_cases.json
  reports/             ← generated output, gitignored
```

To create it, run this once from the project root:

```
mkdir -p evals/fixtures/ocr/images
mkdir -p evals/fixtures/lookup
mkdir -p evals/reports
```

Add `evals/reports/` to `.gitignore` (reports are generated output, not source).

---

### OCR Test Set

#### How many photos?

**Minimum: 10. Target: 15.**

You have 6 — add at least 4 more. Aim for diversity across these categories:

| Category | Why it matters |
|---|---|
| Clean printed label, light bag | Baseline easy case |
| Busy label with many words | Tests that the right words are extracted |
| Dark/black bag | Low contrast text is harder |
| Script or decorative font | Non-standard letterforms |
| Small or crowded text | Dense layouts |
| Non-English characters in name | Accent marks, umlauts, etc. |
| Label with ™/® symbols on the name | Tests normalization stripping |
| Bag shot at a slight angle | Real-world capture condition |

You do not need to cover all 8 — 10 photos total with a mix of easy, medium, and hard cases is sufficient for MVP evals.

#### File naming

Save photos to `evals/fixtures/ocr/images/`. Name each file:

```
ocr_NNN_roastername_bagname.jpg
```

Where:
- `NNN` is a zero-padded number: `001`, `002`, etc.
- `roastername` and `bagname` are lowercase with underscores, no spaces

Examples:
```
ocr_001_stumptown_hair_bender.jpg
ocr_002_blue_bottle_hayes_valley_espresso.jpg
ocr_003_intelligentsia_black_cat_classic.jpg
```

Use `.jpg` unless the photo is a `.png`, in which case keep `.png`.

#### Ground truth file

Create `evals/fixtures/ocr/ground_truth.json`. For each photo, add one entry:

```json
[
  {
    "id": "ocr_001",
    "imageFile": "ocr_001_stumptown_hair_bender.jpg",
    "expected": {
      "bagName": "Hair Bender",
      "roasterName": "Stumptown Coffee Roasters"
    },
    "notes": "Clean printed label, white background — easy case"
  },
  {
    "id": "ocr_002",
    "imageFile": "ocr_002_blue_bottle_hayes_valley_espresso.jpg",
    "expected": {
      "bagName": "Hayes Valley Espresso",
      "roasterName": "Blue Bottle Coffee"
    },
    "notes": "Dark bag, small text"
  }
]
```

**How to determine the expected values:** Look at the physical bag (not the AI output). Write down what is literally printed on the bag as the product/blend name and the roaster name. Do not include subtitles, taglines, or weight. Strip ™/®/© from expected values — the eval normalizes both sides.

---

### Lookup Test Set

#### How many test cases?

**Minimum: 12. Target: 15.**

Build the set to cover all three phases of the pipeline:

| Segment | Count | Criteria |
|---|---|---|
| Well-known roasters with strong web presence | 4–5 | Should resolve fully in Phase 1 or Phase 2. Examples: Stumptown, Blue Bottle, Intelligentsia, Counter Culture, Four Barrel |
| Mid-tier roasters with some online presence | 3–4 | May need Phase 2 to fill gaps. Local/regional roasters with their own website but not widely indexed |
| Obscure / small roasters | 3–4 | Limited web footprint — Phase 3 expected to run. Small local roasters, farmer's market roasters, etc. |
| Edge cases | 1–2 | Unusual bag names with commas or special characters, non-English roaster names, blends with generic names ("Breakfast Blend") |

For coffees you have already tested manually, use those as a starting point — you already have a rough idea what fields are findable.

#### File

Create `evals/fixtures/lookup/test_cases.json`. Add one object per coffee:

```json
[
  {
    "id": "lookup_001",
    "input": {
      "bagName": "Hair Bender",
      "roasterName": "Stumptown Coffee Roasters"
    },
    "expectedPhase": "roaster",
    "expected": {
      "roasterLocation": "Portland, OR, USA",
      "origins": "Ethiopia, Indonesia, Latin America",
      "roastLevel": "Medium",
      "varietal": null,
      "altitude": null,
      "processingMethod": null,
      "flavorProfile": "Chocolate, Caramel, Citrus",
      "bodyCategory": "Medium",
      "bodyDescription": null,
      "photoUrl": "present"
    },
    "nullable": ["varietal", "altitude", "processingMethod", "bodyDescription"],
    "notes": "Popular blend — full Phase 1 resolution expected"
  }
]
```

**Field-by-field guidance:**

| Field | How to fill it in |
|---|---|
| `input.bagName` | Exact bag name as printed on the bag |
| `input.roasterName` | Exact roaster name as printed on the bag |
| `expectedPhase` | Your best estimate: `"roaster"`, `"retail"`, `"agent"`, or `"partial"`. Used to detect phase regressions, not to fail the test |
| `expected.*` | The correct value for each field. Set to `null` if you genuinely don't know or the field is not applicable to this coffee |
| `nullable` | List of field names where `null` is an acceptable result — i.e., the field may not exist for this coffee (e.g., varietal is often unlisted for blends). The eval will not penalize a null result for fields listed here |
| `expected.photoUrl` | Use `"present"` if you expect a photo to be findable. Use `null` if the roaster has no product images online |
| `notes` | Free-form notes about the coffee or what to watch for |

**How to find the correct expected values:** Go to the roaster's own website and look up the specific product page for that bag. Record what is listed there. If the roaster's site doesn't list a field (e.g., altitude), check one of the Phase 2 retail sites (drinktrade.com, etc.). What you find there is your ground truth.

**Important:** Set `expected.*` to the actual known value, not what the AI currently returns. The point of evals is to check the AI against reality — not to lock in whatever the AI says today.

---

## Running Evals — Local vs. CI

### Option A: Local Script (Recommended to start)

A script you run manually from the terminal before deploying or after changing the lookup pipeline.

**How it works:**
- You run: `node evals/run_lookup_eval.js` (or the Deno equivalent)
- The script reads `test_cases.json`, calls the deployed Supabase edge functions directly, scores each result against ground truth, and writes a report to `evals/reports/`
- The report shows pass/fail per field per test case and a summary score

**Pros:**
- No new tools to install
- You control exactly when it runs
- You can run a single test case during debugging
- Cheap — you choose when to spend the ~$1.50/run

**Cons:**
- Manual — easy to forget before a deploy
- No enforcement — nothing stops you from deploying without running evals
- No history unless you commit reports manually

---

### Option B: CI via GitHub Actions

A GitHub Actions workflow that runs evals automatically on a trigger (manual button, or on push to `main`).

**How it works:**
- A `.github/workflows/evals.yml` file defines when and how to run
- GitHub runs the eval script in the cloud on their servers
- Results are saved as a GitHub Actions artifact (downloadable from the Actions tab)
- You can configure it to fail the workflow if eval scores drop below a threshold

**Do you need to install new software locally?** No. GitHub Actions runs entirely in GitHub's cloud. You only need to:
1. Add the workflow YAML file to the repo
2. Add 4 secrets to the GitHub repo settings (Settings → Secrets → Actions):
   - `CLAUDE_API_KEY`
   - `BRAVE_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

**Trigger options:**

| Trigger | Trade-off |
|---|---|
| Manual only (`workflow_dispatch`) | You click a button in GitHub Actions UI to run — no automation, but no surprise costs |
| On push to `main` | Runs automatically after every merge — enforces quality but costs ~$1.50 per deploy |
| On PR (before merge) | Catches regressions before they land — most protective, but costs ~$1.50 per PR |

**Pros:**
- Enforced — runs without you remembering
- Traceable — history of every eval run tied to a commit
- Can block a deploy if scores drop below threshold

**Cons:**
- Each run costs ~$1.50 in API calls (Brave + Claude)
- 3–5 min to run (network latency to edge functions)
- Requires managing GitHub secrets
- CI setup takes ~1–2 hours to configure and test

---

### Recommendation

**Start with Option A (local script).** Get the fixtures built, get the script working, and run it manually before each deploy. Once you've run it a few times and the fixtures are stable, migrate to Option B with a `workflow_dispatch` trigger (manual button in GitHub) — that way you get CI infrastructure without paying for every push. Auto-trigger on push to `main` is the right final state once the app is in active production use.

---

## Milestone Summary

| Milestone | What |
|---|---|
| **M1 — Define evals** | This document. Fixture structure, metrics, grading criteria, and automation approach all defined. |
| **M2 — Build test fixtures** | Build the photo set (OCR) and `test_cases.json` (lookup) with real ground truth values. |
| **M3 — Technical plan** | Design the eval script: how it calls edge functions, how it grades, what it outputs. |
| **M4 — Implement** | Write and test the eval script. |
| **M5 — Run and evaluate** | Run against current pipeline, review scores, identify gaps. |
| **M6 — Triage and remediate** | Review M5 results. Decide which failures are blockers vs. acceptable gaps. Fix any pipeline issues and re-run evals to confirm scores pass a defined threshold before deploying. |
| **M7 — Migrate to CI** *(post-launch)* | Set up the GitHub Actions workflow with a manual trigger button. Not required before launch — do this once the local script is stable and you are in active production use. |

> **Note on M1 vs. M2:** The original plan had M2 as "determine the best way to run these evals in an automated way." That decision (local script first, CI later) is made and documented in the Running Evals section above — so it is effectively resolved as part of M1. M2 here covers the fixture-building work that is a prerequisite before any script can run.

---

**Version:** 1.0
**Created:** April 7, 2026
