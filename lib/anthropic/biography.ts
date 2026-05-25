import { groq } from './client'
import { MOTE_SYSTEM_PROMPT, buildUserMessage, isValidBiographyJSON } from './prompts'
import type { BiographyJSON } from '@/types/database'

interface GenerateParams {
  brand: string
  productName: string
  model?: string | null
  yearPurchased?: number | null
  failureDescription: string
  personalMemory?: string | null
}

export interface StreamChunk {
  type: 'delta' | 'done' | 'error'
  text?: string
  biography?: BiographyJSON
  error?: string
}

export async function* generateBiography(
  params: GenerateParams
): AsyncGenerator<string> {
  const userMessage = buildUserMessage(params)
  let fullText = ''

  try {
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: MOTE_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      stream: true,
      response_format: { type: 'json_object' },
    })

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? ''
      if (text) {
        fullText += text
        yield encodeSSE({ type: 'delta', text })
      }
    }

    const parsed = parseJSON(fullText)

    if (!parsed || !isValidBiographyJSON(parsed)) {
      console.error('[Object Biography] Invalid output. Raw text (first 500 chars):', fullText.slice(0, 500))
      yield encodeSSE({ type: 'error', error: 'Biography generation produced invalid output.' })
      return
    }

    parsed.generated_at = new Date().toISOString()
    yield encodeSSE({ type: 'done', biography: parsed })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    yield encodeSSE({ type: 'error', error: message })
  }
}

function parseJSON(raw: string): unknown {
  const trimmed = raw.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    const fenced = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    try {
      return JSON.parse(fenced)
    } catch {
      const start = trimmed.indexOf('{')
      const end = trimmed.lastIndexOf('}')
      if (start !== -1 && end !== -1 && end > start) {
        try {
          return JSON.parse(trimmed.slice(start, end + 1))
        } catch {
          return null
        }
      }
      return null
    }
  }
}

function encodeSSE(chunk: StreamChunk): string {
  return `data: ${JSON.stringify(chunk)}\n\n`
}
