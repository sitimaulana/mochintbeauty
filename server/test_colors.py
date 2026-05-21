import base64
from PIL import Image
import io
import subprocess
import json
import os

test_images = [
    ("Kuning Terang (Oily)", (200, 180, 80)),        # High saturation yellow
    ("Coklat Muda (Normal)", (150, 120, 100)),       # Medium tones
    ("Putih Terang (Dry)", (230, 210, 190)),         # Very bright
    ("Coklat Gelap (Acne)", (90, 50, 30)),           # Dark brown
    ("Merah Muda (Sensitive)", (200, 120, 100)),     # Reddish tint
    ("Abu-abu (Dull)", (140, 140, 140)),             # Desaturated
    ("Mix Kombinasi", (160, 130, 90)),               # Mixed tones
]

print("Testing Color-Based Skin Classification")
print("=" * 70)

for desc, rgb in test_images:
    img = Image.new("RGB", (224, 224), color=rgb)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    img_b64 = base64.b64encode(buf.getvalue()).decode()
    
    try:
        result = subprocess.run(
            ["python", "skin_analysis.py"],
            input=img_b64,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        lines = result.stdout.strip().split("\n")
        json_line = None
        for line in lines:
            if line.startswith("{"):
                json_line = line
                break
        
        if json_line:
            data = json.loads(json_line)
            print(f"RGB{rgb}: {desc}")
            print(f"  -> {data.get('skinType', 'Unknown')} ({data.get('confidence', 0)}% confidence)")
        else:
            print(f"RGB{rgb}: {desc} - ERROR: No JSON output")
            if result.stderr:
                print(f"Stderr: {result.stderr[:200]}")
    except Exception as e:
        print(f"RGB{rgb}: {desc} - ERROR: {str(e)[:100]}")

print("\n" + "=" * 70)
print("Test complete")
