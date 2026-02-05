"""
Test Script for DL OCR Comparison System
=========================================
Includes sample ground truth data and test utilities.
"""

import requests
import json
import os
import time

# API Base URL
BASE_URL = "http://localhost:8000"

# Sample ground truth for testing
# These represent typical Indian Driving License fields
SAMPLE_GROUND_TRUTHS = {
    "sample1": {
        "name": "Rajinder Singh",
        "date_of_birth": "15-08-1985",
        "license_number": "PB-02-20210012345",
        "issued_by": "RTO Ludhiana",
        "date_of_issue": "01-01-2021",
        "date_of_expiry": "14-08-2035",
        "blood_group": "B+",
        "vehicle_class": "LMV, MCWG"
    },
    "sample2": {
        "name": "Priya Sharma",
        "date_of_birth": "22-03-1992",
        "license_number": "DL-1420210056789",
        "issued_by": "RTO South Delhi",
        "date_of_issue": "15-06-2021",
        "date_of_expiry": "21-03-2042",
        "blood_group": "O+",
        "vehicle_class": "LMV"
    },
    "sample3": {
        "name": "Gurpreet Kaur",
        "date_of_birth": "10-12-1988",
        "license_number": "PB-08-20190034567",
        "issued_by": "RTO Amritsar",
        "date_of_issue": "20-02-2019",
        "date_of_expiry": "09-12-2038",
        "blood_group": "A-",
        "vehicle_class": "MCWG, LMV, TRANS"
    }
}


def test_health_check():
    """Test the health check endpoint."""
    print("Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✓ Health check passed")
            print(f"  Response: {response.json()}")
            return True
        else:
            print(f"✗ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to server. Is it running?")
        return False


def test_upload_image(image_path: str, ground_truth_key: str = None):
    """
    Test uploading an image for OCR processing.
    
    Args:
        image_path: Path to the DL image file
        ground_truth_key: Key from SAMPLE_GROUND_TRUTHS for accuracy calculation
    """
    if not os.path.exists(image_path):
        print(f"✗ Image file not found: {image_path}")
        return None
    
    print(f"\nTesting upload: {image_path}")
    
    # Prepare form data
    files = {'file': open(image_path, 'rb')}
    data = {'use_vlm': 'true'}
    
    if ground_truth_key and ground_truth_key in SAMPLE_GROUND_TRUTHS:
        data['ground_truth'] = json.dumps(SAMPLE_GROUND_TRUTHS[ground_truth_key])
    
    try:
        start = time.time()
        response = requests.post(f"{BASE_URL}/upload", files=files, data=data)
        elapsed = time.time() - start
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Upload successful ({elapsed:.2f}s)")
            print(f"  Result ID: {result.get('result_id')}")
            print(f"  Processing time: {result.get('processing_time_ms')}ms")
            
            # Print extracted fields
            print("\n  Approach 1 (Traditional OCR):")
            for field, value in result['approach1']['fields'].items():
                if value:
                    print(f"    {field}: {value}")
            
            print("\n  Approach 2 (VLM OCR):")
            for field, value in result['approach2']['fields'].items():
                if value:
                    print(f"    {field}: {value}")
            
            # Print accuracy comparison
            if result.get('accuracy', {}).get('comparison'):
                comp = result['accuracy']['comparison']
                print(f"\n  Accuracy Comparison:")
                print(f"    Approach 1: {comp.get('approach1_score', 0)*100:.1f}%")
                print(f"    Approach 2: {comp.get('approach2_score', 0)*100:.1f}%")
                print(f"    Winner: {comp.get('winner', 'N/A')}")
            
            return result
        else:
            print(f"✗ Upload failed: {response.status_code}")
            print(f"  Error: {response.json().get('detail', 'Unknown error')}")
            return None
            
    except Exception as e:
        print(f"✗ Error during upload: {e}")
        return None


def test_get_results():
    """Test getting past results."""
    print("\nTesting get results...")
    try:
        response = requests.get(f"{BASE_URL}/results?limit=5")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Got {data['count']} results")
            for result in data.get('results', [])[:3]:
                print(f"  - {result.get('image_name')} ({result.get('timestamp')})")
            return True
        else:
            print(f"✗ Failed to get results: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def test_get_stats():
    """Test getting accuracy statistics."""
    print("\nTesting get statistics...")
    try:
        response = requests.get(f"{BASE_URL}/stats")
        if response.status_code == 200:
            stats = response.json().get('statistics', {})
            print(f"✓ Statistics retrieved")
            print(f"  Total processed: {stats.get('total_processed', 0)}")
            print(f"  Avg Approach 1: {stats.get('average_accuracy', {}).get('approach1', 0):.1f}%")
            print(f"  Avg Approach 2: {stats.get('average_accuracy', {}).get('approach2', 0):.1f}%")
            wins = stats.get('wins', {})
            print(f"  Wins: A1={wins.get('approach1', 0)}, A2={wins.get('approach2', 0)}, Tie={wins.get('ties', 0)}")
            return True
        else:
            print(f"✗ Failed to get stats: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def run_all_tests():
    """Run all tests."""
    print("=" * 60)
    print("DL OCR Comparison System - Test Suite")
    print("=" * 60)
    
    # Test health
    if not test_health_check():
        print("\n⚠ Server not running. Start with: python main.py")
        return
    
    # Test stats
    test_get_stats()
    
    # Test results
    test_get_results()
    
    # Test upload if sample images exist
    sample_images = [
        "samples/sample_dl_1.jpg",
        "samples/sample_dl_2.png",
        "test_dl.jpg"
    ]
    
    for img_path in sample_images:
        if os.path.exists(img_path):
            test_upload_image(img_path, "sample1")
            break
    else:
        print("\n⚠ No sample images found. Create 'samples/' directory with test DL images.")
        print("  Or place 'test_dl.jpg' in the project root.")
    
    print("\n" + "=" * 60)
    print("Test suite completed")
    print("=" * 60)


if __name__ == "__main__":
    run_all_tests()
