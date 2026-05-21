#!/usr/bin/env python3
"""
Debug script to test model outputs
"""
import torch
import torch.nn as nn
from torchvision import models
import os
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, 'mochint_skin_model_final.pth')

SKIN_TYPES = {
    0: 'Kering',
    1: 'Berminyak',
    2: 'Kombinasi',
    3: 'Sensitif',
    4: 'Normal',
    5: 'Berjerawat',
    6: 'Kusam'
}

def load_model():
    """Load PyTorch model - EfficientNet-B0 with 7 skin type classes"""
    try:
        device = torch.device('cpu')
        
        # Create EfficientNet-B0 architecture with 7 classes
        model = models.efficientnet_b0(weights=None)
        
        # Modify classifier for 7 skin types
        num_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(num_features, 7)
        
        # Load state dict from file
        state_dict = torch.load(MODEL_PATH, map_location=device, weights_only=False)
        model.load_state_dict(state_dict)
        
        # Set to evaluation mode
        model.to(device)
        model.eval()
        
        return model, device
    except Exception as e:
        print(f"Error loading model: {e}")
        import traceback
        traceback.print_exc()
        return None, None

def test_with_random_input():
    """Test model with random input"""
    print("Loading model...")
    model, device = load_model()
    
    if model is None:
        print("Failed to load model")
        return
    
    print("✓ Model loaded successfully")
    print(f"Model device: {device}")
    
    # Create random input
    print("\nTesting with random input tensor...")
    random_input = torch.randn(1, 3, 224, 224)
    
    with torch.no_grad():
        output = model(random_input)
    
    print(f"Raw output shape: {output.shape}")
    print(f"Raw output values:\n{output}")
    
    # Apply softmax
    probabilities = torch.nn.functional.softmax(output, dim=1)
    print(f"\nAfter softmax:\n{probabilities}")
    
    # Get max
    confidence, predicted_class = torch.max(probabilities, 1)
    
    print(f"\nPredicted class: {predicted_class.item()}")
    print(f"Predicted skin type: {SKIN_TYPES[predicted_class.item()]}")
    print(f"Confidence: {confidence.item() * 100:.1f}%")
    
    # Check all probabilities
    print(f"\nAll probabilities:")
    for i, prob in enumerate(probabilities[0]):
        print(f"  {SKIN_TYPES[i]}: {prob.item() * 100:.2f}%")
    
    print("\n" + "="*60)
    print("CHECKING MODEL WEIGHTS...")
    
    # Check if classifier weights are non-zero
    classifier_weights = model.classifier[1].weight
    print(f"\nClassifier weight shape: {classifier_weights.shape}")
    print(f"Classifier weight stats:")
    print(f"  Min: {classifier_weights.min():.6f}")
    print(f"  Max: {classifier_weights.max():.6f}")
    print(f"  Mean: {classifier_weights.mean():.6f}")
    print(f"  Std: {classifier_weights.std():.6f}")
    
    # Check if all weights are similar (indicating untrained model)
    if classifier_weights.std() < 0.1:
        print("\n⚠️  WARNING: Classifier weights have very low variance!")
        print("   This suggests the model may not be properly trained.")
    
    # Check classifier bias
    classifier_bias = model.classifier[1].bias
    print(f"\nClassifier bias: {classifier_bias}")

if __name__ == '__main__':
    test_with_random_input()
