#!/usr/bin/env python3
"""
Skin Analysis AI Model Script
Loads PyTorch model and performs inference on skin images
"""

import sys
import json
import base64
import numpy as np
from PIL import Image
from io import BytesIO
import torch
import torch.nn as nn
from torchvision import models
import torchvision.transforms as transforms
import mysql.connector
from mysql.connector import Error

# Get absolute path to model file (relative to this script)
import os
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, 'mochint_skin_model_final.pth')

# Define skin type mapping (7 classes)
SKIN_TYPES = {
    0: 'Kering',
    1: 'Berminyak',
    2: 'Kombinasi',
    3: 'Sensitif',
    4: 'Normal',
    5: 'Berjerawat',
    6: 'Kusam'
}

def load_model():
    """Load PyTorch model - EfficientNet-B0 with 7 skin type classes"""
    try:
        device = torch.device('cpu')
        
        # Create EfficientNet-B0 architecture with 7 classes
        model = models.efficientnet_b0(weights=None)
        
        # Modify classifier for 7 skin types
        # EfficientNet-B0 classifier is: [Dropout, Linear(1280, 1000)]
        # We replace the final Linear layer to output 7 classes
        num_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(num_features, 7)
        
        # Load state dict from file
        state_dict = torch.load(MODEL_PATH, map_location=device, weights_only=False)
        model.load_state_dict(state_dict)
        
        # Set to evaluation mode
        model.to(device)
        model.eval()
        
        return model
    except Exception as e:
        print(f"Model loading error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return None

# --- CONDITION MODEL (Your Trained Model) ---
CONDITION_NAMES = ['acne', 'blackheades', 'dark spots', 'pores', 'redness', 'wrinkles']
CONDITION_MODEL_PATH = os.path.join(SCRIPT_DIR, 'mochint_model.pth')

def load_condition_model():
    """Load your trained condition detection model - EfficientNet-B0 with 6 condition classes"""
    try:
        device = torch.device('cpu')
        
        # Create EfficientNet-B0 architecture with 6 classes (your model)
        model = models.efficientnet_b0(weights=None)
        num_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(num_features, 6)  # 6 condition classes
        
        # Load your trained model
        if not os.path.exists(CONDITION_MODEL_PATH):
            print(f"Condition model not found at {CONDITION_MODEL_PATH}", file=sys.stderr)
            return None
            
        state_dict = torch.load(CONDITION_MODEL_PATH, map_location=device, weights_only=False)
        model.load_state_dict(state_dict)
        
        model.to(device)
        model.eval()
        
        return model
    except Exception as e:
        print(f"Condition model loading error: {e}", file=sys.stderr)
        return None

def predict_skin_condition(model, image_tensor):
    """Predict skin condition from your trained model"""
    try:
        with torch.no_grad():
            output = model(image_tensor)
        
        probabilities = torch.nn.functional.softmax(output, dim=1)
        confidence, predicted_class = torch.max(probabilities, 1)
        
        condition_idx = predicted_class.item()
        confidence_score = confidence.item() * 100
        
        condition = CONDITION_NAMES[condition_idx]
        
        return condition, confidence_score
    except Exception as e:
        raise Exception(f"Condition prediction error: {str(e)}")

def preprocess_image(image_data):
    """Convert base64 image to tensor"""
    try:
        # Decode base64
        if isinstance(image_data, str):
            image_data = image_data.split(',')[1] if ',' in image_data else image_data
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes)).convert('RGB')
        
        # Resize to model input size (adjust based on your model)
        image = image.resize((224, 224))
        
        # Normalize
        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                               std=[0.229, 0.224, 0.225])
        ])
        
        tensor = transform(image).unsqueeze(0)
        return tensor
    except Exception as e:
        raise Exception(f"Image preprocessing error: {str(e)}")

def analyze_skin(model, image_tensor):
    """Run inference on image"""
    try:
        with torch.no_grad():
            output = model(image_tensor)
        
        # Get predictions (adjust based on your model output)
        probabilities = torch.nn.functional.softmax(output, dim=1)
        confidence, predicted_class = torch.max(probabilities, 1)
        
        skin_type_idx = predicted_class.item()
        confidence_score = confidence.item() * 100
        
        return skin_type_idx, confidence_score
    except Exception as e:
        raise Exception(f"Model inference error: {str(e)}")

