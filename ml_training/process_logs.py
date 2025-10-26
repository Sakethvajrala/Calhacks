#!/usr/bin/env python3
"""
Script to process cleaned logs and send them to the analyze-image API.
This script reads the cleaned logs JSON file and sends each entry to the backend API.
"""

import json
import requests
import base64
import os
import time
from typing import Dict, List, Any

# Configuration
API_BASE_URL = "http://127.0.0.1:8000"
PROPERTY_ID = "36166bc6-cdcf-4425-ba52-e0d2cbaceb50"  # Your Elm Street property
LOGS_FILE = "/Users/saketh/Desktop/Calhacks/ml_training/cleaned_logs/2025-10-25_18-26-52.json"

def load_cleaned_logs(file_path: str) -> List[Dict[str, Any]]:
    """Load the cleaned logs from JSON file."""
    try:
        with open(file_path, 'r') as f:
            logs = json.load(f)
        print(f"✅ Loaded {len(logs)} log entries from {file_path}")
        return logs
    except FileNotFoundError:
        print(f"❌ Error: File not found: {file_path}")
        return []
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON in file: {e}")
        return []

def save_image_from_base64(base64_data: str, output_path: str) -> bool:
    """Save base64 image data to a file."""
    try:
        # Remove data URL prefix if present
        if base64_data.startswith('data:image'):
            base64_data = base64_data.split(',')[1]
        
        # Decode base64 data
        image_data = base64.b64decode(base64_data)
        
        # Save to file
        with open(output_path, 'wb') as f:
            f.write(image_data)
        
        print(f"✅ Saved image to: {output_path}")
        return True
    except Exception as e:
        print(f"❌ Error saving image: {e}")
        return False

def call_analyze_image_api(property_id: str, timestamp: str, detections: List[Dict], image_path: str) -> Dict[str, Any]:
    """Call the analyze-image API with the provided data."""
    url = f"{API_BASE_URL}/api/analyze-image/"
    
    payload = {
        "property_id": property_id,
        "timestamp": timestamp,
        "detections": detections,
        "image_path": image_path
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        print(f"🔍 Analyzing image: {image_path}")
        print(f"📊 Detections: {len(detections)} objects found")
        
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        print(f"✅ API Response: {result.get('success', False)}")
        if result.get('success'):
            print(f"📋 Issues created: {len(result.get('data', []))}")
        else:
            print(f"❌ API Error: {result.get('error', 'Unknown error')}")
        
        return result
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return {"success": False, "error": str(e)}
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return {"success": False, "error": str(e)}

def process_logs():
    """Main function to process all logs."""
    print("🚀 Starting log processing...")
    
    # Load the cleaned logs
    logs = load_cleaned_logs(LOGS_FILE)
    if not logs:
        print("❌ No logs to process")
        return
    
    # Create output directory for images
    output_dir = "/Users/saketh/Desktop/Calhacks/ml_training/processed_images"
    os.makedirs(output_dir, exist_ok=True)
    
    successful_requests = 0
    failed_requests = 0
    
    # Process each log entry
    for i, log_entry in enumerate(logs):
        print(f"\n📝 Processing log entry {i+1}/{len(logs)}")
        print(f"⏰ Timestamp: {log_entry.get('timestamp', 'N/A')}")
        
        # Extract data from log entry
        timestamp = log_entry.get('timestamp', '')
        detections = log_entry.get('detections', [])
        image_base64 = log_entry.get('image_base64', '')
        
        if not image_base64:
            print("⚠️  No image data found, skipping...")
            failed_requests += 1
            continue
        
        # Save image to file
        image_filename = f"frame_{i+1:06d}.jpg"
        image_path = os.path.join(output_dir, image_filename)
        
        if not save_image_from_base64(image_base64, image_path):
            print("⚠️  Failed to save image, skipping...")
            failed_requests += 1
            continue
        
        # Call the API with the full file path
        result = call_analyze_image_api(
            property_id=PROPERTY_ID,
            timestamp=timestamp,
            detections=detections,
            image_path=image_path
        )
        
        if result.get('success'):
            successful_requests += 1
        else:
            failed_requests += 1
        
        # Add a small delay to avoid overwhelming the API
        time.sleep(1)
    
    # Summary
    print(f"\n📊 Processing complete!")
    print(f"✅ Successful requests: {successful_requests}")
    print(f"❌ Failed requests: {failed_requests}")
    print(f"📁 Images saved to: {output_dir}")
    
    if successful_requests > 0:
        print(f"\n🎉 Check your frontend at http://localhost:3005/ to see the new issues!")

if __name__ == "__main__":
    process_logs()