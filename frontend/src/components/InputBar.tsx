import { useState, useRef, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

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

  const canSend = input.trim().length > 0 && !disabled

  return (
    <div className="flex items-end gap-2 bg-bg-tertiary border border-border rounded-2xl px-4 py-3 focus-within:border-border-light transition-colors">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          adjustHeight()
        }}
        onKeyDown={handleKeyDown}
        placeholder="输入消息..."
        disabled={disabled}
        rows={1}
        className="flex-1 bg-transparent resize-none outline-none text-[15px] text-text-primary placeholder:text-text-muted leading-relaxed disabled:opacity-50"
      />
      <button
        onClick={handleSubmit}
        disabled={!canSend}
        className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all cursor-pointer disabled:cursor-not-allowed ${
          canSend
            ? 'bg-text-primary text-white hover:opacity-80'
            : 'bg-border text-text-muted'
        }`}
      >
        <ArrowUp size={16} />
      </button>
    </div>
  )
}
