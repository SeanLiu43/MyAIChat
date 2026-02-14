# MyAIChat

基于 LangGraph + Claude 的 AI 对话应用，支持工具调用可视化。

## 项目结构

```
├── backend/          # FastAPI 后端
│   ├── main.py       # API 服务（包装 LangGraph Agent）
│   └── requirements.txt
├── frontend/         # React 前端
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── ChatWindow.tsx      # 聊天窗口
│   │   │   ├── MessageBubble.tsx   # 消息气泡（Markdown 渲染）
│   │   │   ├── ToolCallCard.tsx    # 工具调用展示卡片
│   │   │   └── InputBar.tsx        # 输入框
│   │   └── ...
│   └── package.json
```

## 功能

- 多轮对话，支持会话管理
- AI 回复 Markdown 渲染（代码块、列表、引用）
- 工具调用可视化（搜索 / 计算器）
- 深色主题 UI
- 快捷建议词条

## 快速开始

### 后端

```bash
cd backend
cp .env.example .env
# 编辑 .env，填入你的 ANTHROPIC_API_KEY

pip install -r requirements.txt
uvicorn main:app --reload
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

打开 http://localhost:5173 即可使用。

## 技术栈

- **后端**: FastAPI + LangGraph + LangChain + Claude
- **前端**: React + TypeScript + Vite + Tailwind CSS
