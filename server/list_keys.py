import torch
import torchvision.models as models

MODEL_PATH = r'D:\Kuliah\Magang\mochintbeauty\mochintbeauty-app\server\mochint_skin_model_final.pth'

state_dict = torch.load(MODEL_PATH, map_location='cpu')
keys = list(state_dict.keys())
print(f"Total keys: {len(keys)}")
print("First 20 keys:")
for k in keys[:20]:
    print(f"  {k}")

# Check ResNet
if any('layer1' in k for k in keys):
    print("\nLikely a ResNet-based model.")
# Check MobileNet
if any('features' in k for k in keys):
    print("\nLikely a MobileNet-based model.")
# Check for custom classifier
classifier_keys = [k for k in keys if 'classifier' in k or 'fc' in k]
print(f"\nClassifier/FC keys: {classifier_keys}")
