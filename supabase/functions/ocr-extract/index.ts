import Anthropic from 'npm:@anthropic-ai/sdk'

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY')
const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageBase64 } = await req.json()

    if (!imageBase64) {
      return Response.json({ error: 'missing_image' }, { status: 400, headers: corsHeaders })
    }

    // Strip the data URI prefix if present and get the raw base64
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const byteLength = Math.ceil(base64Data.length * 0.75)

    if (byteLength > MAX_IMAGE_BYTES) {
      return Response.json({ error: 'image_too_large' }, { status: 400, headers: corsHeaders })
    }

    // Determine media type from data URI or default to jpeg
    const mediaTypeMatch = imageBase64.match(/^data:(image\/\w+);base64,/)
    const mediaType = (mediaTypeMatch?.[1] ?? 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

    const client = new Anthropic({ apiKey: CLAUDE_API_KEY })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64Data },
            },
            {
              type: 'text',
              text: `Look at this coffee bag image. Extract only the coffee product name and the roaster/company name.
Return a JSON object with exactly two keys:
- "bagName": the name of the coffee (e.g. "Ethiopia Yirgacheffe", "Midnight Blend")
- "roasterName": the name of the roaster or coffee company (e.g. "Blue Bottle Coffee", "Stumptown")

If you cannot clearly read one of these values, set it to null.
Respond with only the JSON object, no other text.`,
            },
          ],
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) ?? raw.match(/(\{[\s\S]*\})/)
    const jsonStr = jsonMatch?.[1] ?? raw
    const parsed = JSON.parse(jsonStr.trim())

    return Response.json(
      { bagName: parsed.bagName ?? null, roasterName: parsed.roasterName ?? null },
      { headers: corsHeaders }
    )
  } catch (err) {
    console.error('ocr-extract error:', err)
    return Response.json({ error: 'ocr_failed', bagName: null, roasterName: null }, { status: 500, headers: corsHeaders })
  }
})
