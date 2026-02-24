# 🍎 MLAPI — Fruit Predictor

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)
![Gradio](https://img.shields.io/badge/Gradio-UI-orange?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.x-blue?style=for-the-badge&logo=python)

*A simple ML API that predicts whether a fruit is an Apple or an Orange based on texture and color — served via both a REST API and an interactive Gradio UI.*

</div>

---

## 🎯 What It Does

Trains a **Decision Tree Classifier** on fruit characteristics (texture and color) and exposes prediction through two interfaces:
1. **FastAPI REST API** — for programmatic access
2. **Gradio Web UI** — for interactive exploration

This is a beginner-friendly showcase of how to wrap a scikit-learn model in a production-ready API.

---

## 🏗️ Architecture

```
           ┌─ FastAPI REST API (:8000)
           │   POST /predict_fruit/
           │   → Returns JSON prediction
           │
Training ──┤
Data       │
(hardcoded)│
           │
           └─ Gradio Web UI (:7860)
               Interactive dropdowns
               → Returns prediction + confidence
```

### ML Pipeline

```
[Texture: smooth/rough] + [Color: red/orange]
            │
            ▼
    ┌────────────────┐
    │ Label Encoding  │  (text → numbers)
    └────────┬───────┘
             ▼
    ┌────────────────┐
    │ Decision Tree   │  (sklearn)
    │ Classifier      │
    └────────┬───────┘
             ▼
    🍎 Apple  or  🍊 Orange
```

---

## 📂 Project Structure

```
4.MLAPI/
├── fastapi_app.py    # FastAPI REST endpoint for predictions
├── gradio_app.py     # Gradio interactive web UI
└── README.md
```

---

## ✨ Features

| Feature | Description |
|---|---|
| **🧠 ML Model** | Decision Tree Classifier trained on texture + color features |
| **🔌 REST API** | `POST /predict_fruit/` endpoint with JSON request/response |
| **🎨 Gradio UI** | Interactive web interface with dropdown inputs |
| **⚡ Instant Inference** | Model trains in-memory on startup, predictions are instant |
| **📊 Label Encoding** | Handles text features (smooth/rough, red/orange) transparently |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **ML Model** | scikit-learn (DecisionTreeClassifier) |
| **Feature Encoding** | LabelEncoder (text → numeric) |
| **API** | FastAPI, Uvicorn |
| **Web UI** | Gradio |
| **Data** | NumPy arrays (hardcoded training data) |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.x

### Install Dependencies

```bash
pip install fastapi uvicorn scikit-learn numpy gradio
```

### Option 1: Run the REST API

```bash
python fastapi_app.py
```
→ API at **http://localhost:8000**

**Test it:**
```bash
curl -X POST http://localhost:8000/predict_fruit/ \
  -H "Content-Type: application/json" \
  -d '{"texture": "smooth", "color_code": "red"}'
```

### Option 2: Run the Gradio UI

```bash
python gradio_app.py
```
→ Interactive UI at **http://localhost:7860**

---

## 📡 API Reference

### `POST /predict_fruit/`

**Request Body:**
```json
{
  "texture": "smooth",    // "smooth" or "rough"
  "color_code": "red"     // "red" or "orange"
}
```

**Response:**
```json
{
  "prediction": "apple"
}
```

---

*Your first ML API — from training to deployment in one file* 🍎
