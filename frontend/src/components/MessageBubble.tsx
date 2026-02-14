import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bot } from 'lucide-react'
import type { Message } from '../types'

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="bg-accent text-white px-4 py-3 rounded-2xl rounded-br-md max-w-[75%]">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="shrink-0 w-7 h-7 rounded-full bg-bg-tertiary border border-border flex items-center justify-center mt-0.5 text-accent">
        <Bot size={14} />
      </div>
      <div className="min-w-0 flex-1 markdown-content text-[15px] text-text-primary">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
