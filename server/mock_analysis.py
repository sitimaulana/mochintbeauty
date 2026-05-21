#!/usr/bin/env python3
"""
AI Skin Analysis API Handler
Processes base64 image from stdin and returns analysis results
"""

import sys
import json
import traceback
import os

# Add current directory to path to import skin_analysis
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

# Import from skin_analysis
from skin_analysis import (
    load_model, 
    preprocess_image, 
    analyze_skin, 
    classify_skin_by_color,
    generate_recommendations,
    detect_skin_conditions,
    SKIN_TYPES
)

def main():
    try:
        # Read base64 image from stdin
        image_data = sys.stdin.read()
        if not image_data:
            print(json.dumps({"error": "No input received"}))
            sys.exit(1)

        # Load model
        model = load_model()
        if model is None:
            # If model loading fails, use color-based classification
            print(json.dumps({
                "warning": "Model not available, using color classification",
                "usingFallback": True
            }), file=sys.stderr)
            
            # Use color-based analysis
            try:
                image_tensor = preprocess_image(image_data)
                skin_type_idx, confidence = classify_skin_by_color(image_tensor)
            except Exception as e:
                print(json.dumps({"error": f"Image preprocessing failed: {str(e)}"}))
                sys.exit(1)
        else:
            # Preprocess image
            try:
                image_tensor = preprocess_image(image_data)
            except Exception as e:
                print(json.dumps({"error": f"Image preprocessing failed: {str(e)}"}))
                sys.exit(1)
            
            # Analyze with model
            try:
                skin_type_idx, confidence = analyze_skin(model, image_tensor)
            except Exception as e:
                print(json.dumps({"error": f"Analysis failed: {str(e)}"}))
                sys.exit(1)
        
        # Get skin type name
        skin_type = SKIN_TYPES.get(skin_type_idx, 'Normal')
        
        # Generate conditions and recommendations
        skin_conditions = detect_skin_conditions(skin_type)
        recommendations = generate_recommendations(skin_type)
        
        # Return result
        result = {
            "skinType": skin_type,
            "confidence": round(confidence, 0),
            "skinCondition": skin_conditions,
            "recommendations": recommendations,
            "analysisTimestamp": __import__('datetime').datetime.now().isoformat()
        }
        
        print(json.dumps(result))
        sys.exit(0)
        
    except Exception as e:
        print(json.dumps({
            "error": f"Unexpected error: {str(e)}",
            "traceback": traceback.format_exc()
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
