"""
Database Module for DL OCR Project
====================================
Handles storage of OCR results in both SQLite and JSON formats.
Provides persistence and querying of past uploads.
"""

import sqlite3
import json
import os
from datetime import datetime
from typing import Dict, List, Optional
import aiosqlite
import asyncio
from pathlib import Path

# Paths
DB_PATH = "./results/ocr_results.db"
JSON_RESULTS_DIR = "./results/json"


def ensure_directories():
    """Ensure required directories exist."""
    Path("./results").mkdir(exist_ok=True)
    Path(JSON_RESULTS_DIR).mkdir(exist_ok=True)
    Path("./uploads").mkdir(exist_ok=True)


def init_database():
    """Initialize SQLite database with required tables."""
    ensure_directories()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create main results table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ocr_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image_name TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            
            -- Approach 1 Fields (Traditional OCR)
            approach1_name TEXT,
            approach1_dob TEXT,
            approach1_issued_by TEXT,
            approach1_doi TEXT,
            approach1_doe TEXT,
            approach1_license_number TEXT,
            approach1_address TEXT,
            approach1_blood_group TEXT,
            approach1_vehicle_class TEXT,
            approach1_raw_json TEXT,
            
            -- Approach 2 Fields (VLM OCR)
            approach2_name TEXT,
            approach2_dob TEXT,
            approach2_issued_by TEXT,
            approach2_doi TEXT,
            approach2_doe TEXT,
            approach2_license_number TEXT,
            approach2_address TEXT,
            approach2_blood_group TEXT,
            approach2_vehicle_class TEXT,
            approach2_raw_json TEXT,
            
            -- Accuracy Metrics
            approach1_accuracy REAL,
            approach2_accuracy REAL,
            winner TEXT,
            accuracy_details_json TEXT,
            
            -- Ground Truth (if provided)
            ground_truth_json TEXT,
            
            -- Metadata
            processing_time_ms INTEGER,
            image_size_bytes INTEGER,
            error_message TEXT
        )
    ''')
    
    # Create index for faster queries
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_timestamp ON ocr_results(timestamp)
    ''')
    
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_image_name ON ocr_results(image_name)
    ''')
    
    conn.commit()
    conn.close()


async def save_result_async(
    image_name: str,
    approach1_fields: Dict[str, str],
    approach2_fields: Dict[str, str],
    accuracy_result: Dict,
    ground_truth: Optional[Dict[str, str]] = None,
    processing_time_ms: int = 0,
    image_size_bytes: int = 0,
    error_message: Optional[str] = None
) -> int:
    """
    Save OCR result to database asynchronously.
    
    Returns:
        Record ID of the saved result
    """
    ensure_directories()
    
    timestamp = datetime.now().isoformat()
    
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute('''
            INSERT INTO ocr_results (
                image_name, timestamp,
                approach1_name, approach1_dob, approach1_issued_by,
                approach1_doi, approach1_doe, approach1_license_number,
                approach1_address, approach1_blood_group, approach1_vehicle_class,
                approach1_raw_json,
                approach2_name, approach2_dob, approach2_issued_by,
                approach2_doi, approach2_doe, approach2_license_number,
                approach2_address, approach2_blood_group, approach2_vehicle_class,
                approach2_raw_json,
                approach1_accuracy, approach2_accuracy, winner,
                accuracy_details_json, ground_truth_json,
                processing_time_ms, image_size_bytes, error_message
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            image_name, timestamp,
            approach1_fields.get('name', ''),
            approach1_fields.get('date_of_birth', ''),
            approach1_fields.get('issued_by', ''),
            approach1_fields.get('date_of_issue', ''),
            approach1_fields.get('date_of_expiry', ''),
            approach1_fields.get('license_number', ''),
            approach1_fields.get('address', ''),
            approach1_fields.get('blood_group', ''),
            approach1_fields.get('vehicle_class', ''),
            json.dumps(approach1_fields),
            approach2_fields.get('name', ''),
            approach2_fields.get('date_of_birth', ''),
            approach2_fields.get('issued_by', ''),
            approach2_fields.get('date_of_issue', ''),
            approach2_fields.get('date_of_expiry', ''),
            approach2_fields.get('license_number', ''),
            approach2_fields.get('address', ''),
            approach2_fields.get('blood_group', ''),
            approach2_fields.get('vehicle_class', ''),
            json.dumps(approach2_fields),
            accuracy_result.get('approach1', {}).get('accuracy_percent', 0),
            accuracy_result.get('approach2', {}).get('accuracy_percent', 0),
            accuracy_result.get('comparison', {}).get('winner', 'Unknown'),
            json.dumps(accuracy_result),
            json.dumps(ground_truth) if ground_truth else None,
            processing_time_ms,
            image_size_bytes,
            error_message
        ))
        
        await db.commit()
        result_id = cursor.lastrowid
    
    # Also save to JSON file
    await save_result_json(
        result_id=result_id,
        image_name=image_name,
        timestamp=timestamp,
        approach1_fields=approach1_fields,
        approach2_fields=approach2_fields,
        accuracy_result=accuracy_result,
        ground_truth=ground_truth
    )
    
    return result_id


