import os
import random
import zipfile
import yaml
from tqdm import tqdm
from PIL import Image
from pathlib import Path
import shutil

# === CONFIG ===
zip_path = "/Users/rohankosalge/Downloads/augmented/augmented"  # full path to your zip
output_dir = "/Users/rohankosalge/Downloads/augmented_yolo"  # where to save the YOLO dataset
train_split = 0.8  # 80% train / 20% val
class_names = ["algae", "major_crack", "minor_crack", "peeling", "plain", "spalling", "stain"]


shutil.copytree(zip_path, output_dir, dirs_exist_ok=True)


# === SETUP TRAIN/VAL STRUCTURE ===
train_img_dir = os.path.join(output_dir, "images/train")
val_img_dir = os.path.join(output_dir, "images/val")
train_lbl_dir = os.path.join(output_dir, "labels/train")
val_lbl_dir = os.path.join(output_dir, "labels/val")

for d in [train_img_dir, val_img_dir, train_lbl_dir, val_lbl_dir]:
    os.makedirs(d, exist_ok=True)

# === GENERATE BOXES & SPLIT ===
print("🔧 Creating YOLO labels and splitting dataset...")
for cls_idx, cls_name in enumerate(class_names):
    class_dir = os.path.join(output_dir, cls_name)
    if not os.path.exists(class_dir):
        print(f"⚠️  Warning: Folder '{class_dir}' not found — skipping.")
        continue

    images = [f for f in os.listdir(class_dir) if f.lower().endswith(('.jpg', '.png', '.jpeg'))]
    if not images:
        print(f"⚠️  No images found in '{cls_name}', skipping.")
        continue

    random.shuffle(images)
    split_idx = int(len(images) * train_split)
    train_imgs = images[:split_idx]
    val_imgs = images[split_idx:]

    for img_set, dest_img_dir, dest_lbl_dir in [
        (train_imgs, train_img_dir, train_lbl_dir),
        (val_imgs, val_img_dir, val_lbl_dir)
    ]:
        for img_name in tqdm(img_set, desc=f"{cls_name}"):
            src_path = os.path.join(class_dir, img_name)
            dest_img_path = os.path.join(dest_img_dir, img_name)
            shutil.copy(src_path, dest_img_path)

            # Generate approximate bounding box (covers most of the image)
            with Image.open(src_path) as img:
                w, h = img.size
                x_center, y_center = 0.5, 0.5
                box_w, box_h = 0.9, 0.9

            label_path = os.path.splitext(img_name)[0] + ".txt"
            with open(os.path.join(dest_lbl_dir, label_path), "w") as f:
                f.write(f"{cls_idx} {x_center} {y_center} {box_w} {box_h}\n")

    # remove original class folders
    shutil.rmtree(class_dir)

# === YAML FILE ===
yaml_data = {
    "train": os.path.abspath(train_img_dir),
    "val": os.path.abspath(val_img_dir),
    "nc": len(class_names),
    "names": class_names
}

yaml_path = os.path.join(output_dir, "data.yaml")
with open(yaml_path, "w") as f:
    yaml.dump(yaml_data, f)

print("\n✅ YOLO dataset created successfully!")
print(f"📄 YAML file: {yaml_path}")
print(f"🖼️ Train images: {len(os.listdir(train_img_dir))}")
print(f"🖼️ Val images: {len(os.listdir(val_img_dir))}")
