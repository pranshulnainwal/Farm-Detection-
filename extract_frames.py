import cv2
import os

video_folder = "videos"
output_folder = "dataset/images/train"

os.makedirs(output_folder, exist_ok=True)

count = 0

for video in os.listdir(video_folder):
    video_path = os.path.join(video_folder, video)
    cap = cv2.VideoCapture(video_path)

    frame_num = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_num % 10 == 0:   # save every 10th frame
            cv2.imwrite(f"{output_folder}/frame_{count}.jpg", frame)
            count += 1

        frame_num += 1

    cap.release()

print("Total frames saved:", count)