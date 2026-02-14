from dotenv import load_dotenv
load_dotenv(override=True)

import json
import uuid
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, AIMessage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ========== LLM ==========
llm = ChatAnthropic(model_name="claude-opus-4-20250514")

# ========== FastAPI ==========
app = FastAPI(title="Chat API")

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


def sse_event(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


@app.post("/api/chat")
async def chat(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())

    if session_id not in sessions:
        sessions[session_id] = []

    history = sessions[session_id]
    history.append(HumanMessage(content=req.message))

    async def generate():
        yield sse_event("session", {"session_id": session_id})

        full_reply = ""
        try:
            async for chunk in llm.astream(history):
                token = chunk.content if isinstance(chunk.content, str) else str(chunk.content)
                if token:
                    full_reply += token
                    yield sse_event("delta", {"content": token})
        except Exception as e:
            logger.error(f"LLM error: {e}")
            error_msg = "抱歉，AI 服务暂时出错了，请稍后再试。"
            full_reply = error_msg
            yield sse_event("delta", {"content": error_msg})

        history.append(AIMessage(content=full_reply))
        yield sse_event("done", {})

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/api/health")
async def health():
    return {"status": "ok"}
