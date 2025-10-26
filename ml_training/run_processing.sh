#!/bin/bash

# Script to process cleaned logs and send them to the backend API
# Usage: ./run_processing.sh [property_id]

# Default property ID (Elm Street property)
DEFAULT_PROPERTY_ID="36166bc6-cdcf-4425-ba52-e0d2cbaceb50"

# Use provided property ID or default
PROPERTY_ID=${1:-$DEFAULT_PROPERTY_ID}

echo "🚀 Starting log processing for property: $PROPERTY_ID"
echo "📁 Processing logs from: cleaned_logs/2025-10-25_18-26-52.json"
echo ""

# Run the Python script
python3 process_logs.py

echo ""
echo "✅ Processing complete!"
echo "🌐 Check your frontend at http://localhost:3005/ to see the new issues!"
