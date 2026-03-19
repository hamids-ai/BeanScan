import { createClient } from 'npm:@supabase/supabase-js'
import Anthropic from 'npm:@anthropic-ai/sdk'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY')!
const BRAVE_API_KEY = Deno.env.get('BRAVE_API_KEY')!

const CACHE_TTL_DAYS = 90

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

const ROAST_LEVELS = ['light', 'medium-light', 'medium', 'medium-dark', 'dark']
const PROCESSING_METHODS = ['washed', 'natural', 'honey', 'anaerobic']
const BODY_CATEGORIES = ['light', 'medium', 'full']

// All fields tracked for quality comparison (excludes altitude — rarely available anywhere)
const QUALITY_FIELDS = ['roasterLocation', 'origins', 'roastLevel', 'processingMethod', 'flavorProfile', 'varietal', 'bodyCategory', 'bodyDescription', 'photoUrl']

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

function fieldCount(result: Record<string, string | null>): number {
  return QUALITY_FIELDS.filter(f => result[f] !== null).length
}

function parseJson(text: string): Record<string, unknown> {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/)
  const jsonStr = jsonMatch?.[1] ?? text
  return JSON.parse(jsonStr.trim())
}

const EXTRACTION_PROMPT = (bagName: string, roasterName: string) => `Extract coffee metadata for "${bagName}" by "${roasterName}". Return a JSON object with these fields (use null if unknown):
- roasterLocation: city/country of the roaster
- origins: coffee origin country/region
- roastLevel: one of light, medium-light, medium, medium-dark, dark
- varietal: coffee varietal/cultivar
- altitude: growing altitude
- processingMethod: one of washed, natural, honey, anaerobic
- flavorProfile: comma-separated tasting notes
- bodyCategory: one of light, medium, full
- bodyDescription: brief description of the body/mouthfeel
- photoUrl: URL to a product image for this specific coffee

Respond with only the JSON object, no other text.`

// Option A: Brave Search + Shopify JSON API + Claude extraction
// Returns the best result found across all pages (never throws for incompleteness)
async function queryWithBrave(bagName: string, roasterName: string): Promise<Record<string, string | null>> {
  const query = encodeURIComponent(`${bagName} ${roasterName} coffee`)
  const braveRes = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${query}&count=5`, {
    headers: {
      'Accept': 'application/json',
      'X-Subscription-Token': BRAVE_API_KEY,
    },
  })

  if (!braveRes.ok) {
    const body = await braveRes.text()
    throw new Error(`Brave search failed: ${braveRes.status} — ${body}`)
  }

  const braveData = await braveRes.json()
  const results: Array<{ url: string; title: string; description: string }> =
    braveData.web?.results ?? []

  if (results.length === 0) throw new Error('No search results from Brave')

  const client = new Anthropic({ apiKey: CLAUDE_API_KEY })
  let bestResult: Record<string, string | null> | null = null
  let bestCount = 0

  for (const result of results.slice(0, 5)) {
    try {
      const shopifyUrl = result.url.replace(/\?.*$/, '') + '.json'
      const shopifyRes = await fetch(shopifyUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BeanScan/1.0)' },
      })

      if (!shopifyRes.ok) continue

      const shopifyData = await shopifyRes.json()
      if (!shopifyData.product) continue

      const p = shopifyData.product
      const description = p.body_html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? ''
      const tags = Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags ?? '')
      const imageUrl = p.images?.[0]?.src ?? ''
      const content = [
        `Title: ${p.title}`,
        `Vendor: ${p.vendor}`,
        `Description: ${description}`,
        `Tags: ${tags}`,
        imageUrl ? `Image: ${imageUrl}` : '',
      ].filter(Boolean).join('\n')

      if (content.length < 50) continue

      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: `${EXTRACTION_PROMPT(bagName, roasterName)}\n\nProduct page data:\n${content}`,
          },
        ],
      })

      const textBlock = message.content.find(b => b.type === 'text')
      const raw = textBlock?.text.trim() ?? ''
      const normalized = normalizeResult(parseJson(raw))
      const count = fieldCount(normalized)

      if (count > bestCount) {
        bestResult = normalized
        bestCount = count
      }

      // Good enough — stop trying more pages
      if (bestCount >= 5) break
    } catch {
      continue
    }
  }

  if (!bestResult) throw new Error('No usable Shopify product pages found')
  return bestResult
}

// Option B: Claude text prompt from training knowledge
async function queryClaudeFromMemory(bagName: string, roasterName: string): Promise<Record<string, string | null>> {
  const client = new Anthropic({ apiKey: CLAUDE_API_KEY })

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `You are a coffee expert. ${EXTRACTION_PROMPT(bagName, roasterName)}`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
  return normalizeResult(parseJson(raw))
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

    // Run both options and pick the one with more fields populated
    const [braveSettled, claudeSettled] = await Promise.allSettled([
      queryWithBrave(bagName, roasterName),
      queryClaudeFromMemory(bagName, roasterName),
    ])

    const braveResult = braveSettled.status === 'fulfilled' ? braveSettled.value : null
    const claudeResult = claudeSettled.status === 'fulfilled' ? claudeSettled.value : null

    if (!braveResult && !claudeResult) {
      return Response.json({ source: 'manual' }, { headers: corsHeaders })
    }

    const braveCount = braveResult ? fieldCount(braveResult) : -1
    const claudeCount = claudeResult ? fieldCount(claudeResult) : -1

    const result = braveCount >= claudeCount ? braveResult! : claudeResult!
    const source = braveCount >= claudeCount ? 'brave' : 'claude'

    // Store in cache
    await supabase.from('lookup_cache').upsert({ cache_key: cacheKey, result, cached_at: new Date().toISOString() })

    return Response.json({ source, ...result }, { headers: corsHeaders })
  } catch (err) {
    console.error('lookup-coffee error:', err)
    return Response.json({ error: 'lookup_failed', source: 'manual' }, { status: 500, headers: corsHeaders })
  }
})
