import os
import sys

print("Python executable:", sys.executable)
print("Loading libraries...")

try:
    from transformers import TrOCRProcessor, VisionEncoderDecoderModel
    print("Transformers imported.")
except ImportError as e:
    print(f"Transformers import failed: {e}")
    sys.exit(1)

try:
    import sentencepiece
    print(f"SentencePiece imported: {sentencepiece.__version__}")
except ImportError as e:
    print(f"SentencePiece import failed: {e}")

print("Attempting to load TrOCR model...")
try:
    model_id = "microsoft/trocr-small-printed"
    processor = TrOCRProcessor.from_pretrained(model_id, use_fast=False)
    print("Processor loaded!")
    model = VisionEncoderDecoderModel.from_pretrained(model_id)
    print("Model loaded!")
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"FAILED: {e}")
