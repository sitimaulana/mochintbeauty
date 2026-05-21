import base64
from PIL import Image
import io
import json
import requests
import time

# Create test image
img = Image.new('RGB', (224, 224), color=(150, 120, 100))
buf = io.BytesIO()
img.save(buf, format='PNG')
img_b64 = base64.b64encode(buf.getvalue()).decode()

print(f"Image size: {len(img_b64)} bytes")
print(f"Starting test at {time.strftime('%H:%M:%S')}")

try:
    start = time.time()
    response = requests.post(
        'http://localhost:5000/api/ai/analyze-skin',
        json={'image': img_b64},
        timeout=90  # Increase to 90 seconds
    )
    elapsed = time.time() - start
    
    print(f"Response received in {elapsed:.1f} seconds")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Success! Skin Type: {result.get('skinType')}")
        print(f"  Confidence: {result.get('confidence')}%")
        print(f"  Conditions: {len(result.get('skinCondition', []))} issues")
        print(f"  Recommendations: {len(result.get('recommendations', []))} treatments")
    else:
        print(f"Error response: {response.text}")
        
except requests.exceptions.Timeout:
    print(f"Timeout after 90 seconds - process is still running")
except requests.exceptions.ConnectionError as e:
    print(f"Connection Error: Server not running on port 5000")
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
