import os
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import shutil

# === Settings ===
INPUT_DIR = '/Users/noahbrown/TrailCamProject/trail-cam-sorter/input-images'        # Folder of raw images
OUTPUT_DIR = '/Users/noahbrown/TrailCamProject/trail-cam-sorter/sorted-images'      # Will create subfolders here
MODEL_PATH = 'trailcam_model.pth'
CLASS_NAMES = ['coyote', 'deer', 'hog', 'turkey']
CONFIDENCE_THRESHOLD = 0.7

# === Create output folders ===
os.makedirs(OUTPUT_DIR, exist_ok=True)
for cls in CLASS_NAMES + ['other']:
    os.makedirs(os.path.join(OUTPUT_DIR, cls), exist_ok=True)

# === Load model ===
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = models.resnet18(pretrained=False)
model.fc = nn.Linear(model.fc.in_features, len(CLASS_NAMES))
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.eval()
model.to(device)

# === Transform for images ===
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# === Run classification ===
for fname in os.listdir(INPUT_DIR):
    if not fname.lower().endswith(('.jpg', '.jpeg', '.png')):
        continue

    img_path = os.path.join(INPUT_DIR, fname)
    image = Image.open(img_path).convert('RGB')
    image_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(image_tensor)
        probs = torch.softmax(output, dim=1)
        confidence, predicted_idx = torch.max(probs, 1)
        confidence = confidence.item()
        predicted_class = CLASS_NAMES[predicted_idx.item()]

    if confidence < CONFIDENCE_THRESHOLD:
        predicted_class = 'other'

    dest = os.path.join(OUTPUT_DIR, predicted_class, fname)
    shutil.copy(img_path, dest)
    print(f'{fname} → {predicted_class} ({confidence:.2f})')

print('\n✅ All images sorted!')
