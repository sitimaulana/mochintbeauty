import base64
from PIL import Image
import io
import subprocess
import json

test_images = [
    ("Kuning (Oily - Berminyak)", (200, 180, 80)),
    ("Coklat (Normal)", (150, 120, 100)),
    ("Putih Terang (Dry - Kering)", (230, 210, 190)),
    ("Coklat Gelap (Acne - Berjerawat)", (90, 50, 30)),
    ("Merah (Sensitive - Sensitif)", (200, 120, 100)),
    ("Abu-abu (Dull - Kusam)", (120, 120, 120)),
    ("Mix Kombinasi", (160, 130, 90)),
]

print("\n" + "="*70)
print("TESTING COLOR-BASED SKIN CLASSIFICATION")
print("="*70)

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
            timeout=15
        )
        
        lines = result.stdout.strip().split("\n")
        json_line = None
        for line in lines:
            if line.strip().startswith("{") and line.strip().endswith("}"):
                json_line = line
                break
        
        if json_line:
            data = json.loads(json_line)
            skin_type = data.get("skinType", "Unknown")
            conf = data.get("confidence", 0)
            print(f"{desc}")
            print(f"  RGB{rgb} -> {skin_type} ({conf}%)\n")
        else:
            print(f"{desc}: ERROR - No JSON response")
            if result.stderr:
                print(f"  Error: {result.stderr[:200]}\n")
            else:
                print(f"  Stdout: {result.stdout[:200]}\n")
    except Exception as e:
        print(f"{desc}: FAILED - {str(e)[:70]}\n")

print("="*70)
print("Check if different RGB values produce different skin types!")
print("="*70 + "\n")
