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

const QUALITY_FIELDS = [
  'roasterLocation', 'origins', 'roastLevel', 'processingMethod',
  'flavorProfile', 'varietal', 'altitude', 'bodyCategory', 'bodyDescription', 'photoUrl',
]

const RETAIL_SITES = [
  'drinktrade.com',
  'wholelattelove.com',
  'mistobox.com',
  'coffeereview.com',
  'beanbox.com',
]

type CoffeeFields = Record<string, string | null>

function emptyFields(): CoffeeFields {
  return {
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
}

function normalizeResult(raw: Record<string, unknown>): CoffeeFields {
  const result = emptyFields()

  for (const [key, value] of Object.entries(raw)) {
    if (key in result && typeof value === 'string' && value.trim()) {
      result[key] = value.trim()
    }
  }

  if (result.roastLevel) {
    // Strip "roast" and non-alpha chars, then match any standard level word(s) — handles
    // marketing names like "Medium & Cozy", "Light & Bright", "Dark & Bold"
    const s = result.roastLevel.toLowerCase().replace(/\broast\b/g, ' ').replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim()
    // Check most-specific levels first so "medium-dark" isn't swallowed by "medium"
    const orderedLevels = ['medium-dark', 'medium-light', 'medium', 'light', 'dark']
    result.roastLevel = orderedLevels.find(r => r.split('-').every(word => s.split(' ').includes(word))) ?? null
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

function fieldCount(result: CoffeeFields): number {
  return QUALITY_FIELDS.filter(f => result[f] !== null).length
}

function hasNullFields(result: CoffeeFields): boolean {
  return QUALITY_FIELDS.some(f => result[f] === null)
}

// Merge field-level: first non-null value wins; photoUrl only taken from non-Phase-3 sources
function mergeFields(base: CoffeeFields, additions: CoffeeFields, allowPhoto = true): CoffeeFields {
  const merged = { ...base }
  for (const field of QUALITY_FIELDS) {
    if (merged[field] === null && additions[field] !== null) {
      if (field === 'photoUrl' && !allowPhoto) continue
      merged[field] = additions[field]
    }
  }
  return merged
}

function parseJson(text: string): Record<string, unknown> {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/)
  const jsonStr = jsonMatch?.[1] ?? text
  return JSON.parse(jsonStr.trim())
}

const EXTRACTION_PROMPT = (bagName: string, roasterName: string) =>
  `Extract coffee metadata for "${bagName}" by "${roasterName}". Return a JSON object with these fields (use null if unknown):
- roasterLocation: city/country of the roaster
- origins: coffee origin country/region; may be in the product name itself (e.g. "Peru Persy Pusma Martinez" → "Peru"); may appear as a JSON array — convert to comma-separated string
- roastLevel: one of exactly: light, medium-light, medium, medium-dark, dark; may appear as "Light Roast", "Medium Roast", etc. or as marketing phrases like "Medium & Cozy", "Light & Bright", "Dark & Bold" — extract only the standard level word(s)
- varietal: coffee varietal/cultivar as a comma-separated string; may appear in a JSON-LD additionalProperty with name "varietal" — convert array values to comma-separated string
- altitude: growing altitude — look for fields labelled "altitude" OR "elevation" (e.g. "1700-2200m", "1800 masl")
- processingMethod: one of exactly: washed, natural, honey, anaerobic; may appear in a JSON-LD additionalProperty with name "process" — use the first array value
- flavorProfile: comma-separated tasting notes; may appear in a JSON-LD additionalProperty with name "tastes" — convert array to comma-separated string
- bodyCategory: one of light, medium, full
- bodyDescription: brief description of the body/mouthfeel
- photoUrl: URL to a product image for this specific coffee

Respond with only the JSON object, no other text.`

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

// Extract visible text from HTML (strips tags, decodes entities, collapses whitespace)
function extractText(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  ).slice(0, 8000)
}

// Extract name/property + content pairs from <meta> tags
function extractMetaTags(html: string): string {
  const lines: string[] = []
  for (const match of html.matchAll(/<meta[^>]+>/gi)) {
    const tag = match[0]
    const nameMatch = tag.match(/(?:name|property)=["']([^"']+)["']/i)
    const contentMatch = tag.match(/content=["']([^"']+)["']/i)
    if (nameMatch && contentMatch) {
      lines.push(`${nameMatch[1]}: ${contentMatch[1]}`)
    }
  }
  return lines.join('\n')
}

// Parse JSON-LD from HTML — returns all parseable blocks joined together
function extractJsonLd(html: string): string {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  const parsed: string[] = []
  for (const block of blocks) {
    const fixed = block[1]
      .replace(/&quot;/g, '\\"')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
    try {
      parsed.push(JSON.stringify(JSON.parse(fixed)))
    } catch {
      continue
    }
  }
  return parsed.join('\n')
}

async function fetchPageContent(url: string): Promise<string> {
  const [htmlRes, shopifyData] = await Promise.all([
    fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BeanScan/1.0)' },
      signal: AbortSignal.timeout(8000),
    }),
    // For Shopify URLs, fetch .json endpoint in parallel for richer structured data
    url.includes('/products/')
      ? fetch(url.replace(/\?.*$/, '') + '.json', {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BeanScan/1.0)' },
          signal: AbortSignal.timeout(5000),
        })
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (!d?.product) return null
          const p = d.product
          const tags = Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags ?? '')
          return {
            imageUrl: p.images?.[0]?.src ?? '',
            tags,
            bodyHtml: p.body_html ?? '',
          }
        })
        .catch(() => null)
      : Promise.resolve(null),
  ])

  if (!htmlRes.ok) throw new Error(`HTTP ${htmlRes.status}`)
  const html = await htmlRes.text()

  const jsonLd = extractJsonLd(html)
  const metaTags = extractMetaTags(html)
  const htmlText = extractText(html)

  const parts: string[] = []
  if (shopifyData?.imageUrl) parts.push(`Image: ${shopifyData.imageUrl}`)
  if (shopifyData?.tags) parts.push(`Tags: ${shopifyData.tags}`)
  if (shopifyData?.bodyHtml) parts.push(`Product description: ${extractText(shopifyData.bodyHtml)}`)
  if (jsonLd.length > 100) parts.push(jsonLd.slice(0, 4000))
  if (metaTags) parts.push(metaTags.slice(0, 1000))
  parts.push(htmlText)

  return parts.join('\n\n')
}

