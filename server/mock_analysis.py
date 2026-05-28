#!/usr/bin/env python3
"""
Mochint AI Skin Analysis Model - Inference Script with Database Integration
Predicts skin conditions and retrieves relevant treatment recommendations from database
"""
import sys
import json
import base64
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from io import BytesIO
import os
import mysql.connector
from mysql.connector import Error
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
CLASS_NAMES = ['acne', 'blackheades', 'dark spots', 'pores', 'redness', 'wrinkles']

SKIN_TYPES = {
    0: 'Normal',
    1: 'Kering',
    2: 'Berminyak',
    3: 'Kombinasi',
    4: 'Sensitif'
}

SKIN_CONDITION_TRANSLATIONS = {
    'acne': 'Jerawat',
    'blackheades': 'Komedo',
    'dark spots': 'Bintik Hitam',
    'pores': 'Pori-pori',
    'redness': 'Kemerahan',
    'wrinkles': 'Kerutan'
}

# Keywords untuk matching treatments dengan conditions
CONDITION_KEYWORDS = {
    'acne': ['acne', 'jerawat', 'berjerawat'],
    'blackheades': ['komedo', 'pori', 'oil control', 'detox'],
    'dark spots': ['whitening', 'spot', 'flek', 'pigmentation'],
    'pores': ['pori', 'oil control', 'detox', 'komedo'],
    'redness': ['mesotherapy', 'mesotheraphy', 'nutrisi', 'serum'],
    'wrinkles': ['anti-aging', 'wrinkle', 'rf', 'lifting', 'tight']
}

CONDITION_TO_SKIN_TYPE = {
    'acne': 'Berminyak',
    'blackheades': 'Berminyak',
    'dark spots': 'Kering',
    'pores': 'Berminyak',
    'redness': 'Sensitif',
    'wrinkles': 'Kering'
}

# Model config
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models/mochint_model.pth')

# Database config
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'beauty_clinic',
    'port': 3306
}

# ===== DATABASE FUNCTIONS =====