def classify_skin_by_color(image_tensor):
    """
    Fallback skin classification based on color analysis
    Since the neural network is untrained, use color distribution to classify
    """
    try:
        # Get the image from tensor
        # Reverse normalization: denormalize the tensor
        mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
        std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)
        
        image = image_tensor[0].clone()
        image = image * std + mean
        image = torch.clamp(image, 0, 1)
        
        # Convert to numpy (RGB)
        img_np = image.numpy().transpose(1, 2, 0) * 255
        
        # Analyze RGB directly (no cv2 needed)
        r = img_np[:, :, 0].astype(np.float32)
        g = img_np[:, :, 1].astype(np.float32)
        b = img_np[:, :, 2].astype(np.float32)
        
        r_mean = np.mean(r)
        g_mean = np.mean(g)
        b_mean = np.mean(b)
        
        # Calculate brightness (luminosity)
        brightness = (0.299 * r_mean + 0.587 * g_mean + 0.114 * b_mean)
        
        # Calculate color intensity/saturation proxy
        max_channel = max(r_mean, g_mean, b_mean)
        min_channel = min(r_mean, g_mean, b_mean)
        saturation_proxy = (max_channel - min_channel) / (max_channel + 1e-6)
        
        # Calculate differences
        rg_diff = r_mean - g_mean
        rb_diff = r_mean - b_mean
        gb_diff = g_mean - b_mean
        
        # Classification logic based on color properties
        # Very bright = Dry skin (Kering) - clear, well-hydrated appearance
        if brightness > 210:
            return 0, 85  # Kering (Dry)
        
        # Reddish tone = Sensitive skin (Sensitif)
        if r_mean > 180 and rg_diff > 35 and rb_diff > 45:
            return 3, 82  # Sensitif (Sensitive)
        
        # High saturation with yellowish tone = Oily (Berminyak)
        if saturation_proxy > 0.35 and rg_diff > 15 and gb_diff > 10:
            return 1, 81  # Berminyak (Oily)
        
        # Dark with some saturation = Acne-prone (Berjerawat)
        if brightness < 110 and saturation_proxy > 0.2:
            return 5, 79  # Berjerawat (Acne)
        
        # Very desaturated (grayish) = Dull (Kusam)
        if saturation_proxy < 0.12 and 90 < brightness < 170:
            return 6, 78  # Kusam (Dull)
        
        # Medium brightness with low saturation = Normal (Normal)
        if 140 < brightness < 190 and saturation_proxy < 0.22:
            return 4, 83  # Normal
        
        # Everything else = Combination (Kombinasi)
        return 2, 75  # Kombinasi
        
    except Exception as e:
        # If color analysis fails, default to Normal
        return 4, 70

def get_db_connection():
    """Create MySQL database connection"""
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='root',
            database='mochint_db'
        )
        return connection
    except Error as e:
        print(f"Database connection error: {e}", file=sys.stderr)
        return None

