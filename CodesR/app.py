import uvicorn
from flask import Flask, render_template_string
from asgiref.wsgi import WsgiToAsgi

flask_app = Flask(__name__)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Flask + Uvicorn</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
            background: #f0f2f5; 
        }
        .card { 
            background: white; 
            padding: 2rem; 
            border-radius: 12px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
            text-align: center; 
        }
        .status { 
            color: #2ecc71; 
            font-weight: bold; 
        }
        code { 
            background: #eee; 
            padding: 0.2rem 0.4rem; 
            border-radius: 4px; 
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>we are is Live SJ </h1>
        <p>Running on <span class="status">Uvicorn (ASGI)</span></p>
        
    </div>
</body>
</html>
"""

@flask_app.route('/')
def home():
    return render_template_string(HTML_TEMPLATE)

app = WsgiToAsgi(flask_app)

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=5000, log_level="info", reload=True)