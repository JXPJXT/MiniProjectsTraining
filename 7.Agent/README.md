# Math Agent

A smart AI agent that can solve multi-step math problems by calling Python functions. It uses `ollama` with `qwen2.5-coder:7b` as the brain, and Python's math capabilities as the calculator.

## Features
- **Step-by-Step Solving**: Break down complex problems into small steps.
- **Tool Use**: The LLM doesn't calculate; it calls tools like `add`, `multiply`, `power`.
- **Web Interface**: Modern Chat UI built with FastAPI and Tailwind CSS.
- **CLI Mode**: Classic terminal interface for quick testing.

## Setup

1. **Install Dependencies**
   ```bash
   pip install fastapi uvicorn ollama
   ```

2. **Run Web App**
   ```bash
   uvicorn api:app --reload
   ```
   Open [http://localhost:8000](http://localhost:8000)

3. **Run CLI Mode**
   ```bash
   python cli.py
   ```

## How it works
The agent receives a prompt describing the available tools. It outputs a structured thought process (`CALL|tool|...`) which the Python runtime intercepts, executes, and feeds back the result (`LAST_RESULT`) until the agent outputs `FINAL|answer`.
