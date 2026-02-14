import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bot, User } from 'lucide-react'
import type { Message } from '../types'
import ToolCallCard from './ToolCallCard'

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? 'justify-end' : ''}`}>
      {/* AI Avatar */}
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-bg-tertiary border border-border flex items-center justify-center mt-1">
          <Bot size={16} className="text-accent" />
        </div>
      )}

      <div className={`max-w-[720px] ${isUser ? 'max-w-[560px]' : ''}`}>
        {/* Tool calls (before AI reply) */}
        {!isUser && message.tool_calls && message.tool_calls.length > 0 && (
          <div className="space-y-2 mb-3">
            {message.tool_calls.map((tc, i) => (
              <ToolCallCard key={i} tool={tc} />
            ))}
          </div>
        )}

        {/* Message content */}
        <div
          className={
            isUser
              ? 'bg-user-bubble text-white px-4 py-3 rounded-2xl rounded-br-md'
              : 'text-text-primary'
          }
        >
          {isUser ? (
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="markdown-content text-[15px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className={`mt-1 text-xs text-text-muted ${isUser ? 'text-right' : ''}`}>
          {message.timestamp.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center mt-1">
          <User size={16} className="text-white" />
        </div>
      )}
    </div>
  )
}