def get_db_connection():
    """Create database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as err:
        logger.warning(f"Database connection error: {err}")
        return None

def get_recommendations_from_db(detected_condition):
    """
    Query database for treatment recommendations based on skin condition
    Matches treatment names and descriptions with condition keywords
    """
    try:
        connection = get_db_connection()
        if not connection:
            logger.warning(f"No database connection for condition: {detected_condition}")
            return []
        
        cursor = connection.cursor(dictionary=True)
        keywords = CONDITION_KEYWORDS.get(detected_condition, [])
        
        if not keywords:
            cursor.close()
            connection.close()
            return []
        
        # Build search query with keywords
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
        
        # Format recommendations (top 3)
        recommendations = []
        for treatment in treatments[:3]:
            recommendations.append({
                'id': treatment['id'],
                'treatment': treatment['name'],
                'reason': f"Treatment khusus untuk mengatasi {SKIN_CONDITION_TRANSLATIONS.get(detected_condition, detected_condition)}",
                'price': int(treatment['price']),
                'duration': treatment.get('duration', '60 min')
            })
        
        logger.info(f"Found {len(recommendations)} recommendations for {detected_condition}")
        return recommendations
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {str(e)}")
        return []

def get_fallback_recommendations(detected_condition):
    """Fallback recommendations if database is unavailable"""
    return [
        {
            "id": 1,
            "treatment": "Facial Treatment",
            "reason": f"Perawatan khusus untuk mengatasi {SKIN_CONDITION_TRANSLATIONS.get(detected_condition, detected_condition)}",
            "price": 150000,
            "duration": "60 min"
        },
        {
            "id": 2,
            "treatment": "Serum Treatment",
            "reason": "Memberikan nutrisi intensif sesuai kebutuhan kulit",
            "price": 200000,
            "duration": "45 min"
        },
        {
            "id": 3,
            "treatment": "Masker Premium",
            "reason": "Hidrasi mendalam untuk hasil optimal",
            "price": 75000,
            "duration": "30 min"
        }
    ]

# ===== MODEL FUNCTIONS =====

def load_model():
    """Load trained PyTorch model"""
    try:
        model = models.efficientnet_b0(weights=None)
        num_ftrs = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(num_ftrs, len(CLASS_NAMES))
        
        if not os.path.exists(MODEL_PATH):
            return None, f"Model file not found at: {MODEL_PATH}"
        
        model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
        model = model.to(DEVICE)
        model.eval()
        
        return model, None
    except Exception as e:
        return None, f"Error loading model: {str(e)}"

def preprocess_image(image_data):
    """Convert base64 image to tensor"""
    try:
        if isinstance(image_data, str):
            image_data = image_data.split(',')[-1]
        
        img_bytes = base64.b64decode(image_data)
        img = Image.open(BytesIO(img_bytes)).convert('RGB')
        
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        
        return transform(img).unsqueeze(0).to(DEVICE), None
    except Exception as e:
        return None, f"Error preprocessing image: {str(e)}"

def predict_skin_condition(model, image_tensor):
    """Run inference"""
    try:
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence, predicted_idx = torch.max(probabilities, 0)
        
        predicted_class = CLASS_NAMES[predicted_idx.item()]
        confidence_score = confidence.item()
        all_probs = probabilities.cpu().numpy()
        
        return {
            'detectedCondition': predicted_class,
            'conditionConfidence': round(confidence_score * 100, 2),
            'allProbabilities': {
                CLASS_NAMES[i]: round(float(all_probs[i]) * 100, 2) 
                for i in range(len(CLASS_NAMES))
            }
        }, None
    except Exception as e:
        return None, f"Error during inference: {str(e)}"

def detect_skin_type(detected_condition):
    """Detect skin type based on condition"""
    skin_type_name = CONDITION_TO_SKIN_TYPE.get(detected_condition, 'Normal')
    return skin_type_name

def get_skin_condition_details(detected_condition):
    """Return condition details"""
    return {
        'issue': detected_condition,
        'severity': 'sedang',
        'recommendation': f"Gunakan perawatan khusus untuk {SKIN_CONDITION_TRANSLATIONS.get(detected_condition, detected_condition)}"
    }

# ===== MAIN =====

def main():
    try:
        # Load model
        model, error = load_model()
        if error:
            response = {
                'success': False,
                'error': error,
                'detectedCondition': 'Unknown',
                'conditionConfidence': 0
            }
            print(json.dumps(response))
            return
        
        # Read image from stdin
        image_data = sys.stdin.read().strip()
        
        if not image_data:
            response = {
                'success': False,
                'error': 'No image data provided',
                'detectedCondition': 'Unknown',
                'conditionConfidence': 0
            }
            print(json.dumps(response))
            return
        
        # Preprocess image
        image_tensor, error = preprocess_image(image_data)
        if error:
            response = {
                'success': False,
                'error': error,
                'detectedCondition': 'Unknown',
                'conditionConfidence': 0
            }
            print(json.dumps(response))
            return
        
        # Run inference
        predictions, error = predict_skin_condition(model, image_tensor)
        if error:
            response = {
                'success': False,
                'error': error,
                'detectedCondition': 'Unknown',
                'conditionConfidence': 0
            }
            print(json.dumps(response))
            return
        
        # Build response
        detected_condition = predictions['detectedCondition']
        skin_type = detect_skin_type(detected_condition)
        
        # Get recommendations from database
        recommendations = get_recommendations_from_db(detected_condition)
        
        # Fallback if no recommendations found
        if not recommendations:
            recommendations = get_fallback_recommendations(detected_condition)
            logger.info(f"Using fallback recommendations for {detected_condition}")
        
        response = {
            'success': True,
            'skinType': skin_type,
            'confidence': 85,
            'detectedCondition': detected_condition,
            'conditionConfidence': predictions['conditionConfidence'],
            'skinCondition': [get_skin_condition_details(detected_condition)],
            'recommendations': recommendations,
            'allProbabilities': predictions['allProbabilities']
        }
        
        print(json.dumps(response))
        
    except Exception as e:
        response = {
            'success': False,
            'error': f"Unexpected error: {str(e)}",
            'detectedCondition': 'Unknown',
            'conditionConfidence': 0
        }
        print(json.dumps(response))

if __name__ == '__main__':
    main()
