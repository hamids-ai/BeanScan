import { createClient } from 'npm:@supabase/supabase-js'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

declare const EdgeRuntime: { waitUntil: (p: Promise<unknown>) => void }

// Resolves a product page URL to its og:image, or validates a direct image URL.
// Streams only the first 50KB of HTML so it's fast even on large pages.
async function resolveImageUrl(url: string): Promise<string | null> {
  try {
    return await Promise.race([
      doResolve(url),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
    ])
  } catch {
    return null
  }
}

async function doResolve(url: string): Promise<string | null> {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BeanScan/1.0)' } })
  if (!res.ok) return null

  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.startsWith('image/')) return url

  if (contentType.startsWith('text/html')) {
    const reader = res.body?.getReader()
    if (!reader) return null
    const decoder = new TextDecoder()
    let html = ''
    let bytesRead = 0
    while (bytesRead < 50 * 1024) {
      const { done, value } = await reader.read()
      if (done) break
      html += decoder.decode(value, { stream: true })
      bytesRead += value.byteLength
      if (html.includes('</head>')) break
    }
    reader.cancel()
    const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
               ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    const ogImage = match?.[1]
    if (!ogImage) return null
    const imgRes = await fetch(ogImage, { method: 'HEAD' })
    const imgContentType = imgRes.headers.get('content-type') ?? ''
    return imgRes.ok && imgContentType.startsWith('image/') ? ogImage : null
  }

  return null
}

async function resolveAndUpdatePhoto(coffeeId: string, rawUrl: string) {
  const resolved = await resolveImageUrl(rawUrl)
  if (!resolved) return
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  await supabase.from('coffees').update({ photo_url: resolved }).eq('id', coffeeId)
}

const DAILY_LIMIT = 20

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, PATCH, OPTIONS',
}

const VALID_ROAST_LEVELS = ['light', 'medium-light', 'medium', 'medium-dark', 'dark']
const VALID_PROCESSING = ['washed', 'natural', 'honey', 'anaerobic']
const VALID_BODY = ['light', 'medium', 'full']
const VALID_RATINGS = ['great', 'good', 'neutral', 'meh', 'bad']

function getUserId(req: Request): string | null {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return null

  try {
    const token = authHeader.replace('Bearer ', '')
    // JWTs use base64url — convert to standard base64 before decoding
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))
    return payload.sub ?? null
  } catch {
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const userId = getUserId(req)
  if (!userId) {
    return Response.json({ error: 'unauthorized' }, { status: 401, headers: corsHeaders })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // ── PATCH: save brew log ────────────────────────────────────────────────────
  if (req.method === 'PATCH') {
    const { coffeeId, brewDate, roastDate, grindSetting, rating, tastingNotes, bodyNotes } = await req.json()

    if (!coffeeId) {
      return Response.json({ error: 'missing_coffee_id' }, { status: 400, headers: corsHeaders })
    }
    if (grindSetting == null) {
      return Response.json({ error: 'grind_setting_required' }, { status: 400, headers: corsHeaders })
    }

    const grindNum = parseFloat(grindSetting)
    if (isNaN(grindNum) || grindNum <= 0) {
      return Response.json({ error: 'invalid_grind_setting' }, { status: 400, headers: corsHeaders })
    }
    if (rating && !VALID_RATINGS.includes(rating)) {
      return Response.json({ error: 'invalid_rating' }, { status: 400, headers: corsHeaders })
    }

    const now = new Date().toISOString()
    const { error } = await supabase
      .from('coffees')
      .update({
        brew_date: brewDate || null,
        roast_date: roastDate || null,
        grind_setting: grindNum,
        rating: rating || null,
        tasting_notes: tastingNotes || null,
        body_notes: bodyNotes || null,
        brew_last_updated: now,
      })
      .eq('id', coffeeId)
      .eq('user_id', userId)

    if (error) {
      console.error('brew log save error:', error)
      return Response.json({ error: 'save_failed' }, { status: 500, headers: corsHeaders })
    }

    return Response.json({ brewLastUpdated: now }, { headers: corsHeaders })
  }

  // ── POST: save new coffee ───────────────────────────────────────────────────
  if (req.method === 'POST') {
    const body = await req.json()
    const { bagName, roasterName, roasterLocation, origins, roastLevel, varietal, altitude,
            processingMethod, flavorProfile, bodyCategory, bodyDescription, photoUrl } = body

    if (!bagName?.trim() || !roasterName?.trim()) {
      return Response.json({ error: 'bag_and_roaster_required' }, { status: 400, headers: corsHeaders })
    }
    if (roastLevel && !VALID_ROAST_LEVELS.includes(roastLevel)) {
      return Response.json({ error: 'invalid_roast_level' }, { status: 400, headers: corsHeaders })
    }
    if (processingMethod && !VALID_PROCESSING.includes(processingMethod)) {
      return Response.json({ error: 'invalid_processing_method' }, { status: 400, headers: corsHeaders })
    }
    if (bodyCategory && !VALID_BODY.includes(bodyCategory)) {
      return Response.json({ error: 'invalid_body_category' }, { status: 400, headers: corsHeaders })
    }

    // Check and increment daily limit
    const today = new Date().toISOString().slice(0, 10)
    const { data: countRow } = await supabase
      .from('daily_add_counts')
      .select('count')
      .eq('user_id', userId)
      .eq('day', today)
      .single()

    const currentCount = countRow?.count ?? 0
    if (currentCount >= DAILY_LIMIT) {
      return Response.json({ error: 'daily_limit_reached', limit: DAILY_LIMIT }, { status: 429, headers: corsHeaders })
    }

    await supabase.from('daily_add_counts').upsert(
      { user_id: userId, day: today, count: currentCount + 1 },
      { onConflict: 'user_id,day' }
    )

    const { data, error } = await supabase
      .from('coffees')
      .insert({
        user_id: userId,
        bag_name: bagName.trim(),
        roaster_name: roasterName.trim(),
        roaster_location: roasterLocation || null,
        origins: origins || null,
        roast_level: roastLevel || null,
        varietal: varietal || null,
        altitude: altitude || null,
        processing_method: processingMethod || null,
        flavor_profile: flavorProfile || null,
        body_category: bodyCategory || null,
        body_description: bodyDescription || null,
        photo_url: photoUrl || null,
      })
      .select('id, date_added')
      .single()

    if (error) {
      console.error('coffee insert error:', error)
      return Response.json({ error: 'save_failed' }, { status: 500, headers: corsHeaders })
    }

    // Resolve photo URL in the background — doesn't block the response
    if (photoUrl) {
      EdgeRuntime.waitUntil(resolveAndUpdatePhoto(data.id, photoUrl))
    }

    return Response.json({ id: data.id, dateAdded: data.date_added }, { status: 201, headers: corsHeaders })
  }

  return Response.json({ error: 'method_not_allowed' }, { status: 405, headers: corsHeaders })
})
