import { useState } from 'react'
import { ChevronDown, ChevronRight, Wrench } from 'lucide-react'
import type { ToolCallInfo } from '../types'

const TOOL_LABELS: Record<string, string> = {
  search: '搜索',
  calculator: '计算器',
}

export default function ToolCallCard({ tool }: { tool: ToolCallInfo }) {
  const [expanded, setExpanded] = useState(false)

  const label = TOOL_LABELS[tool.tool_name] || tool.tool_name
  const inputStr = Object.values(tool.tool_input).join(', ')

  return (
    <div className="border border-tool-border rounded-lg bg-tool-bg overflow-hidden transition-all duration-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-hover transition-colors cursor-pointer"
      >
        <Wrench size={14} className="text-accent shrink-0" />
        <span className="text-accent-hover font-medium">{label}</span>
        <span className="text-text-muted truncate">({inputStr})</span>
        <span className="ml-auto shrink-0 text-text-muted">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 text-xs animate-fade-in">
          <div>
            <span className="text-text-muted">输入：</span>
            <pre className="mt-1 p-2 bg-bg-primary rounded text-text-secondary overflow-x-auto">
              {JSON.stringify(tool.tool_input, null, 2)}
            </pre>
          </div>
          <div>
            <span className="text-text-muted">输出：</span>
            <pre className="mt-1 p-2 bg-bg-primary rounded text-text-secondary overflow-x-auto">
              {tool.tool_output}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
