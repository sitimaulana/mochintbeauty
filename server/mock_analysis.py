#!/usr/bin/env python3
"""
AI Skin Analysis API Handler - HYBRID MODEL
Combines:
1. Skin Type detection (from color analysis)
2. Skin Condition detection (from your trained model)
3. Treatment recommendations (from database)
"""

import sys
import json
import traceback
import os

# Add current directory to path to import skin_analysis
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

# Import from skin_analysis (hybrid approach)
from skin_analysis import (
    load_condition_model,
    preprocess_image,
    predict_skin_condition,
    classify_skin_by_color,
    detect_skin_conditions,
    generate_recommendations,
    SKIN_TYPES,
    CONDITION_NAMES
)

def main():
    try:
        # Read base64 image from stdin
        image_data = sys.stdin.read()
        if not image_data:
            print(json.dumps({"error": "No input received"}))
            sys.exit(1)

        # Preprocess image ONCE
        try:
            image_tensor = preprocess_image(image_data)
        except Exception as e:
            print(json.dumps({"error": f"Image preprocessing failed: {str(e)}"}))
            sys.exit(1)
        
        # ===== HYBRID ANALYSIS =====
        
        # 1. DETERMINE SKIN TYPE (from color analysis)
        skin_type_idx, skin_type_confidence = classify_skin_by_color(image_tensor)
        skin_type = SKIN_TYPES.get(skin_type_idx, 'Normal')
        
        # 2. DETECT SKIN CONDITION (from your trained model)
        condition_detected = None
        condition_confidence = 0
        condition_model = load_condition_model()
        
        if condition_model is not None:
            try:
                condition_detected, condition_confidence = predict_skin_condition(condition_model, image_tensor)
            except Exception as e:
                print(f"Condition detection fallback: {str(e)}", file=sys.stderr)
                condition_detected = None
        
        # 3. BUILD SKIN CONDITIONS LIST
        if condition_detected:
            # Primary: Detected condition from model
            skin_conditions = [
                {
                    'issue': condition_detected.replace('_', ' ').title(),
                    'severity': 'sedang' if condition_confidence > 70 else 'ringan'
                }
            ]
            # Secondary: Add skin type related conditions
            type_conditions = detect_skin_conditions(skin_type)
            if type_conditions:
                skin_conditions.append(type_conditions[0])
        else:
            # Fallback: Use skin type conditions
            skin_conditions = detect_skin_conditions(skin_type)
        
        # 4. GET RECOMMENDATIONS (from database)
        recommendations = generate_recommendations(skin_type)
        
        # 5. BUILD RESPONSE
        result = {
            "skinType": skin_type,
            "confidence": round(skin_type_confidence, 0),
            "detectedCondition": condition_detected if condition_detected else "Unknown",
            "conditionConfidence": round(condition_confidence, 0),
            "skinCondition": skin_conditions,
            "recommendations": recommendations,
            "analysisType": "hybrid",
            "analysisTimestamp": __import__('datetime').datetime.now().isoformat()
        }
        
        print(json.dumps(result, ensure_ascii=False))
        sys.exit(0)
        
    except Exception as e:
        print(json.dumps({
            "error": f"Unexpected error: {str(e)}",
            "traceback": traceback.format_exc()
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
