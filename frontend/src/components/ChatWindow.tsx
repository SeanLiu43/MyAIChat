import { useRef, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import type { Message } from '../types'
import MessageBubble from './MessageBubble'

interface ChatWindowProps {
  messages: Message[]
  loading: boolean
}

export default function ChatWindow({ messages, loading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {loading && messages.at(-1)?.content === '' && (
          <div className="flex gap-3 animate-fade-in">
            <div className="shrink-0 w-7 h-7 rounded-full bg-bg-tertiary border border-border flex items-center justify-center">
              <Loader2 size={14} className="text-accent animate-spin" />
            </div>
            <div className="flex items-center text-text-secondary text-sm">
              <span className="typing-cursor">思考中</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
