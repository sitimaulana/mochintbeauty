import torch
import sys
import os

MODEL_PATH = r'D:\Kuliah\Magang\mochintbeauty\mochintbeauty-app\server\mochint_skin_model_final.pth'

print(f"Checking {MODEL_PATH}")
if not os.path.exists(MODEL_PATH):
    print("File not found")
    sys.exit(1)

print("Approach 1: torch.load()")
try:
    data = torch.load(MODEL_PATH, map_location='cpu')
    print(f"Type: {type(data)}")
    if hasattr(data, 'eval'):
        print("Result: Full Model Object")
    elif isinstance(data, dict):
        print("Result: State Dict (OrderedDict)")
        print(f"Keys: {list(data.keys())[:5]}")
    else:
        print(f"Result: Other ({type(data)})")
except Exception as e:
    print(f"Error: {e}")

print("\nApproach 2: weights_only=True")
try:
    data = torch.load(MODEL_PATH, map_location='cpu', weights_only=True)
    print("Successful")
except Exception as e:
    print(f"Error: {e}")
