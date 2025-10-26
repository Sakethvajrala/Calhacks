import mss
import numpy as np
import cv2
import torch
from time import time, sleep, strftime
from livestream.config import LIVESTREAM_REGION, CAPTURE_INTERVAL, LOCAL_PROJECT_PATH, CAPTURE_LENGTH, CAPTURE_MODEL
import json
from datetime import datetime
import os
from ultralytics import YOLO
import base64

def run_yolo_loop():
    # Continuously captures LIVESTREAM_REGION and runs YOLO.

    model_path = LOCAL_PROJECT_PATH + "model/yolo/" + CAPTURE_MODEL + ".pt"
    # model = torch.hub.load(
    #     'ultralytics/yolov5',  # This is the actual YOLOv5 repo
    #     'custom',              # tells it this is a user-supplied model
    #     path=model_path,
    #     force_reload=True
    # )

    model = YOLO(model_path)

    timestamp = strftime("%Y-%m-%d_%H-%M-%S")

    frames_dir = LOCAL_PROJECT_PATH + f"frames/{timestamp}/"
    os.makedirs(frames_dir, exist_ok=True)
    log_filename = LOCAL_PROJECT_PATH + f"logs/{timestamp}.json"

    with mss.mss() as sct:
        monitor = {
            'top': LIVESTREAM_REGION[0],
            'left': LIVESTREAM_REGION[1],
            'width': LIVESTREAM_REGION[2],
            'height': LIVESTREAM_REGION[3]
        }

        all_detections = []

        s = time()
        frame_idx = 0
        while True:
            t = time()
            frame_idx += 1

            shot = sct.grab(monitor)

            # Uncomment this block to save results locally for debugging.
            #mss.tools.to_png(shot.rgb, shot.size, output='/Users/rohankosalge/Downloads/liveshot.png')
            #print('livestream screenshot saved locally.')

            img = np.array(shot)
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Save raw frame for video recreation
            frame_name = os.path.join(frames_dir, f"frame_{frame_idx:06d}.jpg")
            cv2.imwrite(frame_name, img)


            results = model(img)

            #frame_data = results.pandas().xyxy[0].to_dict(orient='records')
            
            frame_data = []

            for r in results:
                boxes = r.boxes  # r.boxes contains all detected boxes
                for box in boxes:
                    # Convert to dictionary
                    frame_data.append({
                        "xmin": int(box.xyxy[0][0]),
                        "ymin": int(box.xyxy[0][1]),
                        "xmax": int(box.xyxy[0][2]),
                        "ymax": int(box.xyxy[0][3]),
                        "confidence": float(box.conf[0]),
                        "name": model.names[int(box.cls[0])]
                    })
            
            all_detections.append({
                "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3], ## HH:MM:SS.mmm
                "detections": frame_data,
                "image_path": frame_name
            })

            # Uncomment this block to (beta-test) live rendering.
            # results.render()
            # out = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
            # cv2.imshow('YOLO Livestream', out)

            # Uncomment this block to display results for debugging/demo.
            # results.render()
            # out = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
            # cv2.imshow('res', out)

            print('fps: {}'.format(1 / (time() - t)))

            # If the ESC key is pressed, capturing ends.
            # if cv2.waitKey(1) == 27:
            #     break

            e = time()
            if e - s > CAPTURE_LENGTH:
                break

            if CAPTURE_INTERVAL > 0:
                sleep(CAPTURE_INTERVAL)
    
    # Save to our list of logs.
    # Current ID is simply the timestamp - i.e. "logs/Y-m-d_H-M-S.json"
    with open(log_filename, 'w') as log_file:
        json.dump(all_detections, log_file, indent=4)


    cv2.destroyAllWindows()
    return timestamp


def replay_yolo_footage(timestamp, fps=20):
    # Recreates YOLO footage from JSON + saved frames.
    # timestamp is in form "Y-M-D_H-M-S,json"

    log_path = LOCAL_PROJECT_PATH + f"logs/{timestamp}.json"
    frames_dir = LOCAL_PROJECT_PATH + f"frames/{timestamp}/"

    with open(log_path, "r") as f:
        frames_data = json.load(f)
    
    delay = int(1000 / fps)  # OpenCV waitKey delay in ms per frame

    for frame_entry in frames_data:
        frame_path = frame_entry.get("image_path")
        frame_path = os.path.join(frames_dir, frame_path)
        
        if not os.path.exists(frame_path):
            print(f"Frame not found: {frame_path}")
            continue
        
        frame = cv2.imread(frame_path)
        if frame is None:
            continue
        
        # Draw detections
        for det in frame_entry["detections"]:
            x1, y1, x2, y2 = map(int, [det["xmin"], det["ymin"], det["xmax"], det["ymax"]])
            label = f"{det['name']} {det['confidence']:.2f}"
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Show frame
        cv2.imshow("YOLO Replay", frame)
        key = cv2.waitKey(delay)
    
    cv2.destroyAllWindows()


def clean_log(timestamp, confidence_threshold):

    # Produces a "cleaned" version of a log given a confidence threshold.
    log_path = LOCAL_PROJECT_PATH + f"logs/{timestamp}.json"
    image_folder_path = LOCAL_PROJECT_PATH + f"frames/{timestamp}/"

    # Load / open JSON file
    with open(log_path, "r") as f:
        raw = json.load(f)

    cleaned = []

    for i in range(len(raw)):
        frame = raw[i]
        if not frame["detections"]: continue # just skip frames w/o detections
        
        detections = [detection for detection in frame["detections"] if (detection["confidence"] >= confidence_threshold and ("stain" in detection["name"] or detection["name"] == "crack" or detection["name"] == "roof-damage"))]
        if not detections: continue
        with open(image_folder_path + "frame_"+f"{i:06d}.jpg", "rb") as img_file:
            encoded_string = base64.b64encode(img_file.read()).decode("utf-8")
        
        cleaned.append({"timestamp": frame["timestamp"],
                        "detections": detections,
                        "image_base64": encoded_string})

    cleaned_log_path = LOCAL_PROJECT_PATH + f"cleaned_logs/{timestamp}.json"
    with open(cleaned_log_path, "w") as f:
        json.dump(cleaned, f, indent=4)

    print('before', len(raw))
    print('after', len(cleaned))