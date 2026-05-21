import base64
from PIL import Image
import io

img = Image.new('RGB', (224, 224), color=(150, 120, 100))
buf = io.BytesIO()
img.save(buf, format='PNG')
img_b64 = base64.b64encode(buf.getvalue()).decode()

with open('test_stdin.txt', 'w') as f:
    f.write(img_b64)
