import torch
import torchvision.models as models
import os

MODEL_PATH = r'D:\Kuliah\Magang\mochintbeauty\mochintbeauty-app\server\mochint_skin_model_final.pth'

def check_model():
    print(f"Loading state dict from: {MODEL_PATH}")
    state_dict = torch.load(MODEL_PATH, map_location='cpu')
    
    # Try common architectures
    # MobilenetV2 is common for mobile apps
    print("\nTrying to match keys with MobileNetV2...")
    model_v2 = models.mobilenet_v2()
    try:
        model_v2.load_state_dict(state_dict)
        print("✅ SUCCESS: Matches MobileNetV2 architecture!")
        return
    except Exception as e:
        print(f"❌ MobileNetV2: {str(e)[:100]}...")

    # MobilenetV3 Small
    print("\nTrying to match keys with MobileNetV3 Small...")
    model_v3s = models.mobilenet_v3_small()
    try:
        model_v3s.load_state_dict(state_dict)
        print("✅ SUCCESS: Matches MobileNetV3 Small architecture!")
        return
    except Exception as e:
        print(f"❌ MobileNetV3 Small: {str(e)[:100]}...")

    # MobilenetV3 Large
    print("\nTrying to match keys with MobileNetV3 Large...")
    model_v3l = models.mobilenet_v3_large()
    try:
        model_v3l.load_state_dict(state_dict)
        print("✅ SUCCESS: Matches MobileNetV3 Large architecture!")
        return
    except Exception as e:
        print(f"❌ MobileNetV3 Large: {str(e)[:100]}...")

check_model()