async function extractFieldsFromContent(
  client: Anthropic,
  bagName: string,
  roasterName: string,
  content: string,
): Promise<CoffeeFields> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `${EXTRACTION_PROMPT(bagName, roasterName)}\n\nPage content:\n${content}`,
    }],
  })
  const textBlock = message.content.find(b => b.type === 'text')
  const raw = textBlock?.text.trim() ?? '{}'
  return normalizeResult(parseJson(raw))
}

async function braveSearch(query: string): Promise<Array<{ url: string; title: string }>> {
  const res = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
    {
      headers: { 'Accept': 'application/json', 'X-Subscription-Token': BRAVE_API_KEY },
      signal: AbortSignal.timeout(8000),
    },
  )
  if (!res.ok) throw new Error(`Brave search failed: ${res.status}`)
  const data = await res.json()
  return data.web?.results ?? []
}

// Returns roaster's own domain heuristic: domain contains a word from roasterName
function isRoasterDomain(url: string, roasterName: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    const words = roasterName.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    return words.some(w => hostname.includes(w))
  } catch {
    return false
  }
}

// Generic descriptors that appear in many coffee URLs and are not identifying
const GENERIC_COFFEE_WORDS = new Set(['organic', 'coffee', 'blend', 'roast', 'roasted', 'light', 'medium', 'dark', 'espresso', 'decaf', 'single'])

// Score a URL by how many identifying bag name words appear in its path
// Filters out generic descriptors that match too many unrelated coffees
function urlBagNameScore(url: string, bagName: string): number {
  try {
    const path = new URL(url).pathname.toLowerCase()
    const words = bagName.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !GENERIC_COFFEE_WORDS.has(w))
    return words.filter(w => path.includes(w)).length
  } catch {
    return 0
  }
}

