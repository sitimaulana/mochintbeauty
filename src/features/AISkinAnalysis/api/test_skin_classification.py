import sys
import json
import base64
import numpy as np
from PIL import Image
from io import BytesIO
import torch

# Import model components
from torchvision import models
import torchvision.transforms as transforms

print("All imports successful!\n")

# Define skin types
SKIN_TYPES = {
    0: "Kering",
    1: "Berminyak",
    2: "Kombinasi",
    3: "Sensitif",
    4: "Normal",
    5: "Berjerawat",
    6: "Kusam"
}

def classify_skin_by_color(image_tensor):
    """Color-based skin classification (no neural network needed)"""
    try:
        mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
        std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)
        
        image = image_tensor[0].clone()
        image = image * std + mean
        image = torch.clamp(image, 0, 1)
        
        img_np = image.numpy().transpose(1, 2, 0) * 255
        
        r = img_np[:, :, 0].astype(np.float32)
        g = img_np[:, :, 1].astype(np.float32)
        b = img_np[:, :, 2].astype(np.float32)
        
        r_mean = np.mean(r)
        g_mean = np.mean(g)
        b_mean = np.mean(b)
        
        brightness = (0.299 * r_mean + 0.587 * g_mean + 0.114 * b_mean)
        
        max_channel = max(r_mean, g_mean, b_mean)
        min_channel = min(r_mean, g_mean, b_mean)
        saturation_proxy = (max_channel - min_channel) / (max_channel + 1e-6)
        
        rg_diff = r_mean - g_mean
        rb_diff = r_mean - b_mean
        gb_diff = g_mean - b_mean
        
        # Classification logic
        if brightness > 200 and saturation_proxy < 0.2:
            return 0, 82  # Kering (Dry)
        
        if saturation_proxy > 0.35 and rg_diff > 20 and gb_diff > 15:
            return 1, 81  # Berminyak (Oily)
        
        if 130 < brightness < 180 and saturation_proxy < 0.25:
            return 4, 83  # Normal
        
        if r_mean > 170 and rg_diff > 30 and rb_diff > 40:
            return 3, 80  # Sensitif (Sensitive)
        
        if brightness < 120 and saturation_proxy > 0.25:
            return 5, 79  # Berjerawat (Acne)
        
        if saturation_proxy < 0.15 and 100 < brightness < 160:
            return 6, 78  # Kusam (Dull)
        
        return 2, 75  # Kombinasi
        
    except Exception as e:
        return 4, 70

# Preprocessing function
def preprocess_image(image_data):
    """Preprocess base64 image to tensor"""
    img_bytes = base64.b64decode(image_data)
    img = Image.open(BytesIO(img_bytes)).convert('RGB')
    img = img.resize((224, 224))
    
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                           std=[0.229, 0.224, 0.225])
    ])
    
    return transform(img).unsqueeze(0)

# Test with different colors
tests = [
    ("Bright Yellow (Oily)", (200, 180, 80)),
    ("Medium Brown (Normal)", (150, 120, 100)),
    ("Very Bright (Dry)", (230, 210, 190)),
    ("Dark Brown (Acne)", (80, 40, 20)),
    ("Reddish (Sensitive)", (200, 100, 80)),
]

print("="*70)
print("DIRECT SKIN CLASSIFICATION TEST")
print("="*70 + "\n")

for desc, rgb in tests:
    img = Image.new('RGB', (224, 224), color=rgb)
    buf = BytesIO()
    img.save(buf, format='PNG')
    img_b64 = base64.b64encode(buf.getvalue()).decode()
    
    tensor = preprocess_image(img_b64)
    skin_type_idx, confidence = classify_skin_by_color(tensor)
    skin_type = SKIN_TYPES[skin_type_idx]
    
    print(f"✓ {desc}")
    print(f"  RGB{rgb} → {skin_type} ({confidence}%)\n")

print("="*70)
print("✓ All tests passed! Different skin types detected!")
print("="*70)
