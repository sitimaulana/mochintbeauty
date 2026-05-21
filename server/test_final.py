import requests
import base64
from PIL import Image
import io
import json
import time

# Create test image
img = Image.new('RGB', (224, 224), color=(160, 130, 110))
buf = io.BytesIO()
img.save(buf, format='PNG')
img_b64 = base64.b64encode(buf.getvalue()).decode()

print('Wait 3 seconds for server restart...')
time.sleep(3)

print('Testing API...')
try:
    # Use a longer timeout for the client request too
    response = requests.post(
        'http://localhost:5000/api/ai/analyze-skin',
        json={'image': img_b64},
        timeout=120
    )
    
    print(f'Status Code: {response.status_code}')
    if response.status_code == 200:
        result = response.json()
        print(f"Skin Type: {result.get('skinType')}")
        print(f"Confidence: {result.get('confidence')}%")
        print(f"Conditions: {len(result.get('skinCondition', []))} detected")
        print(f"Recommendations: {len(result.get('recommendations', []))} treatments")
        print('\nAPI WORKING!')
    else:
        print(f'Error Status: {response.status_code}')
        print(f'Response: {response.text}')
        
except Exception as e:
    print(f'Error: {e}')
