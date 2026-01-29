import os
import torch
import gradio as gr
from pydantic import BaseModel

from transformers import AutoTokenizer, AutoModelForCausalLM

from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from fastapi import HTTPException

# ────────────────────────────────────────────────
# ENV
# ────────────────────────────────────────────────
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

# ────────────────────────────────────────────────
# LOCAL MODEL (HF SPACE CPU)
# ────────────────────────────────────────────────
MODEL_ID = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float32,
    device_map="cpu"
)

def hf_chat(message, history):
    prompt = ""

    for u, b in history:
        prompt += f"<s>[INST] {u} [/INST] {b}</s>"

    prompt += f"<s>[INST] {message} [/INST]"

    inputs = tokenizer(prompt, return_tensors="pt")

    with torch.no_grad():
        output = model.generate(
            **inputs,
            max_new_tokens=256,
            temperature=0.7,
            top_p=0.9,
            do_sample=True
        )

    decoded = tokenizer.decode(output[0], skip_special_tokens=True)
    return decoded.split(message)[-1].strip()

# ────────────────────────────────────────────────
# GOOGLE SHEETS CONFIG
# ────────────────────────────────────────────────
OAUTH_CONFIG = {
    "web": {
        "client_id": "",
        "client_secret": "",
        "auth_uri": "https://accounts.google.com/",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    }
}

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

# 🔴 CHANGE THIS TO YOUR SPACE URL
REDIRECT_URI = os.getenv(
    "REDIRECT_URI",
    "https://bhatiajapjotjpr-sheets.hf.space/oauth/callback"
)
SPREADSHEET_ID = "1JXb15ovWyI0NxvxQ57kzstcepHSGMX4LJYTNFF3vMQc"
SHEET_NAME = "Sheet1"

token_store = {}

def get_sheets_service():
    if "creds" not in token_store:
        raise HTTPException(status_code=401, detail="Authenticate first")
    creds = Credentials(**token_store["creds"])
    return build("sheets", "v4", credentials=creds)

def log_to_sheet(message):
    service = get_sheets_service()
    body = {"values": [["chat_user", "", "", message]]}

    service.spreadsheets().values().append(
        spreadsheetId=SPREADSHEET_ID,
        range=f"{SHEET_NAME}!A:A",
        valueInputOption="USER_ENTERED",
        insertDataOption="INSERT_ROWS",
        body=body
    ).execute()

# ────────────────────────────────────────────────
# GOOGLE LOGIN HANDLERS (GRADIO)
# ────────────────────────────────────────────────
def login():
    flow = Flow.from_client_config(
        OAUTH_CONFIG,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )

    auth_url, _ = flow.authorization_url(
        access_type="offline",
        prompt="consent"
    )
    return f"Click to authenticate:\n{auth_url}"

def oauth_callback_handler(request: gr.Request):
    flow = Flow.from_client_config(
        OAUTH_CONFIG,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )

    flow.fetch_token(authorization_response=str(request.url))
    creds = flow.credentials

    token_store["creds"] = {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": creds.scopes,
    }

    return "Authenticated. You can close this tab."

# ────────────────────────────────────────────────
# GRADIO CHAT UI
# ────────────────────────────────────────────────
def chat_ui(message, history):
    reply = hf_chat(message, history)
    log_to_sheet(f"USER: {message} | BOT: {reply}")
    history.append((message, reply))
    return history, ""
with gr.Blocks() as demo:
    gr.Markdown("## Step 1: Authenticate")

    gr.HTML("""
    <a href="/login" target="_blank">
        <button style="padding:12px;font-size:16px;">
            Login with Google
        </button>
    </a>
    """)

    chatbot = gr.Chatbot()
    msg = gr.Textbox()
    msg.submit(chat_ui, [msg, chatbot], [chatbot, msg])

demo.launch()
