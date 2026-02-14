import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

interface InputBarProps {
  onSend: (message: string) => void
  disabled: boolean
}

export default function InputBar({ onSend, disabled }: InputBarProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [disabled])

  const adjustHeight = () => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
    }
  }

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-border bg-bg-secondary px-4 py-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-3 bg-bg-tertiary border border-border-light rounded-xl px-4 py-3 focus-within:border-accent transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              adjustHeight()
            }}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-[15px] text-text-primary placeholder:text-text-muted leading-relaxed disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={disabled || !input.trim()}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-30 disabled:hover:bg-accent transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
        <p className="text-center text-xs text-text-muted mt-2">
          AI 可能会产生不准确的信息，请注意甄别
        </p>
      </div>
    </div>
  )
}
