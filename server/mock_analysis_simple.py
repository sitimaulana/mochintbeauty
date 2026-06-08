#!/usr/bin/env python3
"""
Simple Mock AI Skin Analysis - No external ML dependencies
Returns mock analysis results for testing
"""
import sys
import json
import base64
import random
import os
from io import BytesIO

# Try to import mysql.connector for database integration
try:
    import mysql.connector
    from mysql.connector import Error
    MYSQL_AVAILABLE = True
except ImportError:
    MYSQL_AVAILABLE = False

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

def get_recommendations_from_db(detected_condition):
    """Query database for treatment recommendations based on skin condition"""
    if not MYSQL_AVAILABLE:
        return []
    try:
        host = os.environ.get('DB_HOST', 'localhost')
        user = os.environ.get('DB_USER', 'root')
        password = os.environ.get('DB_PASSWORD', '')
        database = os.environ.get('DB_NAME', 'beauty_clinic')
        port = int(os.environ.get('DB_PORT', 3306))
        
        connection = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            port=port
        )
        cursor = connection.cursor(dictionary=True)
        keywords = CONDITION_KEYWORDS.get(detected_condition, [])
        if not keywords:
            cursor.close()
            connection.close()
            return []
            
        search_parts = []
        for keyword in keywords:
            search_parts.append(f"LOWER(name) LIKE '%{keyword}%'")
            search_parts.append(f"LOWER(description) LIKE '%{keyword}%'")
        
        where_clause = " OR ".join(search_parts)
        
        query = f"""
            SELECT DISTINCT id, name, price, description, duration
            FROM treatments 
            WHERE {where_clause}
            ORDER BY price ASC
            LIMIT 5
        """
        
        cursor.execute(query)
        treatments = cursor.fetchall()
        cursor.close()
        connection.close()
        
        recommendations = []
        for treatment in treatments[:3]:
            recommendations.append({
                'id': treatment['id'],
                'treatment': treatment['name'],
                'reason': f"Treatment khusus untuk mengatasi {SKIN_CONDITION_TRANSLATIONS.get(detected_condition, detected_condition)}",
                'price': int(treatment['price']),
                'duration': treatment.get('duration', '60 min')
            })
        return recommendations
    except Exception as e:
        # Fallback silently on any DB error
        return []

def get_mock_recommendations(detected_condition):
    """Return mock treatment recommendations with keys matching React frontend"""
    return [
        {
            'id': 1,
            'treatment': f'{SKIN_CONDITION_TRANSLATIONS.get(detected_condition, detected_condition)} Treatment',
            'reason': f'Professional treatment for {SKIN_CONDITION_TRANSLATIONS.get(detected_condition, detected_condition)}',
            'price': 500000,
            'duration': 60,
            'category': 'Facial Treatment'
        },
        {
            'id': 2,
            'treatment': f'{SKIN_CONDITION_TRANSLATIONS.get(detected_condition, detected_condition)} Serum',
            'reason': f'Specialized serum for {SKIN_CONDITION_TRANSLATIONS.get(detected_condition, detected_condition)}',
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
        
        # Get recommendations (database query with fallback to mock data)
        recommendations = get_recommendations_from_db(detected_condition)
        if not recommendations:
            recommendations = get_mock_recommendations(detected_condition)
            
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
            'recommendations': recommendations,
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