// Strips punctuation and extra words for a looser fallback search
function simplifyBagName(bagName: string): string {
  return bagName.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

// Defensive sanitization of roaster/bag names before use in searches
// Handles anything the OCR prompt didn't already clean up
function sanitizeName(name: string): string {
  return name
    .replace(/[™®©]/g, '')               // trademark/copyright symbols
    .replace(/\s*\(.*?\)\s*/g, ' ')       // parentheticals
    .replace(/\s*\[.*?\]\s*/g, ' ')       // brackets
    .replace(/\b(LLC|Co\.|Inc\.|Ltd\.|Corp\.?)\b/gi, '') // legal suffixes
    .replace(/[^\w\s'-]/g, ' ')           // non-word chars except apostrophe/hyphen
    .replace(/\s+/g, ' ')
    .trim()
}

// Construct a Shopify-style product URL from the bag name slug
function shopifyProductUrl(domain: string, bagName: string): string {
  const slug = bagName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
  return `https://${domain}/products/${slug}`
}

// Phase 1: roaster's own website — only used for roasterLocation
async function phase1(
  client: Anthropic,
  bagName: string,
  roasterName: string,
): Promise<CoffeeFields> {
  // Try progressively looser searches, picking the roaster-domain URL with the best bag name match
  const simplified = simplifyBagName(bagName)
  const searches = [
    `"${bagName}" "${roasterName}" coffee`,
    `${simplified} "${roasterName}" coffee`,
    `${simplified} ${roasterName} coffee`,
  ]
  let roasterResult: { url: string; title: string } | undefined
  for (const query of searches) {
    const results = await braveSearch(query)
    const roasterResults = results.filter(r => isRoasterDomain(r.url, roasterName))
    if (roasterResults.length > 0) {
      roasterResult = roasterResults.sort((a, b) => urlBagNameScore(b.url, bagName) - urlBagNameScore(a.url, bagName))[0]
      break
    }
    const best = results.sort((a, b) => urlBagNameScore(b.url, bagName) - urlBagNameScore(a.url, bagName))[0]
    if (best) { roasterResult = best; break }
  }

  if (!roasterResult) return emptyFields()

  const content = await fetchPageContent(roasterResult.url)
  if (content.length < 50) return emptyFields()

  return await extractFieldsFromContent(client, bagName, roasterName, content)
}

// Phase 2: retail/aggregator sites in fixed order, filling nulls only
async function phase2(
  client: Anthropic,
  bagName: string,
  roasterName: string,
  accumulated: CoffeeFields,
): Promise<CoffeeFields> {
  let result = { ...accumulated }

  for (const domain of RETAIL_SITES) {
    if (!hasNullFields(result)) break

    try {
      // Try direct Shopify URL first (fast, no API call)
      let urlToFetch: string | null = null
      const directUrl = shopifyProductUrl(domain, bagName)
      try {
        const probe = await fetch(directUrl, {
          method: 'HEAD',
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BeanScan/1.0)' },
          signal: AbortSignal.timeout(4000),
        })
        if (probe.ok) urlToFetch = directUrl
      } catch { /* fall through to search */ }

      // Fall back to Brave search if direct URL didn't work
      if (!urlToFetch) {
        const simplified = simplifyBagName(bagName)
        const firstWord = roasterName.split(/\s+/)[0]
        const roasterSlug = roasterName.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-')
        const bagSlug = simplified.toLowerCase().replace(/\s+/g, '-')
        const combinedSlug = `${roasterSlug}-${bagSlug}`
        const searches = [
          `site:${domain} "${bagName}" "${roasterName}"`,
          `site:${domain} "${bagName}" "${firstWord}"`,
          `site:${domain} ${simplified} "${firstWord}"`,
          `"${combinedSlug}" site:${domain}`,
          `"${combinedSlug}" ${domain}`,
          `site:${domain} ${simplified}`,
        ]
        for (const query of searches) {
          const results = await braveSearch(query)
          if (results.length > 0) {
            const scored = results
              .map(r => ({ ...r, score: urlBagNameScore(r.url, bagName) }))
              .sort((a, b) => b.score - a.score)
            const best = scored[0]
            // Require score >= 2 to avoid fetching wrong-coffee pages that share
            // only generic words (e.g. "organic", "peru") with the bag name
            if (best.score >= 2) { urlToFetch = best.url; break }
          }
        }
      }

      if (!urlToFetch) continue
      const content = await fetchPageContent(urlToFetch)
      if (content.length < 50) continue

      const extracted = await extractFieldsFromContent(client, bagName, roasterName, content)
      result = mergeFields(result, extracted)
    } catch {
      continue
    }
  }

  return result
}

function applyInferred(
  base: CoffeeFields,
  extracted: CoffeeFields,
  inferredFields: string[],
): CoffeeFields {
  const merged = { ...base }
  for (const field of QUALITY_FIELDS) {
    if (field === 'photoUrl') continue // Phase 3 never provides photoUrl
    if (merged[field] === null && extracted[field] !== null) {
      merged[field] = extracted[field]
      inferredFields.push(field)
    }
  }
  return merged
}

// Phase 3: quick synthesis from training knowledge, then agentic loop for remaining gaps
async function phase3(
  client: Anthropic,
  bagName: string,
  roasterName: string,
  accumulated: CoffeeFields,
): Promise<{ result: CoffeeFields; inferredFields: string[] }> {
  const inferredFields: string[] = []
  let result = { ...accumulated }

  // Step 1: Quick synthesis from training knowledge (no tools)
  const quickResponse = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `You are a coffee expert with deep knowledge of roasters and their coffees. ${EXTRACTION_PROMPT(bagName, roasterName)}\n\nUse your training knowledge to fill in as many fields as you can. Only return null for fields you genuinely have no knowledge of. Do not hold back on well-known coffees or roasters.\n\nIMPORTANT: For roasterLocation, only provide a value if you are certain — do not guess. It is better to return null than a wrong city.`,
    }],
  })
  const quickText = quickResponse.content.find(b => b.type === 'text')?.text.trim() ?? '{}'
  try {
    const quickExtracted = normalizeResult(parseJson(quickText))
    result = applyInferred(result, quickExtracted, inferredFields)
  } catch {
    // quick synthesis parse failed — continue to agentic loop
  }

  if (!hasNullFields(result)) return { result, inferredFields }

  // If quick synthesis found anything, return now — don't risk losing it to an agentic loop timeout
  if (inferredFields.length > 0) return { result, inferredFields }

  // Step 2: Agentic loop for remaining gaps (max 4 tool iterations, max 2 Claude calls)
  const nullFields = QUALITY_FIELDS.filter(f => result[f] === null)
  const contextSoFar: Anthropic.Messages.MessageParam[] = []

  const tools: Anthropic.Messages.Tool[] = [
    {
      name: 'brave_search',
      description: 'Search the web for information about a coffee',
      input_schema: {
        type: 'object' as const,
        properties: { query: { type: 'string', description: 'Search query' } },
        required: ['query'],
      },
    },
    {
      name: 'fetch_page',
      description: 'Fetch the content of a web page',
      input_schema: {
        type: 'object' as const,
        properties: { url: { type: 'string', description: 'URL to fetch' } },
        required: ['url'],
      },
    },
  ]

  contextSoFar.push({
    role: 'user',
    content: `You are a coffee research agent. Find information about "${bagName}" by "${roasterName}". Fields still missing: ${nullFields.join(', ')}. Already found: ${JSON.stringify(result)}. Use brave_search and fetch_page to find the missing fields.`,
  })

  let toolIterations = 0
  let claudeCalls = 0
  const MAX_TOOL_ITERATIONS = 4
  const MAX_CLAUDE_CALLS = 2

  while (claudeCalls < MAX_CLAUDE_CALLS) {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools,
      messages: contextSoFar,
    })
    claudeCalls++

    contextSoFar.push({ role: 'assistant', content: response.content })

    if (response.stop_reason === 'end_turn' || toolIterations >= MAX_TOOL_ITERATIONS) break

    const toolUses = response.content.filter(b => b.type === 'tool_use')
    if (toolUses.length === 0) break

    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = []

    for (const toolUse of toolUses) {
      if (toolIterations >= MAX_TOOL_ITERATIONS) break
      toolIterations++

      if (toolUse.type !== 'tool_use') continue
      const input = toolUse.input as Record<string, string>

      let toolOutput = ''
      try {
        if (toolUse.name === 'brave_search') {
          const searchResults = await braveSearch(input.query)
          toolOutput = searchResults.map(r => `${r.title}: ${r.url}`).join('\n')
        } else if (toolUse.name === 'fetch_page') {
          toolOutput = await fetchPageContent(input.url)
        }
      } catch (err) {
        toolOutput = `Error: ${err instanceof Error ? err.message : 'unknown'}`
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: toolOutput.slice(0, 4000),
      })
    }

    contextSoFar.push({ role: 'user', content: toolResults })
  }

  // Step 3: Final synthesis — incorporate everything gathered from the agentic loop
  const synthesisMessages: Anthropic.Messages.MessageParam[] = [
    ...contextSoFar,
    {
      role: 'user',
      content: `Based on everything gathered above, extract all fields you can. ${EXTRACTION_PROMPT(bagName, roasterName)}\n\nAlready found (do not change these): ${JSON.stringify(result)}`,
    },
  ]

  const synthesisResponse = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: synthesisMessages,
  })

  const textBlock = synthesisResponse.content.find(b => b.type === 'text')
  const raw = textBlock?.text.trim() ?? '{}'
  try {
    const finalExtracted = normalizeResult(parseJson(raw))
    result = applyInferred(result, finalExtracted, inferredFields)
  } catch {
    // final synthesis parse failed — return what we have
  }

  return { result, inferredFields }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const raw = await req.json()
    const bagName = sanitizeName(raw.bagName ?? '')
    const roasterName = sanitizeName(raw.roasterName ?? '')

    if (!bagName || !roasterName) {
      return Response.json({ error: 'missing_fields' }, { status: 400, headers: corsHeaders })
    }

    const cacheKey = `${roasterName.toLowerCase()}|${bagName.toLowerCase()}`
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Cache check
    const cutoff = new Date(Date.now() - CACHE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const { data: cached } = await supabase
      .from('lookup_cache')
      .select('result')
      .eq('cache_key', cacheKey)
      .gte('cached_at', cutoff)
      .single()

    if (cached) {
      return Response.json({ source: 'cache', inferredFields: [], ...cached.result }, { headers: corsHeaders })
    }

    const client = new Anthropic({ apiKey: CLAUDE_API_KEY })

    // Phase 1: roaster direct site
    let result = emptyFields()
    let inferredFields: string[] = []
    let source = 'manual'

    try {
      result = await phase1(client, bagName, roasterName)
    } catch {
      // Phase 1 failed — continue to Phase 2
    }

    if (!hasNullFields(result)) {
      source = 'roaster'
    } else {
      // Phase 2: retail sites
      try {
        result = await phase2(client, bagName, roasterName, result)
      } catch {
        // Phase 2 failed — continue to Phase 3
      }

      if (!hasNullFields(result)) {
        source = 'retail'
      } else {
        // Phase 3: training knowledge + agentic loop for remaining gaps
        try {
          const phase3Timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Phase 3 timeout')), 25000)
          )
          const phase3Run = phase3(client, bagName, roasterName, result)
          const phase3Result = await Promise.race([phase3Run, phase3Timeout])
          result = phase3Result.result
          inferredFields = phase3Result.inferredFields
        } catch {
          // Phase 3 failed or timed out — use what we have
        }

        source = hasNullFields(result)
          ? (fieldCount(result) === 0 ? 'manual' : 'partial')
          : 'agent'
      }
    }

    if (source === 'manual') {
      return Response.json({ source: 'manual', inferredFields: [] }, { headers: corsHeaders })
    }

    const cachePayload = { ...result, inferredFields }
    await supabase
      .from('lookup_cache')
      .upsert({ cache_key: cacheKey, result: cachePayload, cached_at: new Date().toISOString() })

    return Response.json({ source, inferredFields, ...result }, { headers: corsHeaders })
  } catch (err) {
    console.error('lookup-coffee error:', err)
    return Response.json({ error: 'lookup_failed', source: 'manual', inferredFields: [] }, { status: 500, headers: corsHeaders })
  }
})
