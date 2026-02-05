# CodesR Collection

A curated collection of Python scripts and algorithms focusing on data structures, graph theory, and interactive visualizations.

## 📂 Contents

| File | Description | Technologies |
|------|-------------|--------------|
| `graph.py` | **Avengers Compatibility Graph**<br>Interactive visualization of a weighted graph showing combat synergy between Avengers. Features circular layout, dynamic edge coloring, and interactive highlighting. | `networkx`, `matplotlib` |
| `got.py` | **Royal Lineage CLI**<br>A CLI tool to explore the Game of Thrones Targaryen family tree. Supports querying parents, children, ancestors, and descendants. | Python (Tree DS) |
| `b.py` | **Decision Tree Visualizer**<br>Interactive decision tree that guesses a number (0-10) and visualizes the traversal path in real-time. | `networkx`, `matplotlib` |
| `hp.py` | **Custom Hash Map**<br>A pure Python implementation of a Hash Map using chaining for collision resolution. | Python (Data Structures) |
| `a.py` | **Math Agent Experiment**<br>A prototype AI agent that solves math problems by parsing natural language and calling Python functions. | `ollama` |
| `bst.java` | **Binary Search Tree**<br>Java implementation of a Binary Search Tree. | Java |
| `ticket-ai-system/` | **AI Ticket Routing System**<br>A structured FastAPI project for intelligent support ticket routing and classification. | FastAPI, SQLAlchemy |

## 🚀 How to Run

### Python Scripts
Ensure you have the required dependencies:
```bash
pip install networkx matplotlib ollama
```

Run any script directly:
```bash
# Run Avengers Graph
python graph.py

# Run GOT Lineage Tool
python got.py

# Run Decision Tree Visualizer
python b.py
```

### Java
```bash
javac bst.java
java bst
```

## 📸 Previews

### Avengers Compatibility Graph (`graph.py`)
- Visualizes relationships with weighted edges.
- Click on nodes to highlight connections.
- Special "Self-Centered" mode for Iron Man.

### Decision Tree (`b.py`)
- Visualizes the logic path taken to guess a number.
- Highlights the active path in red/yellow.

## 🧩 Dependencies
- Python 3.8+
- `matplotlib`
- `networkx`
- `ollama` (for `a.py`)
