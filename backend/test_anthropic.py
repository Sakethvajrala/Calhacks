#!/usr/bin/env python3
"""
Test script for Anthropic image analysis integration.
This script demonstrates how to analyze property images using the Anthropic API.
"""

import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Anthropic API configuration
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

def analyze_property_image(image_url):
    """Analyze property image using Anthropic API"""
    try:
        headers = {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
        }
        
        # Create the message for image analysis
        message_content = [
            {
                "type": "text",
                "text": """Analyze this property image for potential issues and concerns. Look for:
                1. Structural problems (cracks, foundation issues, roof problems)
                2. Exterior damage (siding, paint, windows, doors)
                3. Safety hazards
                4. Maintenance issues
                5. Cosmetic problems
                
                For each issue found, provide:
                - Title (brief description)
                - Description (detailed explanation)
                - Priority level (Critical, High, Moderate, Low)
                - Category (Structural, Exterior, Safety, Maintenance, Cosmetic)
                - Concern level (1-10, where 10 is most critical)
                - Estimated repair cost range (low and high)
                
                Return the analysis in JSON format with an 'issues' array containing the above information for each issue found."""
            },
            {
                "type": "image",
                "source": {
                    "type": "url",
                    "url": image_url
                }
            }
        ]
        
        payload = {
            "model": "claude-3-5-sonnet-20241022",
            "max_tokens": 4000,
            "messages": [
                {
                    "role": "user",
                    "content": message_content
                }
            ]
        }
        
        print(f"Analyzing image: {image_url}")
        print("Sending request to Anthropic API...")
        
        response = requests.post(ANTHROPIC_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        
        result = response.json()
        analysis_text = result['content'][0]['text']
        
        print("Analysis completed!")
        print("=" * 50)
        print("RAW RESPONSE:")
        print(analysis_text)
        print("=" * 50)
        
        # Try to parse as JSON
        try:
            analysis = json.loads(analysis_text)
            print("PARSED JSON:")
            print(json.dumps(analysis, indent=2))
            return analysis
        except json.JSONDecodeError:
            print("Response is not valid JSON, treating as text analysis")
            return {
                'issues': [{
                    'title': 'Image Analysis Completed',
                    'description': analysis_text,
                    'priority': 'Moderate',
                    'category': 'General',
                    'concernLevel': 5,
                    'estimatedCostLow': 0,
                    'estimatedCostHigh': 0
                }]
            }
        
    except Exception as e:
        print(f"Error analyzing image: {str(e)}")
        return None

def main():
    """Main function to test Anthropic integration"""
    if not ANTHROPIC_API_KEY:
        print("Error: ANTHROPIC_API_KEY environment variable not set")
        print("Please set your Anthropic API key:")
        print("export ANTHROPIC_API_KEY='your-api-key-here'")
        return
    
    # Test with a sample property image
    test_image_url = "https://images.unsplash.com/photo-1560170412-0f7df0eb0fb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBob21lJTIwZXh0ZXJpb3J8ZW58MXx8fHwxNzYxMzE3NDM0fDA&ixlib=rb-4.1.0&q=80&w=1080"
    
    print("Testing Anthropic Image Analysis Integration")
    print("=" * 50)
    
    analysis = analyze_property_image(test_image_url)
    
    if analysis:
        print("\nAnalysis Results:")
        print(f"Found {len(analysis.get('issues', []))} issues")
        
        for i, issue in enumerate(analysis.get('issues', []), 1):
            print(f"\nIssue {i}:")
            print(f"  Title: {issue.get('title', 'N/A')}")
            print(f"  Priority: {issue.get('priority', 'N/A')}")
            print(f"  Category: {issue.get('category', 'N/A')}")
            print(f"  Concern Level: {issue.get('concernLevel', 'N/A')}/10")
            print(f"  Cost Range: ${issue.get('estimatedCostLow', 0):,} - ${issue.get('estimatedCostHigh', 0):,}")
            print(f"  Description: {issue.get('description', 'N/A')[:100]}...")
    else:
        print("Analysis failed")

if __name__ == "__main__":
    main()
