import ollama

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

print("Math Agent – step-by-step function calling")
print("Just type expressions or questions. Type 'exit' to quit.\n")

while True:
    user_input = input("You: ").strip()
    if user_input.lower() in ["exit", "quit", "bye", "q"]:
        print("Agent: Goodbye!")
        break

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

    # ──────────────────────────────────────────────
    # Process each line the model gave us
    # ──────────────────────────────────────────────
    lines_processed = 0
    for line in response.splitlines():
        line = line.strip()
        if not line:
            continue

        if line.startswith("CALL|"):
            try:
                parts = [p.strip() for p in line.split("|")]
                if len(parts) != 4:
                    print(f"  (bad format skipped: {line})")
                    continue

                _, tool_name, x_str, y_str = parts

                x = last_result if x_str == "LAST_RESULT" else float(x_str)
                y = last_result if y_str == "LAST_RESULT" else float(y_str)

                if tool_name not in TOOLS:
                    print(f"  (unknown tool: {tool_name})")
                    continue

                result = TOOLS[tool_name](x, y)
                last_result = result
                lines_processed += 1

                # Nice printing
                print(f"→ {result:.2f}   ({tool_name} {x:.2f} {y:.2f})")

                history.append(f"Agent: {result:.2f} via {tool_name}")

            except Exception as e:
                print(f"→ Error: {e}")
                last_result = None
                history.append("Agent: error")

        elif line.startswith("FINAL|"):
            try:
                result = line.split("|", 1)[1].strip()
                print(f"\nFinal answer: {result}")
                history.append(f"Agent: Final = {result}")
                last_result = None
            except:
                print("→ Bad FINAL format")

        else:
            print(f"  (ignored: {line})")

    if lines_processed == 0 and "FINAL|" not in response:
        print("→ Agent didn't understand. Try rephrasing.")1 