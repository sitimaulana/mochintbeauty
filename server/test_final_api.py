import base64
from PIL import Image
import io
import json
import requests

# Create test image
img = Image.new('RGB', (224, 224), color=(150, 120, 100))
buf = io.BytesIO()
img.save(buf, format='PNG')
img_b64 = base64.b64encode(buf.getvalue()).decode()

# Test API endpoint
print('Connecting to http://localhost:5000/api/ai/analyze-skin...')
try:
    response = requests.post(
        'http://localhost:5000/api/ai/analyze-skin',
        json={'image': img_b64},
        timeout=65
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
except requests.exceptions.ConnectionError as e:
    print(f"Connection Error: {e}")
    print("Server may not be running on port 5000")
except Exception as e:
    print(f"Error: {e}")
