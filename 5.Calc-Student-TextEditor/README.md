# 🧰 Calc-Student-TextEditor — Multi-Tool Flask App

<div align="center">

![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.x-blue?style=for-the-badge&logo=python)

*Three apps in one — a Stack Calculator, a Text Editor with Undo/Redo, and a Student Manager — all powered by Flask and data structure concepts.*

</div>

---

## 🎯 What It Does

A **multi-purpose Flask application** that bundles three standalone tools, each demonstrating a different data structure in action:

| Tool | Data Structure | What It Does |
|---|---|---|
| 🧮 **Calculator** | Stack | Right-to-left stack-based arithmetic calculator |
| 📝 **Text Editor** | Stack (Undo/Redo) | Simple text editor with undo and redo using dual stacks |
| 👨‍🎓 **Student Manager** | List/Dict | CRUD operations for student records |

---

## 🏗️ Architecture

```
┌───────────────────────────────────────┐
│        Flask App (:5000)              │
│                                       │
│  ┌─────────┐  ┌──────────┐  ┌──────┐ │
│  │  /calc   │  │  /text   │  │/stud │ │
│  │          │  │          │  │ ent  │ │
│  │ Stack    │  │ Undo     │  │ CRUD │ │
│  │ Calc     │  │ Redo     │  │ Ops  │ │
│  │ Engine   │  │ Stacks   │  │      │ │
│  └─────────┘  └──────────┘  └──────┘ │
│                                       │
│  Jinja2 Templates + Server State      │
└───────────────────────────────────────┘
```

---

## 📂 Project Structure

```
5.Calc-Student-TextEditor/
├── app.py                # Main Flask application with all 3 tools
├── templates/
│   ├── calc.html         # Calculator interface
│   ├── text.html         # Text editor interface
│   └── student.html      # Student manager interface
├── static/               # CSS/JS assets
└── README.md
```

---

## ✨ Features

### 🧮 Stack Calculator (`/calc`)
- Right-to-left arithmetic evaluation
- Supports basic operations (+, −, ×, ÷)
- Stack-based computation engine
- Visual display of stack state

### 📝 Text Editor (`/text`)
- Type and edit text content
- **Undo** — reverts to the previous state (uses an undo stack)
- **Redo** — re-applies the undone change (uses a redo stack)
- Demonstrates the classic dual-stack undo/redo pattern

### 👨‍🎓 Student Manager (`/student`)
- Add new students with name, roll number, and marks
- View all students in a table
- Delete student records
- In-memory storage (resets on restart)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Flask (Python) |
| **Templates** | Jinja2 |
| **State** | In-memory (Python data structures) |
| **Concepts** | Stack, List, CRUD patterns |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.x

### Install & Run

```bash
pip install flask
python app.py
```

Open **http://localhost:5000** in your browser.

### Routes

| Route | Tool |
|---|---|
| `/calc` | 🧮 Stack Calculator |
| `/text` | 📝 Text Editor (Undo/Redo) |
| `/student` | 👨‍🎓 Student Manager |

---

*Three data-structure demos wrapped in a single Flask app* 🧰
