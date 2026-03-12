import { supabase } from './supabase'

async function callFunction(name, body, method = 'POST') {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error(`[api] ${name} failed ${res.status}:`, data)
    const errCode = data.error ?? data.code ?? 'request_failed'
    const errMsg = data.message ?? data.msg ?? errCode
    throw Object.assign(new Error(errMsg), { code: errCode, status: res.status })
  }

  return data
}

// Extract bag name and roaster name from a photo
// imageBase64: data URI string e.g. "data:image/jpeg;base64,..."
export function extractOCR(imageBase64) {
  return callFunction('ocr-extract', { imageBase64 })
}

// Look up coffee metadata from Perplexity (or cache)
export function lookupCoffee(bagName, roasterName) {
  return callFunction('lookup-coffee', { bagName, roasterName })
}

// Save a new coffee record. Returns { id, dateAdded }
export function saveCoffee(coffeeData) {
  return callFunction('save-coffee', coffeeData)
}

// Save or update brew log for an existing coffee
export function saveBrewLog(coffeeId, brewData) {
  return callFunction('save-coffee', { coffeeId, ...brewData }, 'PATCH')
}
