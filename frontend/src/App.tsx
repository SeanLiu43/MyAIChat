import { useState, useCallback } from 'react'
import { Plus, MessageSquare, Trash2 } from 'lucide-react'
import type { Message, ChatSession } from './types'
import { streamMessage } from './api'
import { generateId } from './uuid'
import ChatWindow from './components/ChatWindow'
import InputBar from './components/InputBar'

function createSession(): ChatSession {
  return {
    id: generateId(),
    title: '新对话',
    messages: [],
    sessionId: null,
    createdAt: new Date(),
  }
}

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => [createSession()])
  const [activeId, setActiveId] = useState<string>(() => sessions[0].id)
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const active = sessions.find((s) => s.id === activeId)!

  const updateSession = (id: string, updater: (s: ChatSession) => ChatSession) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? updater(s) : s)))
  }

  const handleSend = useCallback(
    async (content: string) => {
      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date(),
      }

      const aiMsgId = generateId()
      const aiMsg: Message = {
        id: aiMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }

      // Add user message + empty AI placeholder, update title
      updateSession(activeId, (s) => ({
        ...s,
        title: s.messages.length === 0 ? content.slice(0, 30) : s.title,
        messages: [...s.messages, userMsg, aiMsg],
      }))
      setLoading(true)

      try {
        await streamMessage(content, active.sessionId, {
          onSession: (sessionId) => {
            updateSession(activeId, (s) => ({ ...s, sessionId }))
          },
          onDelta: (token) => {
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id !== activeId) return s
                return {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === aiMsgId ? { ...m, content: m.content + token } : m,
                  ),
                }
              }),
            )
          },
          onDone: () => {
            setLoading(false)
          },
          onError: (error) => {
            console.error('Stream error:', error)
            setLoading(false)
          },
        })
      } catch {
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== activeId) return s
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === aiMsgId
                  ? { ...m, content: '抱歉，请求出错了。请检查后端服务是否正常运行。' }
                  : m,
              ),
            }
          }),
        )
        setLoading(false)
      }
    },
    [activeId, active.sessionId],
  )

  const handleNewChat = () => {
    const s = createSession()
    setSessions((prev) => [s, ...prev])
    setActiveId(s.id)
  }

  const handleDeleteChat = (id: string) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id)
      if (next.length === 0) {
        const s = createSession()
        setActiveId(s.id)
        return [s]
      }
      if (id === activeId) {
        setActiveId(next[0].id)
      }
      return next
    })
  }

  return (
    <div className="h-full flex bg-bg-primary">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-64 shrink-0 h-full flex flex-col bg-bg-secondary border-r border-border">
          <div className="p-3">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-text-primary border border-border rounded-lg hover:bg-bg-hover transition-colors cursor-pointer"
            >
              <Plus size={16} />
              新对话
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 pb-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-sm mb-0.5 transition-colors ${
                  s.id === activeId
                    ? 'bg-bg-hover text-text-primary font-medium'
                    : 'text-text-secondary hover:bg-bg-tertiary'
                }`}
              >
                <MessageSquare size={14} className="shrink-0" />
                <span className="truncate flex-1">{s.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteChat(s.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 text-text-muted hover:text-red-500 transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </nav>
        </aside>
      )}

      {/* Main area */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        <header className="shrink-0 flex items-center px-4 py-3 border-b border-border bg-white">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-bg-hover transition-colors cursor-pointer mr-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
          <span className="text-sm font-medium text-text-primary">
            {active.title}
          </span>
        </header>

        {active.messages.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <h2 className="text-2xl font-semibold text-text-primary mb-8">
              有什么可以帮你的？
            </h2>
            <div className="w-full max-w-2xl">
              <InputBar onSend={handleSend} disabled={loading} />
            </div>
          </div>
        ) : (
          <>
            <ChatWindow messages={active.messages} loading={loading} />
            <div className="px-4 pb-4 pt-2 bg-white">
              <div className="max-w-3xl mx-auto">
                <InputBar onSend={handleSend} disabled={loading} />
                <p className="text-center text-xs text-text-muted mt-2">
                  AI 可能会产生不准确的信息，请注意甄别
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
