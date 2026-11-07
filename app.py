from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import os
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ---------------- MODEL ----------------

model = YOLO(r"C:\Users\SOMAY\runs\detect\train17\weights\best.pt")

VALID_ANIMALS = ["cow","sheep","pig","horse","chicken"]

# ---------------- HOME ----------------

@app.route("/")
def home():
    return "Flask YOLO API Running"

# ---------------- IMAGE / VIDEO DETECTION ----------------

@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:
        return jsonify({"error":"No file provided"}), 400

    file = request.files["image"]
    filename = file.filename.lower()

    temp_name = f"temp_{uuid.uuid4()}_{filename}"
    file.save(temp_name)

    counts = {a: 0 for a in VALID_ANIMALS}

    try:
        # ---------- IMAGE ----------
        if filename.endswith(("jpg","jpeg","png","webp")):

            image = cv2.imread(temp_name)

            results = model.predict(
                source=image,
                conf=0.4,
                imgsz=640
            )

            boxes = results[0].boxes
            if boxes is not None:
                classes = boxes.cls.cpu().numpy()
                for cls in classes:
                    label = model.names[int(cls)]
                    if label in counts:
                        counts[label] += 1

            source_type = "image"

        # ---------- VIDEO ----------
        elif filename.endswith(("mp4","avi","mov")):

            cap = cv2.VideoCapture(temp_name)
            unique_ids = set()

            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                results = model.track(
                    frame,
                    conf=0.4,
                    iou=0.5,
                    persist=True,
                    tracker="bytetrack.yaml"
                )

                for r in results:
                    boxes = r.boxes
                    if boxes is None or boxes.id is None:
                        continue

                    ids = boxes.id.cpu().numpy()
                    classes = boxes.cls.cpu().numpy()

                    for obj_id, cls in zip(ids, classes):
                        label = model.names[int(cls)]
                        key = (label, int(obj_id))

                        if label in counts and key not in unique_ids:
                            unique_ids.add(key)
                            counts[label] += 1

            cap.release()
            source_type = "video"

        else:
            return jsonify({"error":"Unsupported file type"}), 400

    finally:
        if os.path.exists(temp_name):
            os.remove(temp_name)

    # ---------- REQUIRED FRONTEND FIELDS ----------
    total = sum(counts.values())

    response = {
        "id": str(uuid.uuid4()),
        "source": source_type,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "counts": counts,
        "total": total
    }

    print("Detection:", response)
    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)