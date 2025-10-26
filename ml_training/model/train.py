# Train YOLO model given a dataset with the following structure:
# -> images
#   -> train
#   -> val
# -> labels
#   -> train
#   -> val
# data.yaml

# RUN ON COLAB ONLY. THEN COPY THE .pt FILE IN yolo.

import sys
import os
from ultralytics import YOLO
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from livestream.config import LOCAL_PROJECT_PATH

model = YOLO("yolov8l.pt")

model.train(
    data=LOCAL_PROJECT_PATH + "/model/data/augmented_yolo/data.yaml",
    epochs=50,
    batch=8,
    project=LOCAL_PROJECT_PATH + "/model/yolo/",
    name="yolov8l"
)