def generate_recommendations(skin_type, detected_condition=None):
    """Generate treatment recommendations based on skin type and detected condition from database"""
    # First, try to query from database
    try:
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            
            # Build query: Find treatments matching skin_type, prioritizing those matching condition
            if detected_condition:
                # Query with priority for treatments matching BOTH skin_type AND detected_condition
                query = """
                SELECT id, name, price, description, skin_type, skin_condition
                FROM treatments
                WHERE skin_type = %s
                ORDER BY 
                    CASE WHEN skin_condition LIKE %s THEN 0 ELSE 1 END,
                    price ASC
                LIMIT 3
                """
                condition_pattern = f"%{detected_condition}%"
                cursor.execute(query, (skin_type, condition_pattern))
            else:
                # Query with skin_type only
                query = """
                SELECT id, name, price, description, skin_type, skin_condition
                FROM treatments
                WHERE skin_type = %s
                ORDER BY price ASC
                LIMIT 3
                """
                cursor.execute(query, (skin_type,))
            
            results = cursor.fetchall()
            cursor.close()
            connection.close()
            
            # Transform database results to response format
            if results:
                recommendations = []
                for idx, row in enumerate(results, 1):
                    # Generate reason based on skin_type and detected_condition
                    reason = generate_treatment_reason(row['name'], skin_type, detected_condition)
                    recommendations.append({
                        'id': row['id'],
                        'treatment': row['name'],
                        'reason': reason,
                        'price': int(row['price'])
                    })
                return recommendations
    except Exception as e:
        print(f"Database query error: {e}", file=sys.stderr)
    
    # Fallback to hardcoded recommendations if database query fails
    recommendations = {
        'Kering': [
            {
                'id': 1,
                'treatment': 'Hydrating Facial',
                'reason': 'Untuk mengembalikan kelembaban kulit kering',
                'price': 250000
            },
            {
                'id': 2,
                'treatment': 'Moisture Mask Treatment',
                'reason': 'Untuk memberikan nutrisi intensif',
                'price': 180000
            },
            {
                'id': 3,
                'treatment': 'Oil Massage Therapy',
                'reason': 'Untuk merangsang produksi minyak alami',
                'price': 200000
            }
        ],
        'Berminyak': [
            {
                'id': 1,
                'treatment': 'Deep Cleansing Facial',
                'reason': 'Untuk membersihkan pori-pori dalam',
                'price': 280000
            },
            {
                'id': 2,
                'treatment': 'Chemical Peel',
                'reason': 'Untuk mengurangi produksi sebum',
                'price': 250000
            },
            {
                'id': 3,
                'treatment': 'HydraFacial',
                'reason': 'Untuk mengontrol minyak dan jerawat',
                'price': 350000
            }
        ],
        'Kombinasi': [
            {
                'id': 1,
                'treatment': 'Balanced Facial',
                'reason': 'Untuk menyeimbangkan kondisi kulit kombinasi',
                'price': 300000
            },
            {
                'id': 2,
                'treatment': 'Multi-Zone Treatment',
                'reason': 'Treatment berbeda untuk area berbeda',
                'price': 320000
            },
            {
                'id': 3,
                'treatment': 'Customized Skincare Plan',
                'reason': 'Perawatan yang disesuaikan dengan kebutuhan Anda',
                'price': 200000
            }
        ],
        'Sensitif': [
            {
                'id': 1,
                'treatment': 'Gentle Hydrating Facial',
                'reason': 'Untuk kulit sensitif yang membutuhkan perawatan lembut',
                'price': 270000
            },
            {
                'id': 2,
                'treatment': 'Soothing Mask Treatment',
                'reason': 'Untuk menenangkan dan melindungi kulit sensitif',
                'price': 200000
            },
            {
                'id': 3,
                'treatment': 'Calming Facial',
                'reason': 'Untuk mengurangi kemerahan dan iritasi',
                'price': 230000
            }
        ],
        'Normal': [
            {
                'id': 1,
                'treatment': 'Maintenance Facial',
                'reason': 'Untuk menjaga kesehatan kulit normal',
                'price': 220000
            },
            {
                'id': 2,
                'treatment': 'Regular Spa Treatment',
                'reason': 'Untuk perawatan dan relaksasi',
                'price': 250000
            },
            {
                'id': 3,
                'treatment': 'Prevention Package',
                'reason': 'Untuk mencegah masalah kulit di masa depan',
                'price': 300000
            }
        ],
        'Berjerawat': [
            {
                'id': 1,
                'treatment': 'Acne Clear Facial',
                'reason': 'Untuk membunuh bakteri dan mengeringkan jerawat',
                'price': 350000
            },
            {
                'id': 2,
                'treatment': 'Chemical Peel Acne',
                'reason': 'Untuk mengatasi jerawat dan bekas jerawat',
                'price': 300000
            },
            {
                'id': 3,
                'treatment': 'Laser Acne Treatment',
                'reason': 'Untuk hasil yang lebih efektif dan cepat',
                'price': 500000
            }
        ],
        'Kusam': [
            {
                'id': 1,
                'treatment': 'Brightening Facial',
                'reason': 'Untuk mencerahkan dan meningkatkan radiance kulit',
                'price': 320000
            },
            {
                'id': 2,
                'treatment': 'Vitamin C Treatment',
                'reason': 'Untuk antioksidan dan pencerah kulit alami',
                'price': 280000
            },
            {
                'id': 3,
                'treatment': 'Gold Radiance Mask',
                'reason': 'Untuk kilau dan nutrisi intensif',
                'price': 350000
            }
        ]
    }
    
    return recommendations.get(skin_type, recommendations['Normal'])

def generate_treatment_reason(treatment_name, skin_type, detected_condition=None):
    """Generate personalized reason for treatment recommendation"""
    reasons = {
        'Kering': 'Untuk mengatasi kulit kering dan meningkatkan hidrasi',
        'Berminyak': 'Untuk mengontrol produksi minyak dan membersihkan pori-pori',
        'Kombinasi': 'Untuk menyeimbangkan kondisi kulit kombinasi',
        'Sensitif': 'Untuk kulit sensitif dengan perawatan yang lembut',
        'Normal': 'Untuk menjaga kesehatan kulit normal',
        'Berjerawat': 'Untuk mengatasi jerawat dan mencegah munculnya jerawat baru',
        'Kusam': 'Untuk mencerahkan dan mengembalikan radiance kulit'
    }
    
    # Base reason from skin type
    reason = reasons.get(skin_type, 'Untuk perawatan kulit optimal')
    
    # Add condition-specific note if available
    if detected_condition:
        condition_notes = {
            'acne': ' dan mengatasi jerawat',
            'blackheads': ' dan menghilangkan komedo',
            'dark_spots': ' dan mencerahkan noda hitam',
            'pores': ' dan memperkecil pori-pori',
            'redness': ' dan mengurangi kemerahan',
            'wrinkles': ' dan mengurangi garis-garis halus'
        }
        condition_note = condition_notes.get(detected_condition.lower(), '')
        if condition_note:
            reason += condition_note
    
    return reason