async def save_result_json(
    result_id: int,
    image_name: str,
    timestamp: str,
    approach1_fields: Dict[str, str],
    approach2_fields: Dict[str, str],
    accuracy_result: Dict,
    ground_truth: Optional[Dict[str, str]] = None
):
    """Save result as individual JSON file."""
    ensure_directories()
    
    result = {
        "id": result_id,
        "image_name": image_name,
        "timestamp": timestamp,
        "approach1": approach1_fields,
        "approach2": approach2_fields,
        "accuracy": accuracy_result,
        "ground_truth": ground_truth
    }
    
    # Create filename with timestamp
    safe_name = "".join(c for c in image_name if c.isalnum() or c in "._-")
    filename = f"{result_id}_{safe_name}_{timestamp.replace(':', '-')[:19]}.json"
    filepath = os.path.join(JSON_RESULTS_DIR, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)


async def get_all_results(limit: int = 100, offset: int = 0) -> List[Dict]:
    """
    Retrieve all OCR results from database.
    
    Args:
        limit: Maximum number of results to return
        offset: Number of results to skip
        
    Returns:
        List of result dictionaries
    """
    ensure_directories()
    
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute('''
            SELECT * FROM ocr_results
            ORDER BY timestamp DESC
            LIMIT ? OFFSET ?
        ''', (limit, offset))
        
        rows = await cursor.fetchall()
        
        results = []
        for row in rows:
            results.append(dict(row))
        
        return results


async def get_result_by_id(result_id: int) -> Optional[Dict]:
    """Get a specific result by ID."""
    ensure_directories()
    
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            'SELECT * FROM ocr_results WHERE id = ?',
            (result_id,)
        )
        
        row = await cursor.fetchone()
        
        if row:
            return dict(row)
        return None


async def search_results(
    image_name: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> List[Dict]:
    """Search results with filters."""
    ensure_directories()
    
    query = "SELECT * FROM ocr_results WHERE 1=1"
    params = []
    
    if image_name:
        query += " AND image_name LIKE ?"
        params.append(f"%{image_name}%")
    
    if start_date:
        query += " AND timestamp >= ?"
        params.append(start_date)
    
    if end_date:
        query += " AND timestamp <= ?"
        params.append(end_date)
    
    query += " ORDER BY timestamp DESC"
    
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        
        return [dict(row) for row in rows]


async def get_accuracy_stats() -> Dict:
    """Get aggregate accuracy statistics."""
    ensure_directories()
    
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute('''
            SELECT 
                COUNT(*) as total_processed,
                AVG(approach1_accuracy) as avg_approach1,
                AVG(approach2_accuracy) as avg_approach2,
                SUM(CASE WHEN winner LIKE '%Approach 1%' THEN 1 ELSE 0 END) as approach1_wins,
                SUM(CASE WHEN winner LIKE '%Approach 2%' THEN 1 ELSE 0 END) as approach2_wins,
                SUM(CASE WHEN winner = 'Tie' THEN 1 ELSE 0 END) as ties,
                AVG(processing_time_ms) as avg_processing_time
            FROM ocr_results
            WHERE error_message IS NULL
        ''')
        
        row = await cursor.fetchone()
        
        if row:
            return {
                "total_processed": row[0] or 0,
                "average_accuracy": {
                    "approach1": round(row[1] or 0, 2),
                    "approach2": round(row[2] or 0, 2)
                },
                "wins": {
                    "approach1": row[3] or 0,
                    "approach2": row[4] or 0,
                    "ties": row[5] or 0
                },
                "average_processing_time_ms": round(row[6] or 0, 2)
            }
        
        return {
            "average_processing_time_ms": 0
        }


async def delete_result(result_id: int) -> bool:
    """Delete a result by ID."""
    ensure_directories()
    
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            cursor = await db.execute('DELETE FROM ocr_results WHERE id = ?', (result_id,))
            await db.commit()
            return cursor.rowcount > 0
    except Exception as e:
        print(f"Error deleting result {result_id}: {e}")
        return False


# Initialize database on module import
init_database()
