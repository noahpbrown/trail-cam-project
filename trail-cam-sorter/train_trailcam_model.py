import os
import json
import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision.datasets as datasets
import torchvision.models as models
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report
import matplotlib.pyplot as plt

# ====== Settings ======
DATA_DIR = '/Users/noahbrown/TrailCamProject/trail-cam-sorter/image_dataset'
NUM_CLASSES = 5
BATCH_SIZE = 32
EPOCHS = 30
LEARNING_RATE = 1e-4
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# ====== Transforms with Augmentation ======
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ====== Dataset ======
dataset = datasets.ImageFolder(DATA_DIR, transform=transform)
train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size
train_set, val_set = torch.utils.data.random_split(dataset, [train_size, val_size])
train_loader = DataLoader(train_set, batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(val_set, batch_size=BATCH_SIZE)

# ====== Model ======
model = models.resnet18(weights='IMAGENET1K_V1')
model.fc = nn.Linear(model.fc.in_features, NUM_CLASSES)
model = model.to(DEVICE)

# ====== Training Tools ======
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE, weight_decay=1e-4)

train_loss_history = []
val_loss_history = []
best_val_loss = float('inf')
patience_counter = 0
PATIENCE = 5

# ====== Training Loop ======
for epoch in range(EPOCHS):
    model.train()
    train_loss = 0.0
    for images, labels in train_loader:
        images, labels = images.to(DEVICE), labels.to(DEVICE)
        outputs = model(images)
        loss = criterion(outputs, labels)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        train_loss += loss.item() * images.size(0)

    train_loss /= len(train_loader.dataset)
    train_loss_history.append(train_loss)

    # ====== Validation ======
    model.eval()
    val_loss = 0.0
    correct = 0
    total = 0
    all_preds, all_labels = [], []

    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            outputs = model(images)
            loss = criterion(outputs, labels)

            val_loss += loss.item() * images.size(0)
            _, predicted = torch.max(outputs, 1)
            correct += (predicted == labels).sum().item()
            total += labels.size(0)

            all_preds += predicted.cpu().tolist()
            all_labels += labels.cpu().tolist()

    val_loss /= len(val_loader.dataset)
    val_loss_history.append(val_loss)
    accuracy = correct / total * 100

    print(f"Epoch {epoch+1}/{EPOCHS} - Train Loss: {train_loss:.4f} - Val Loss: {val_loss:.4f} - Val Acc: {accuracy:.2f}%")

    # ====== Early Stopping ======
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        patience_counter = 0
        torch.save(model.state_dict(), 'trailcam_model_best.pth')
    else:
        patience_counter += 1
        if patience_counter >= PATIENCE:
            print(f"🛑 Early stopping at epoch {epoch+1}")
            break

# ====== Classification Report ======
print('\nClassification Report:')
print(classification_report(all_labels, all_preds, target_names=dataset.classes))

# ====== Save Final Model and Class Index Map ======
torch.save(model.state_dict(), 'trailcam_model_final.pth')
print('\n✅ Model saved as trailcam_model_final.pth')

with open('class_map.json', 'w') as f:
    json.dump(dataset.class_to_idx, f)
print('✅ Class index map saved as class_map.json')

# ====== Plot Loss Curve ======
plt.plot(train_loss_history, label='Train Loss')
plt.plot(val_loss_history, label='Validation Loss')
plt.title('Loss Over Epochs')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.grid(True)
plt.savefig('loss_curve.png')
plt.show()
