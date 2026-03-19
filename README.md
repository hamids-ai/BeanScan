# BeanScan

Your personal coffee bean journal. Photograph a coffee bag, let AI extract and look up the details, and build a record of every coffee you try — with brew notes, grind settings, and tasting impressions.

## Stack

- **Frontend:** React + Vite (JavaScript)
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions on Deno)
- **AI:** Anthropic Claude API (OCR + metadata lookup)

## Running Locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Requires a `.env.local` file in the `frontend/` directory. Copy the example and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

### Supabase Edge Functions

Deploy all three functions via the Supabase CLI:

```bash
supabase functions deploy ocr-extract --no-verify-jwt
supabase functions deploy lookup-coffee --no-verify-jwt
supabase functions deploy save-coffee --no-verify-jwt
```

The following secrets must be set in your Supabase project:

| Secret | Description |
|--------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `CLAUDE_API_KEY` | Your Anthropic API key |

Set secrets via:

```bash
supabase secrets set CLAUDE_API_KEY=your_key_here
```

### Database

Apply the migration to set up the schema:

```bash
supabase db push
```

## Why I Built It

The primary purpose of this project was for me to learn building with AI.
