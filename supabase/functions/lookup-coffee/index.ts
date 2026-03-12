import { createClient } from 'npm:@supabase/supabase-js'
import Anthropic from 'npm:@anthropic-ai/sdk'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY')!

const CACHE_TTL_DAYS = 90

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

const ROAST_LEVELS = ['light', 'medium-light', 'medium', 'medium-dark', 'dark']
const PROCESSING_METHODS = ['washed', 'natural', 'honey', 'anaerobic']
const BODY_CATEGORIES = ['light', 'medium', 'full']

function normalizeResult(raw: Record<string, unknown>) {
  const result: Record<string, string | null> = {
    roasterLocation: null,
    origins: null,
    roastLevel: null,
    varietal: null,
    altitude: null,
    processingMethod: null,
    flavorProfile: null,
    bodyCategory: null,
    bodyDescription: null,
    photoUrl: null,
  }

  for (const [key, value] of Object.entries(raw)) {
    if (key in result && typeof value === 'string' && value.trim()) {
      result[key] = value.trim()
    }
  }

  if (result.roastLevel) {
    const lower = result.roastLevel.toLowerCase().replace(/\s+/g, '-')
    result.roastLevel = ROAST_LEVELS.find(r => lower.includes(r.replace('-', ''))) ?? null
  }
  if (result.processingMethod) {
    const lower = result.processingMethod.toLowerCase()
    result.processingMethod = PROCESSING_METHODS.find(m => lower.includes(m)) ?? null
  }
  if (result.bodyCategory) {
    const lower = result.bodyCategory.toLowerCase()
    result.bodyCategory = BODY_CATEGORIES.find(b => lower.includes(b)) ?? null
  }

  return result
}

async function queryClaude(bagName: string, roasterName: string) {
  const client = new Anthropic({ apiKey: CLAUDE_API_KEY })

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `You are a coffee expert. Given the coffee "${bagName}" by "${roasterName}", return a JSON object with these fields (use null for unknown values):
- roasterLocation: city/country of the roaster
- origins: coffee origin country/region
- roastLevel: one of light, medium-light, medium, medium-dark, dark
- varietal: coffee varietal/cultivar
- altitude: growing altitude
- processingMethod: one of washed, natural, honey, anaerobic
- flavorProfile: comma-separated tasting notes
- bodyCategory: one of light, medium, full
- bodyDescription: brief description of the body/mouthfeel
- photoUrl: null

Respond with only the JSON object, no other text.`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) ?? raw.match(/(\{[\s\S]*\})/)
  const jsonStr = jsonMatch?.[1] ?? raw
  return JSON.parse(jsonStr.trim())
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { bagName, roasterName } = await req.json()

    if (!bagName || !roasterName) {
      return Response.json({ error: 'missing_fields' }, { status: 400, headers: corsHeaders })
    }

    const cacheKey = `${roasterName.toLowerCase()}|${bagName.toLowerCase()}`
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Check cache
    const cutoff = new Date(Date.now() - CACHE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const { data: cached } = await supabase
      .from('lookup_cache')
      .select('result')
      .eq('cache_key', cacheKey)
      .gte('cached_at', cutoff)
      .single()

    if (cached) {
      return Response.json({ source: 'cache', ...cached.result }, { headers: corsHeaders })
    }

    // Call Claude
    let rawResult: Record<string, unknown>

    try {
      rawResult = await queryClaude(bagName, roasterName)
    } catch (err) {
      console.error('Claude lookup failed:', err)
      return Response.json({ source: 'manual' }, { headers: corsHeaders })
    }

    const result = normalizeResult(rawResult)

    // Store in cache
    await supabase.from('lookup_cache').upsert({ cache_key: cacheKey, result, cached_at: new Date().toISOString() })

    return Response.json({ source: 'claude', ...result }, { headers: corsHeaders })
  } catch (err) {
    console.error('lookup-coffee error:', err)
    return Response.json({ error: 'lookup_failed', source: 'manual' }, { status: 500, headers: corsHeaders })
  }
})
