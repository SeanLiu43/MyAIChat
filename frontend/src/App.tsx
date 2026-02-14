import { useState, useCallback } from 'react'
import { MessageSquare, Plus } from 'lucide-react'
import type { Message } from './types'
import { sendMessage } from './api'
import ChatWindow from './components/ChatWindow'
import InputBar from './components/InputBar'

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const handleSend = useCallback(
    async (content: string) => {
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg])
      setLoading(true)

      try {
        const res = await sendMessage(content, sessionId)
        setSessionId(res.session_id)

        const aiMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: res.reply,
          tool_calls: res.tool_calls,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, aiMsg])
      } catch {
        const errMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '抱歉，请求出错了。请检查后端服务是否正常运行。',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errMsg])
      } finally {
        setLoading(false)
      }
    },
    [sessionId],
  )

  const handleNewChat = () => {
    setMessages([])
    setSessionId(null)
  }

  return (
    <div className="h-full flex flex-col bg-bg-primary">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-bg-secondary px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <MessageSquare size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-text-primary leading-tight">
                AI Chat Agent
              </h1>
              <p className="text-xs text-text-muted">LangGraph + Claude</p>
            </div>
          </div>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-secondary border border-border rounded-lg hover:bg-bg-hover hover:border-border-light transition-colors cursor-pointer"
          >
            <Plus size={14} />
            新对话
          </button>
        </div>
      </header>

      {/* Chat area */}
      <ChatWindow messages={messages} loading={loading} onSend={handleSend} />

      {/* Input */}
      <InputBar onSend={handleSend} disabled={loading} />
    </div>
  )
}
