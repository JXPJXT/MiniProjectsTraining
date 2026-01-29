from flask import Flask, render_template, request, redirect, url_for, session
import os
import sys

# Add current directory to sys.path to ensure modules can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from calc import RightToLeftCalc
from stktext import SimpleTextEditor
from student import StudentManager

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # Needed for session or flash messages if used

# Initialize global instances for simplicity (single user/session for local use)
# In a real multi-user app, these should be stored in session or a database.
calc_instance = RightToLeftCalc()
text_instance = SimpleTextEditor()
student_instance = StudentManager()

@app.route('/')
def index():
    return redirect(url_for('calc'))

# --- Calculator Routes ---
@app.route('/calc', methods=['GET', 'POST'])
def calc():
    result = None
    stack = calc_instance.stack
    # Safely handle history retrieval, assuming it might be a list of strings
    history = calc_instance.history if hasattr(calc_instance, 'history') else []

    if request.method == 'POST':
        if 'input' in request.form:
            val = request.form['input'].strip()
            if val:
                try:
                    # Try to parse as float
                    value = float(val)
                    calc_instance.push(value)
                except ValueError:
                    # If not a number, maybe an operator?
                    if val in '+-*/':
                        calc_instance.push(val)
                        if len(calc_instance.stack) >= 3:
                             # Check if we have enough operands and operator to calculate immediately
                             # The original logic calculates iteratively in a loop, 
                             # but here we might just trigger a calculation check
                             calc_instance.calculate()
    
        if 'action' in request.form:
            action = request.form['action']
            if action == 'clear':
                 calc_instance.stack = []
                 calc_instance.history = []
            elif action == 'calculate':
                 calc_instance.calculate()

    return render_template('calc.html', stack=calc_instance.stack, history=calc_instance.history)

# --- Text Editor Routes ---
@app.route('/text', methods=['GET', 'POST'])
def text():
    output_text = " ".join(text_instance.text_words)
    
    if request.method == 'POST':
        command = request.form.get('command')
        user_input = request.form.get('input_text')

        if command == 'add' and user_input:
            text_instance.add(user_input)
        elif command == 'undo':
            text_instance.undo()
        elif command == 'redo':
            text_instance.redo()
        elif command == 'remove':
            text_instance.remove()
        
        output_text = " ".join(text_instance.text_words)

    return render_template('text.html', text=output_text)

# --- Student Manager Routes ---
@app.route('/student', methods=['GET', 'POST'])
def student():
    message = None
    
    if request.method == 'POST':
        action = request.form.get('action')
        name = request.form.get('name', '').strip()

        if action == 'add' and name:
            # Capture stdout to redirect print messages to UI
            # (student.py prints instead of returning)
            # For simplicity, we'll rewrite a bit of logic here or rely on the state
            if name not in student_instance.students:
                student_instance.add_student(name)
                message = f"Added student: {name}"
            else:
                 message = f"Student {name} already exists."
        
        elif action == 'remove' and name:
            if name in student_instance.students:
                student_instance.remove_student(name)
                message = f"Removed student: {name}"
            else:
                message = f"Student {name} not found."
        
        elif action == 'search' and name:
            if name in student_instance.students:
                message = f"Student {name} found."
            else:
                message = f"Student {name} not found."

    return render_template('student.html', students=student_instance.students, message=message)

if __name__ == '__main__':
    app.run(debug=True)
