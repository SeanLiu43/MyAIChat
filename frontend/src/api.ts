import type { ChatResponse } from './types'

const API_BASE = '/api'

export async function sendMessage(
  message: string,
  sessionId: string | null,
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      session_id: sessionId,
    }),
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  return res.json()
}
