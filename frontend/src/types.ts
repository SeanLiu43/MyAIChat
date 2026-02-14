export interface ToolCallInfo {
  tool_name: string
  tool_input: Record<string, string>
  tool_output: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  tool_calls?: ToolCallInfo[]
  timestamp: Date
}

export interface ChatResponse {
  reply: string
  session_id: string
  tool_calls: ToolCallInfo[]
}
