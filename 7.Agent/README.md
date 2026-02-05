# 🤖 AI Math Agent

A smart, autonomous AI agent capable of parsing natural language to solve multi-step math problems. It uses **Qwen2.5-Coder:7b** via Ollama as its "brain" to understand intent and Python functions as its "calculator" for precise computation.

![Agent Architecture](https://img.shields.io/badge/Architecture-ReAct-blue)
![Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20Ollama%20%7C%20Tailwind-green)

## ✨ Features

- **🧠 Reasoning Engine**: decomposes complex word problems into sequential mathematical steps.
- **🛡️ Safe Execution**: The LLM *never* calculates arithmetic itself (which they are bad at); it delegates to Python functions.
- **💬 Dual Interface**:
  - **Web UI**: Modern chat interface built with FastAPI & Tailwind CSS.
  - **CLI**: Raw terminal mode for debugging and quick interaction.
- **🔄 State awareness**: Maintains context of the current calculation state (`LAST_RESULT`).

## 🛠️ Technology Stack

- **Backend**: FastAPI (Python)
- **Model Provider**: Ollama (Running `qwen2.5-coder:7b`)
- **Frontend**: HTML5 + Vanilla JS + Tailwind CSS
- **Protocol**: ReAct-style reasoning (Thought → Action → Observation)

## 📂 Project Structure

```
7.Agent/
├── api.py            # FastAPI backend & functionality core
├── cli.py            # Command-line interface wrapper
├── templates/
│   └── index.html    # Frontend UI
└── README.md         # Documentation
```

## 🚀 Setup & Run

### Prerequisites
1. **Install Ollama**: [Download from ollama.com](https://ollama.com/)
2. **Pull the Model**:
   ```bash
   ollama pull qwen2.5-coder:7b
   ```

### Installation
```bash
pip install fastapi uvicorn ollama
```

### Running the Web Interface
```bash
uvicorn api:app --reload
```
► **Open in Browser:** [http://localhost:8000](http://localhost:8000)

### Running the CLI
```bash
python cli.py
```

## 🧠 How It Works

The agent follows a strict **Thought-Action-Observation** loop:

1. **User Request**: "Calculate 5 plus 3, then multiply by 10."
2. **LLM Thought**: Decides to call `add` tool.
   - Output: `CALL|add|5|3`
3. **Execution**: Python runtime executes `add(5, 3)`.
   - Result: `8.0`
4. **LLM Thought**: Sees result `8.0`. Decides to call `multiply`.
   - Output: `CALL|multiply|LAST_RESULT|10`
5. **Execution**: Python runtime executes `multiply(8.0, 10)`.
   - Result: `80.0`
6. **Final Answer**:
   - Output: `FINAL|80.0`

## 🔮 Future Improvements
- [ ] Add support for trigonometric functions (sin, cos, tan).
- [ ] Implement a complex memory so variables can be stored by name.
- [ ] Add visualization for the step-by-step reasoning graph.