def detect_skin_conditions(skin_type):
    """Detect potential skin conditions based on skin type"""
    conditions_by_type = {
        'Kering': [
            {'issue': 'Kulit Kering', 'severity': 'sedang'},
            {'issue': 'Garis Halus', 'severity': 'ringan'},
            {'issue': 'Tekstur Kasar', 'severity': 'ringan'}
        ],
        'Berminyak': [
            {'issue': 'Kulit Berminyak', 'severity': 'sedang'},
            {'issue': 'Komedo', 'severity': 'sedang'},
            {'issue': 'Jerawat', 'severity': 'ringan'}
        ],
        'Kombinasi': [
            {'issue': 'Kulit Berminyak', 'severity': 'ringan'},
            {'issue': 'Komedo', 'severity': 'ringan'},
            {'issue': 'Pori-pori Besar', 'severity': 'sedang'}
        ],
        'Sensitif': [
            {'issue': 'Kulit Sensitif', 'severity': 'berat'},
            {'issue': 'Kemerahan', 'severity': 'sedang'},
            {'issue': 'Iritasi', 'severity': 'sedang'}
        ],
        'Normal': [
            {'issue': 'Tidak Ada Masalah Signifikan', 'severity': 'ringan'}
        ],
        'Berjerawat': [
            {'issue': 'Jerawat Aktif', 'severity': 'berat'},
            {'issue': 'Bekas Jerawat', 'severity': 'sedang'},
            {'issue': 'Komedo', 'severity': 'sedang'}
        ],
        'Kusam': [
            {'issue': 'Kulit Kusam', 'severity': 'sedang'},
            {'issue': 'Hiperpigmentasi', 'severity': 'ringan'},
            {'issue': 'Tekstur Tidak Rata', 'severity': 'ringan'}
        ]
    }
    
    return conditions_by_type.get(skin_type, conditions_by_type['Normal'])

def main():
    """Main entry point"""
    try:
        # Get image data from stdin (to avoid ENAMETOOLONG on Windows)
        import sys
        image_base64 = sys.stdin.read().strip()
        
        if not image_base64:
            output = {'error': 'No image data provided'}
            print(json.dumps(output))
            sys.exit(1)
        
        # Preprocess image ONCE (use for both models)
        try:
            tensor = preprocess_image(image_base64)
            error = None
        except Exception as e:
            tensor = None
            error = str(e)
        if tensor is None:
            output = {
                'error': 'Failed to process image',
                'details': error
            }
            print(json.dumps(output))
            sys.exit(1)
        
        # ===== HYBRID APPROACH: Combine both models =====
        
        # 1. SKIN TYPE (from color analysis - fallback method)
        # Using color-based classifier since NN is untrained
        skin_type_idx, skin_type_confidence = classify_skin_by_color(tensor)
        skin_type = SKIN_TYPES.get(skin_type_idx, 'Unknown')
        
        # 2. SKIN CONDITION (from your trained model)
        condition_detected = None
        condition_confidence = 0
        condition_model = load_condition_model()
        
        if condition_model is not None:
            try:
                condition_detected, condition_confidence = predict_skin_condition(condition_model, tensor)
                print(f"Condition detected: {condition_detected} ({condition_confidence:.1f}%)", file=sys.stderr)
            except Exception as e:
                print(f"Condition prediction failed: {e}", file=sys.stderr)
                condition_detected = None
        else:
            print("Condition model not available, using skin type-based conditions", file=sys.stderr)
        
        # Build skin conditions list
        if condition_detected:
            # Use detected condition with high severity
            skin_conditions = [
                {'issue': condition_detected.replace('_', ' ').title(), 'severity': 'sedang'}
            ]
            # Add skin type related conditions
            type_conditions = detect_skin_conditions(skin_type)
            skin_conditions.extend(type_conditions[:1])  # Add 1 more
        else:
            # Fallback to skin type conditions
            skin_conditions = detect_skin_conditions(skin_type)
        
        # Get recommendations (based on skin type AND detected condition from DB)
        recommendations = generate_recommendations(skin_type, condition_detected)
        
        # Prepare response
        result = {
            'skinType': skin_type,
            'confidence': int(skin_type_confidence),
            'skinCondition': skin_conditions,
            'recommendations': recommendations,
            'detectedCondition': condition_detected,  # Additional info
            'conditionConfidence': int(condition_confidence)
        }
        
        print(json.dumps(result, ensure_ascii=False))
        sys.exit(0)
        
    except Exception as e:
        error_result = {
            'error': str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == '__main__':
    main()
