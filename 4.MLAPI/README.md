# MLAPI (Machine Learning API)

This project contains two implementations of a Fruit Classifier model:
1.  **FastAPI (`fastapi_app.py`)**: A REST API endpoint for prediction.
2.  **Gradio (`gradio_app.py`)**: An interactive web UI.

## Model

A simple Decision Tree Classifier trained on hardcoded data (Texture & Color) to predict Fruit (Apple vs Orange).

## Prerequisites

- Python 3.x
- `pip`.

## Installation

```bash
pip install fastapi uvicorn scikit-learn numpy gradio
```

## Running the Application

### Option 1: FastAPI

Start the API server:

```bash
python fastapi_app.py
```
(Or `uvicorn fastapi_app:app --host 0.0.0.0 --port 8000`)

- **POST** `/predict_fruit/`
    - Body: `{"texture": "smooth", "color_code": "red"}`

### Option 2: Gradio UI

Run the interactive UI:

```bash
python gradio_app.py
```

Open the link provided in the terminal.
