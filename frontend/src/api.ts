const API_BASE = '/api'

interface StreamCallbacks {
  onSession: (sessionId: string) => void
  onDelta: (content: string) => void
  onDone: () => void
  onError: (error: Error) => void
}

export async function streamMessage(
  message: string,
  sessionId: string | null,
  callbacks: StreamCallbacks,
): Promise<void> {
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

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // Parse SSE events from buffer
    const parts = buffer.split('\n\n')
    // Keep the last incomplete part in the buffer
    buffer = parts.pop() || ''

    for (const part of parts) {
      if (!part.trim()) continue

      let event = ''
      let data = ''

      for (const line of part.split('\n')) {
        if (line.startsWith('event: ')) {
          event = line.slice(7)
        } else if (line.startsWith('data: ')) {
          data = line.slice(6)
        }
      }

      if (!event || !data) continue

      try {
        const parsed = JSON.parse(data)

        switch (event) {
          case 'session':
            callbacks.onSession(parsed.session_id)
            break
          case 'delta':
            callbacks.onDelta(parsed.content)
            break
          case 'done':
            callbacks.onDone()
            break
        }
      } catch {
        // skip malformed events
      }
    }
  }
}
