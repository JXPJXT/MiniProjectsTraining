# 🤖 GoogleSheetsLLM — AI Chatbot with Sheets Logging

<div align="center">

![Gradio](https://img.shields.io/badge/Gradio-UI-orange?style=for-the-badge&logo=gradio)
![Transformers](https://img.shields.io/badge/Transformers-HuggingFace-yellow?style=for-the-badge&logo=huggingface)
![Google Sheets](https://img.shields.io/badge/Google_Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.x-blue?style=for-the-badge&logo=python)

*An interactive AI chatbot powered by TinyLlama that logs every conversation turn to a Google Sheet — complete with Google OAuth authentication.*

</div>

---

## 🎯 What It Does

Chat with a local **TinyLlama** language model through a beautiful Gradio interface. Every message you send and every response the AI generates is **automatically logged to a Google Sheet** with timestamps, creating a persistent conversation history. Users authenticate via **Google OAuth** before chatting.

---

## 🏗️ Architecture

```
┌────────────────────────────┐
│     Gradio Web UI (:7860)  │
│  ┌────────────────────┐    │
│  │  Chat Interface    │    │
│  │  (Text in/out)     │    │
│  └────────┬───────────┘    │
│           │                │
│  ┌────────▼───────────┐    │
│  │  Google OAuth Flow │    │
│  │  (Login required)  │    │
│  └────────┬───────────┘    │
└───────────┼────────────────┘
            │
    ┌───────▼────────┐      ┌──────────────────┐
    │  TinyLlama     │      │  Google Sheets    │
    │  (HF Pipeline) │      │  Conversation Log │
    │  Local LLM     │      │  (Append rows)    │
    └────────────────┘      └──────────────────┘
```

---

## 📂 Project Structure

```
2.GoogleSheetsLLM/
├── app.py                # Main application — Gradio UI + LLM + Sheets logging
├── client_secret.json    # Google OAuth credentials (not committed)
└── README.md
```

---

## ✨ Features

| Feature | Description |
|---|---|
| **💬 AI Chat** | Conversational interface powered by TinyLlama (1.1B parameters) |
| **📊 Sheet Logging** | Every message & response is appended to a Google Sheet with timestamps |
| **🔐 Google OAuth** | Users must authenticate via Google before chatting |
| **🎨 Gradio UI** | Beautiful, ready-to-use chat interface — no frontend code needed |
| **🤗 HF Spaces Ready** | Designed to be deployed on Hugging Face Spaces |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **LLM** | TinyLlama-1.1B (via HuggingFace Transformers) |
| **UI Framework** | Gradio |
| **Logging** | Google Sheets API v4 |
| **Authentication** | Google OAuth 2.0 |
| **Runtime** | Python, PyTorch |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.x
- Google Cloud project with OAuth credentials (`client_secret.json`)
- A Google Sheet ID for conversation logging

### 1. Install Dependencies

```bash
pip install torch transformers gradio google-auth-oauthlib google-api-python-client
```

> **Note:** `torch` installation may vary by OS and CUDA availability. Visit [pytorch.org](https://pytorch.org/) for platform-specific commands.

### 2. Configure

1. Place `client_secret.json` in this directory
2. Edit `app.py`:
   - Set `SPREADSHEET_ID` to your Google Sheet ID
   - Set `REDIRECT_URI` for your environment:
     - **Local**: `http://localhost:7860/`
     - **HF Spaces**: `https://<your-space>.hf.space/oauth/callback`

### 3. Run

```bash
python app.py
```

Open **http://127.0.0.1:7860** in your browser.

### 4. Use

1. Click **Login with Google** to authenticate
2. Start chatting with TinyLlama
3. Check your Google Sheet — every turn is logged automatically!

---

## 📡 How Logging Works

Each conversation turn appends a row to the Google Sheet:

| Timestamp | User Message | AI Response |
|---|---|---|
| `2025-01-15 14:30:22` | "What is machine learning?" | "Machine learning is a subset of AI that..." |
| `2025-01-15 14:30:45` | "Give me an example" | "For example, a spam classifier..." |

---

*Chat with an LLM, log to Sheets — bridging AI and productivity tools* 🤖
