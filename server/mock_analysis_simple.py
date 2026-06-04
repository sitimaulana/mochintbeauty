#!/usr/bin/env python3
"""
Simple Mock AI Skin Analysis - No external ML dependencies
Returns mock analysis results for testing
"""
import sys
import json
import base64
import random
from io import BytesIO

# Skin condition keywords for recommendations
CONDITION_KEYWORDS = {
    'acne': ['acne', 'jerawat', 'berjerawat', 'spot treatment', 'extraction'],
    'blackheades': ['komedo', 'pori', 'oil control', 'detox', 'blackhead'],
    'dark spots': ['whitening', 'spot', 'flek', 'pigmentation', 'brightening'],
    'pores': ['pori', 'oil control', 'detox', 'komedo', 'pore minimizer'],
    'redness': ['mesotherapy', 'mesotheraphy', 'nutrisi', 'serum', 'calming'],
    'wrinkles': ['anti-aging', 'wrinkle', 'rf', 'lifting', 'tight', 'firming']
}

CONDITION_TO_SKIN_TYPE = {
    'acne': 'Berminyak',
    'blackheades': 'Berminyak',
    'dark spots': 'Kering',
    'pores': 'Berminyak',
    'redness': 'Sensitif',
    'wrinkles': 'Kering'
}

SKIN_CONDITION_TRANSLATIONS = {
    'acne': 'Jerawat',
    'blackheades': 'Komedo',
    'dark spots': 'Bintik Hitam',
    'pores': 'Pori-pori',
    'redness': 'Kemerahan',
    'wrinkles': 'Kerutan'
}

CONDITIONS = list(CONDITION_KEYWORDS.keys())

def get_mock_recommendations(detected_condition):
    """Return mock treatment recommendations"""
    return [
        {
            'id': 1,
            'name': f'{SKIN_CONDITION_TRANSLATIONS.get(detected_condition, detected_condition)} Treatment',
            'description': f'Professional treatment for {SKIN_CONDITION_TRANSLATIONS.get(detected_condition, detected_condition)}',
            'price': 500000,
            'duration': 60,
            'category': 'Facial Treatment'
        },
        {
            'id': 2,
            'name': f'{SKIN_CONDITION_TRANSLATIONS.get(detected_condition, detected_condition)} Serum',
            'description': f'Specialized serum for {SKIN_CONDITION_TRANSLATIONS.get(detected_condition, detected_condition)}',
            'price': 250000,
            'duration': 0,
            'category': 'Product'
        }
    ]

def main():
    try:
        # Read image data from stdin
        image_b64 = sys.stdin.read().strip()
        
        if not image_b64:
            response = {
                'success': False,
                'error': 'No image data provided'
            }
            print(json.dumps(response))
            return
        
        # Randomly select a skin condition for demo
        detected_condition = random.choice(CONDITIONS)
        skin_type = CONDITION_TO_SKIN_TYPE.get(detected_condition, 'Normal')
        
        # Generate mock analysis
        response = {
            'success': True,
            'skinType': skin_type,
            'confidence': random.randint(75, 95),
            'detectedCondition': detected_condition,
            'conditionConfidence': random.randint(70, 92),
            'skinCondition': [
                {
                    'issue': detected_condition,
                    'severity': random.choice(['ringan', 'sedang', 'berat']),
                    'recommendation': f"Gunakan perawatan khusus untuk {SKIN_CONDITION_TRANSLATIONS.get(detected_condition, detected_condition)}"
                }
            ],
            'recommendations': get_mock_recommendations(detected_condition),
            'allProbabilities': {
                'acne': random.randint(10, 25),
                'blackheades': random.randint(10, 25),
                'dark spots': random.randint(10, 25),
                'pores': random.randint(10, 25),
                'redness': random.randint(10, 25),
                'wrinkles': random.randint(10, 25),
            },
            'analysisType': 'mock',
            'analysisTimestamp': None
        }
        
        print(json.dumps(response))
        
    except Exception as e:
        response = {
            'success': False,
            'error': str(e)
        }
        print(json.dumps(response))
        sys.exit(1)

if __name__ == '__main__':
    main()
