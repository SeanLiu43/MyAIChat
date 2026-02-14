import { useRef, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import type { Message } from '../types'
import MessageBubble from './MessageBubble'

interface ChatWindowProps {
  messages: Message[]
  loading: boolean
  onSend?: (message: string) => void
}

export default function ChatWindow({ messages, loading, onSend }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
            <div className="w-16 h-16 rounded-2xl bg-bg-tertiary border border-border flex items-center justify-center mb-6">
              <span className="text-3xl">🤖</span>
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              AI Chat Agent
            </h2>
            <p className="text-text-secondary text-sm max-w-md">
              我是你的 AI 助手，支持搜索和数学计算。试试问我一些问题吧！
            </p>
            <div className="flex gap-2 mt-6 flex-wrap justify-center">
              <SuggestionChip text="帮我算 123 * 456" onClick={onSend} />
              <SuggestionChip text="搜索最新的 AI 新闻" onClick={onSend} />
              <SuggestionChip text="你好，介绍一下你自己" onClick={onSend} />
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="shrink-0 w-8 h-8 rounded-full bg-bg-tertiary border border-border flex items-center justify-center">
              <Loader2 size={16} className="text-accent animate-spin" />
            </div>
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <span className="typing-cursor">思考中</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function SuggestionChip({ text, onClick }: { text: string; onClick?: (msg: string) => void }) {
  return (
    <button
      onClick={() => onClick?.(text)}
      className="px-3 py-1.5 text-xs text-text-secondary border border-border rounded-full hover:border-accent hover:text-accent transition-colors cursor-pointer"
    >
      {text}
    </button>
  )
}
