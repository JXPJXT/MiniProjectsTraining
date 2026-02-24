# 🧩 CodesR — Mini-Projects & Algorithms Collection

> A curated collection of **data structures, algorithms, visualizations, and mini-tools** — spanning Python, Java, and web technologies.

![Python](https://img.shields.io/badge/Python-3.8+-blue?logo=python)
![Java](https://img.shields.io/badge/Java-17+-red?logo=openjdk)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-E34F26?logo=html5)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi)

---

## 📂 Contents

### 🐍 Python Scripts

| File | Project | Description | Tech |
|---|---|---|---|
| `graph.py` | **🦸 Avengers Compatibility Graph** | Interactive weighted directed graph showing combat synergy between 6 Avengers. Circular layout, dynamic edge coloring, and node highlighting. Iron Man "self-centered" mode. | `networkx`, `matplotlib` |
| `got.py` | **🐉 Royal Lineage CLI** | CLI tool to explore the Game of Thrones Targaryen family tree. Query parents, children, ancestors, and descendants. | Python (Tree DS) |
| `b.py` | **🌳 Decision Tree Visualizer** | Interactive decision tree that guesses a number (0–10) and visualizes the traversal path in real-time with highlighted nodes. | `networkx`, `matplotlib` |
| `a.py` | **🤖 Math Agent Experiment** | Prototype AI agent using Ollama to solve math problems by parsing natural language and calling Python functions (ReAct pattern). | `ollama` |
| `a (2).py` | **🌲 BST Visualizer** | Quick script to draw a binary search tree graph using NetworkX with custom node positioning. | `networkx`, `matplotlib` |
| `hp.py` | **🗂️ Custom Hash Map** | Pure Python Hash Map implementation with chaining for collision resolution. | Python |
| `queue.py` | **🎫 Ticket Management System** | Circular queue-based ticket management system with CLI interface. Add, delete, peek, traverse, and count tickets. | Python |
| `app.py` | **⚡ Flask + Uvicorn Demo** | Flask app served via ASGI (Uvicorn) using `asgiref`. Demonstrates Flask ↔ ASGI bridging. | Flask, Uvicorn |

### ☕ Java Programs

| File | Project | Description |
|---|---|---|
| `bst.java` | **🌲 Binary Search Tree** | Java implementation of BST with insert, search, and traversal operations. |

### 📁 `dp/` — Dynamic Programming

| File | Problem | Description |
|---|---|---|
| `ClimbStairs.java` | **🧗 Climbing Stairs** | Three approaches: Recursion, Memoization, and Tabulation for the classic staircase problem. |
| `fib.java` | **🔢 Fibonacci** | Fibonacci number calculation using Memoization and Tabulation. |

### 🌐 Web Visualizations

| File | Description |
|---|---|
| `a.html` | **🌧️ Rain Water Trapping Visualizer** — Interactive Canvas-based step-through visualizer for the two-pointer rain water trapping algorithm. Features play/pause animation, speed control, and pointer tracking stats. |

---

## 🚀 How to Run

### Python Scripts

```bash
# Install common dependencies
pip install networkx matplotlib ollama

# Run Avengers Graph
python graph.py

# Run GOT Lineage (CLI)
python got.py

# Run Decision Tree
python b.py

# Run Ticket Management Queue
python queue.py

# Run Flask + Uvicorn demo
pip install flask asgiref uvicorn
python app.py
```

### Java Programs

```bash
# Compile and run BST
javac bst.java && java bst

# Compile and run DP problems
cd dp
javac ClimbStairs.java && java ClimbStairs
javac fib.java && java fib
```

### Web Visualizations

```bash
# Open directly in browser
start a.html    # Rain Water Trapping
```

---

## 🔗 Graduated Projects

The following items started in CodesR and have been promoted to their own standalone projects:

| Original | Now | Description |
|---|---|---|
| `got_visualizer.py` + `targaryen_lineage.html` | [`17.Treevis/`](../17.Treevis/) | 🐉 Enhanced GoT Lineage Visualizer with interactive HTML |
| `ticket-ai-system/` | [`16.Ticket-ai-system/`](../16.Ticket-ai-system/) | 🎟️ AI Ticket Router with ML classification |

---

## 🧩 Dependencies

| Language | Packages |
|---|---|
| **Python** | `matplotlib`, `networkx`, `ollama`, `flask`, `asgiref`, `uvicorn` |
| **Java** | JDK 17+ |
| **Web** | Modern browser (Chrome/Edge/Firefox) |

---

*A growing collection of algorithms, data structures, and creative experiments* 🧩
