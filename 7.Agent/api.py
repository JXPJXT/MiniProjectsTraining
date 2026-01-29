import ollama
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
import os

app = FastAPI()

# Setup templates
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

# Agent Configuration
MODEL = "qwen2.5-coder:7b"
history = []
last_result = None

# ──────────────────────────────────────────────
# Math tools
# ──────────────────────────────────────────────
def add(a, b):       return float(a) + float(b)
def subtract(a, b):  return float(a) - float(b)
def multiply(a, b):  return float(a) * float(b)
def divide(a, b):    return float(a) / float(b) if float(b) != 0 else "division by zero"
def power(a, b):     return float(a) ** float(b)

TOOLS = {
    "add": add,
    "subtract": subtract,
    "multiply": multiply,
    "divide": divide,
    "power": power
}

class ChatRequest(BaseModel):
    message: str

def process_agent_logic(user_input: str):
    global last_result, history
    
    # Add user message to history
    history.append(f"User: {user_input}")
    context = "\n".join(history[-8:])
    state = f"Current result: {last_result:.2f}" if last_result is not None else "No previous result"

    prompt = f"""You are a math agent that uses ONLY these tools. You NEVER calculate numbers yourself.

Available tools (exactly two arguments):
add       → addition
subtract  → subtraction
multiply  → multiplication
divide    → division
power     → exponentiation

Rules – follow exactly:
1. Output ONLY lines starting with CALL| or FINAL|
2. Each CALL line must be: CALL|tool_name|number1|number2
   Examples:
   CALL|add|5|3
   CALL|multiply|LAST_RESULT|4
3. Use LAST_RESULT when referring to the previous result
4. When the full expression is solved → output FINAL|number
5. One operation per line – you can output multiple lines
6. No explanations, no extra text, no parentheses, no other words

Current state: {state}

Recent messages:
{context}

User now: {user_input}

Your response (only CALL|... and FINAL|... lines):
"""

    response = ollama.generate(
        model=MODEL,
        prompt=prompt,
        options={"temperature": 0.0}
    )["response"].strip()

    steps = []
    final_answer = None

    for line in response.splitlines():
        line = line.strip()
        if not line: continue

        if line.startswith("CALL|"):
            try:
                parts = [p.strip() for p in line.split("|")]
                if len(parts) != 4:
                    continue
                
                _, tool_name, x_str, y_str = parts
                
                x = last_result if x_str == "LAST_RESULT" else float(x_str)
                y = last_result if y_str == "LAST_RESULT" else float(y_str)

                if tool_name in TOOLS:
                    result = TOOLS[tool_name](x, y)
                    last_result = result
                    steps.append(f"{tool_name}({x}, {y}) = {result}")
                    history.append(f"Agent: {result:.2f} via {tool_name}")
            except Exception as e:
                steps.append(f"Error processing {line}: {str(e)}")

        elif line.startswith("FINAL|"):
            try:
                final_answer = line.split("|", 1)[1].strip()
                history.append(f"Agent: Final = {final_answer}")
                last_result = None # Reset after final
            except:
                pass

    if not final_answer and not steps:
        final_answer = "I didn't understand that. Please try again."

    return {
        "steps": steps,
        "final_answer": final_answer
    }

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/chat")
async def chat(request: ChatRequest):
    result = process_agent_logic(request.message)
    return JSONResponse(content=result)

if __name__ == "__main__":
    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)
