from dotenv import load_dotenv
load_dotenv()

import uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from langgraph.prebuilt import create_react_agent
from langchain_core.tools import tool

# ========== Tools ==========
@tool
def search(query: str) -> str:
    """搜索互联网上的信息。当用户询问你不知道的实时信息时使用。"""
    return f"搜索结果：关于'{query}'的最新信息是..."

@tool
def calculator(expression: str) -> str:
    """计算数学表达式。当用户需要做数学运算时使用。"""
    try:
        result = eval(expression)
        return f"{expression} = {result}"
    except Exception as e:
        return f"计算错误：{e}"

# ========== Agent ==========
llm = ChatAnthropic(model_name="claude-sonnet-4-20250514")
agent = create_react_agent(llm, [search, calculator])

# ========== FastAPI ==========
app = FastAPI(title="Chat Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session storage
sessions: dict[str, list] = {}


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None


class ToolCallInfo(BaseModel):
    tool_name: str
    tool_input: dict
    tool_output: str


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    tool_calls: list[ToolCallInfo]


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())

    if session_id not in sessions:
        sessions[session_id] = []

    history = sessions[session_id]
    history.append(HumanMessage(content=req.message))

    result = agent.invoke({"messages": history})
    messages = result["messages"]

    # Extract tool calls from the message sequence
    tool_calls_info = []
    for i, msg in enumerate(messages):
        if isinstance(msg, AIMessage) and msg.tool_calls:
            for tc in msg.tool_calls:
                # Find the corresponding ToolMessage
                output = ""
                for later_msg in messages[i + 1:]:
                    if isinstance(later_msg, ToolMessage) and later_msg.tool_call_id == tc["id"]:
                        output = later_msg.content
                        break
                tool_calls_info.append(ToolCallInfo(
                    tool_name=tc["name"],
                    tool_input=tc["args"],
                    tool_output=str(output),
                ))

    # Get final AI reply
    ai_reply = messages[-1].content if isinstance(messages[-1], AIMessage) else ""

    # Update session history
    sessions[session_id] = messages

    return ChatResponse(
        reply=ai_reply,
        session_id=session_id,
        tool_calls=tool_calls_info,
    )


@app.get("/api/health")
async def health():
    return {"status": "ok"}
