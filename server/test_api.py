import requests
import base64
from PIL import Image
import io
import json

img = Image.new('RGB', (224, 224), color=(170, 140, 120))
buf = io.BytesIO()
img.save(buf, format='PNG')
img_b64 = base64.b64encode(buf.getvalue()).decode()

print('Sending request to API...')
try:
    response = requests.post(
        'http://localhost:5000/api/ai/analyze-skin',
        json={'image': img_b64},
        timeout=60
    )
    print(f'Status Code: {response.status_code}')
    print('Response:')
    result = response.json()
    print(json.dumps(result, indent=2, ensure_ascii=False))
    if response.status_code == 200:
        print('\n✅ API Response Complete!')
    else:
        print(f'\n❌ API Error: {result.get("error")}')
except Exception as e:
    print(f'Connection error: {e}')
