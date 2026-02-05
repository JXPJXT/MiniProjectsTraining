# DL OCR Comparison System

A comprehensive Driving License OCR system that compares two approaches:
- **Approach 1**: Traditional OCR (Pytesseract + PaddleOCR)
- **Approach 2**: VLM-based OCR (OlmOCR-2-7B from Hugging Face)

Optimized for Indian Driving Licenses with English + Punjabi text support.

![OCR Comparison](https://via.placeholder.com/800x400/0a0a0a/ffffff?text=DL+OCR+Comparison+System)

## Features
- **Two OCR Approaches:**
  1. **Traditional:** Pytesseract with advanced image preprocessing (CLAHE, thresholding, noise removal).
  2. **VLM AI:** Microsoft Florence-2-base (runs locally, downloads once).
- **Comparison & Analysis:** Calculates CER (Character Error Rate) and Levenshtein distance to compare accuracy.
- **Offline Capable:** Both engines run entirely offline after initial model download.
- **Beautiful UI:** Premium black/white glassmorphism design.
- 🔒 **Fully Offline**: No cloud APIs, all processing local

## Project Structure

```
10.OCR/
├── main.py                 # FastAPI application
├── ocr_engines.py          # OCR engine implementations
├── utils.py                # Preprocessing & accuracy utilities
├── database.py             # SQLite & JSON storage
├── requirements.txt        # Python dependencies
├── frontend/
│   ├── index.html          # Main UI
│   ├── styles.css          # Premium styling
│   └── app.js              # Frontend logic
├── results/                # Stored OCR results
│   └── json/               # JSON result files
├── models/                 # Downloaded models (create manually)
└── uploads/                # Temporary upload storage
```

## Prerequisites

### 1. Python 3.9+
Ensure Python 3.9 or higher is installed.

### 2. Tesseract OCR
Download and install Tesseract OCR:

**Windows:**
1. Download from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install to default location: `C:\Program Files\Tesseract-OCR`
3. Add to PATH or set in code:
   ```python
   import pytesseract
   pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
   ```

**Linux:**
```bash
sudo apt-get install tesseract-ocr tesseract-ocr-eng tesseract-ocr-pan
```

**macOS:**
```bash
brew install tesseract
```

### 3. Download Models (One-Time)

**PaddleOCR models** (auto-downloaded on first run):
- Detection: ~2MB
- Recognition: ~10MB
- Angle classifier: ~2MB

**OlmOCR-2-7B** (requires manual download for offline use):
```bash
# Set up Hugging Face cache
pip install huggingface_hub

# Download model (run ONCE with internet)
python -c "from transformers import AutoProcessor, Qwen2VLForConditionalGeneration; \
AutoProcessor.from_pretrained('allenai/olmocr-2-7b'); \
Qwen2VLForConditionalGeneration.from_pretrained('allenai/olmocr-2-7b')"
```

## Installation

1. **Clone/Navigate to project:**
```bash
cd 10.OCR
```

2. **Create virtual environment:**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Create required directories:**
```bash
mkdir results results\json models uploads
```

## Running the Application

```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Then open: **http://localhost:8000**

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Serve frontend UI |
| `/upload` | POST | Upload DL image for OCR |
| `/results` | GET | Get all past results |
| `/results/{id}` | GET | Get specific result |
| `/stats` | GET | Get accuracy statistics |
| `/health` | GET | Health check |

### Upload Example

```bash
curl -X POST "http://localhost:8000/upload" \
  -F "file=@dl_image.jpg" \
  -F 'ground_truth={"name":"John Doe","date_of_birth":"01-01-1990"}'
```

### Response Format

```json
{
  "success": true,
  "result_id": 1,
  "approach1": {
    "name": "Pytesseract + PaddleOCR",
    "fields": {
      "name": "JOHN DOE",
      "date_of_birth": "01-01-1990",
      "license_number": "DL-1234567890"
    }
  },
  "approach2": {
    "name": "OlmOCR-2-7B (VLM)",
    "fields": {
      "name": "John Doe",
      "date_of_birth": "01-01-1990",
      "license_number": "DL-1234567890"
    }
  },
  "accuracy": {
    "approach1": {"accuracy_percent": 92.5},
    "approach2": {"accuracy_percent": 98.2},
    "comparison": {"winner": "Approach 2 (OlmOCR-2-7B)"}
  }
}
```

## Configuration

### Environment Variables

```bash
# Force offline mode (no HuggingFace downloads at runtime)
set HF_HUB_OFFLINE=1
set TRANSFORMERS_OFFLINE=1
```

### Tesseract Path (Windows)

Edit `ocr_engines.py`:
```python
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

## Performance Notes

| Scenario | Expected Accuracy | Processing Time |
|----------|------------------|-----------------|
| Clean Scans | 95%+ | ~1-2s |
| Noisy Photos | 80-90% | ~2-3s |
| Multilingual (English+Punjabi) | 85-95% | ~2-4s |

## Troubleshooting

### "Tesseract not found"
- Install Tesseract OCR and add to PATH
- Or set explicit path in code

### "Model not found" (VLM)
- Download model with internet first
- Check `~/.cache/huggingface/` for cached models

### Memory issues with VLM
- Model uses 4-bit quantization by default
- Requires ~8GB RAM minimum
- Falls back gracefully if unavailable

## License

MIT License - Free for educational and commercial use.
