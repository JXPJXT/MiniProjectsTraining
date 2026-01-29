# Multi-Tool Application (Calc, Text, Student)

This is a multi-purpose Flask application that combines three tools:
1.  **Calculator**: A Right-to-Left calculator.
2.  **Text Editor**: A simple stack-based text editor with undo/redo.
3.  **Student Manager**: A simple student management system.

## Prerequisites

- Python 3.x
- `pip`.

## Installation

```bash
pip install flask
```

## Running the Application

Run the Flask server:

```bash
python app.py
```

The application will leverage `debug=True` by default.
Open `http://127.0.0.1:5000` in your browser.

## Usage

-   **Calculator**: `/calc`
-   **Text Editor**: `/text`
-   **Student Manager**: `/student`
