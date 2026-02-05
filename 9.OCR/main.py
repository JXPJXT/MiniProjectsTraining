"""
DL OCR FastAPI Application - Main Entry Point
"""
import os
import time
from datetime import datetime
from typing import Optional
import json
import base64
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
import uvicorn

from utils import ImagePreprocessor, AccuracyCalculator, validate_image, format_dl_fields
from ocr_engines import get_traditional_engine, get_vlm_engine
from database import save_result_async, get_all_results, get_result_by_id, get_accuracy_stats, ensure_directories

# HF Inference API used for VLM - set token if available
# set HF_TOKEN=your_huggingface_token  (in terminal before running)
ensure_directories()

app = FastAPI(title="DL OCR Comparison API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")
preprocessor = ImagePreprocessor()

@app.get("/", response_class=HTMLResponse)
async def root():
    return FileResponse("frontend/index.html")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/upload")
async def upload_and_process(file: UploadFile = File(...), ground_truth: Optional[str] = Form(None), use_vlm: bool = Form(True)):
    start_time = time.time()
    file_bytes = await file.read()
    file_size = len(file_bytes)
    is_valid, error_msg = validate_image(file_bytes)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    try:
        ground_truth_dict = json.loads(ground_truth) if ground_truth else {}
        preprocessed_img, original_img = preprocessor.preprocess(file_bytes)
        traditional_engine = get_traditional_engine()
        approach1_raw = traditional_engine.extract(preprocessed_img, original_img)
        approach1_fields = format_dl_fields(approach1_raw)
        approach2_fields = {k: '' for k in ['name','date_of_birth','issued_by','date_of_issue','date_of_expiry','license_number','address','blood_group','vehicle_class']}
        if use_vlm:
            try:
                vlm_image = preprocessor.preprocess_for_vlm(file_bytes)
                vlm_engine = get_vlm_engine()
                approach2_raw = vlm_engine.extract(vlm_image)
                approach2_fields = format_dl_fields(approach2_raw)
            except Exception as e:
                approach2_fields['error'] = str(e)
        accuracy_result = {"approach1": {"accuracy_percent": 0}, "approach2": {"accuracy_percent": 0}, "comparison": {"winner": "No ground truth"}}
        if ground_truth_dict:
            accuracy_result = AccuracyCalculator.compare_approaches(approach1_fields, approach2_fields, ground_truth_dict)
        processing_time_ms = int((time.time() - start_time) * 1000)
        import cv2
        _, buffer = cv2.imencode('.jpg', original_img)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        result_id = await save_result_async(file.filename, approach1_fields, approach2_fields, accuracy_result, ground_truth_dict or None, processing_time_ms, file_size)
        return {"success": True, "result_id": result_id, "image_name": file.filename, "image_base64": image_base64,
                "approach1": {"name": "Pytesseract (Traditional)", "fields": approach1_fields},
                "approach2": {"name": "VLM (HF API)", "fields": approach2_fields},
                "accuracy": accuracy_result, "processing_time_ms": processing_time_ms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/results")
async def get_results(limit: int = Query(50), offset: int = Query(0)):
    results = await get_all_results(limit, offset)
    return {"success": True, "count": len(results), "results": results}

@app.get("/results/{result_id}")
async def get_single_result(result_id: int):
    result = await get_result_by_id(result_id)
    if not result:
        raise HTTPException(status_code=404, detail="Not found")
    return {"success": True, "result": result}

@app.delete("/results/{result_id}")
async def delete_single_result(result_id: int):
    from database import delete_result
    success = await delete_result(result_id)
    if not success:
        raise HTTPException(status_code=404, detail="Result not found or could not be deleted")
    return {"success": True, "message": f"Result {result_id} deleted successfully"}

@app.get("/stats")
async def get_statistics():
    stats = await get_accuracy_stats()
    return {"success": True, "statistics": stats}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
