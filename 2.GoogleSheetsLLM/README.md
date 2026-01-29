# GoogleSheetsLLM

This project implements a Chatbot using `TinyLlama` that logs conversation history to a Google Sheet. It uses Gradio for the user interface.

## Prerequisites

- Python 3.x
- `client_secret.json` from Google Cloud Console (for OAuth).
- A Google Sheet ID configured in `app.py`.

## Installation

1.  Clone the repository or navigate to this directory.
2.  Install dependencies:

    ```bash
    pip install torch transformers gradio google-auth-oauthlib google-api-python-client
    ```

    (Note: `torch` installation might vary based on your OS and CUDA availability. Visit [pytorch.org](https://pytorch.org/) for specific commands.)

## Configuration

- Place `client_secret.json` in this directory.
- Edit `app.py`:
    - Set `SPREADSHEET_ID` to your Google Sheet ID.
    - Set `REDIRECT_URI` if running on a custom domain (defaults to `https://bhatiajapjotjpr-sheets.hf.space/oauth/callback` which might need changing for local development to `http://localhost:7860/`).

## Running the Application

Run the Gradio app:

```bash
python app.py
```

Open the link provided in the terminal (usually `http://127.0.0.1:7860`).

## Features

- **Chat Interface**: Talk to TinyLlama.
- **Google Sheets Logging**: Every message and response is logged to the configured Google Sheet.
- **Google Login**: OAuth authentication flow.
