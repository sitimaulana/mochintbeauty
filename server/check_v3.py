import torch
import torchvision.models as models

MODEL_PATH = r'D:\Kuliah\Magang\mochintbeauty\mochintbeauty-app\server\mochint_skin_model_final.pth'

state_dict = torch.load(MODEL_PATH, map_location='cpu')
keys = list(state_dict.keys())

print(f"Total keys: {len(keys)}")
# Check for MobileNetV3 small specifically
model_v3s = models.mobilenet_v3_small()
v3s_keys = set(model_v3s.state_dict().keys())

print(f"Keys in model_v3s: {len(v3s_keys)}")

missing = v3s_keys - set(keys)
extra = set(keys) - v3s_keys

print(f"Missing keys (sample): {list(missing)[:10]}")
print(f"Extra keys (sample): {list(extra)[:10]}")

# Try to see the number of classes
if 'classifier.1.weight' in state_dict:
    print(f"Classifier weight shape: {state_dict['classifier.1.weight'].shape}")
if 'classifier.3.weight' in state_dict:
    print(f"Classifier weight (3) shape: {state_dict['classifier.3.weight'].shape}")
