import cv2
import numpy as np
import tempfile
from collections import Counter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from deepface import DeepFace
from PIL import Image

class EmotionAnalyze(APIView):
    """
    Handles:
    - Image upload
    - Video file upload
    - Webcam frames (sent as image)
    """
    parser_classes = [MultiPartParser]

    def post(self, request):
        image_file = request.FILES.get("image")
        video_file = request.FILES.get("video")

        if image_file:
            return self.analyze_image(image_file)
        elif video_file:
            return self.analyze_video(video_file)
        else:
            return Response({"error": "No media provided"}, status=400)

    def analyze_image(self, image_file):
        try:
            img = Image.open(image_file).convert("RGB")
            img_np = np.array(img)

            # DeepFace analysis
            result = DeepFace.analyze(img_np, actions=["emotion"], enforce_detection=False)[0]

            # Format response
            response = {
                "dominant_emotion": result["dominant_emotion"],
                "scores": result["emotion"]  # {happy: 0.7, sad: 0.1, ...}
            }
            return Response(response)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def analyze_video(self, video_file):
        try:
            # Save video temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
                for chunk in video_file.chunks():
                    tmp.write(chunk)
                video_path = tmp.name

            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                return Response({"error": "Unable to open video"}, status=500)

            fps = int(cap.get(cv2.CAP_PROP_FPS)) or 1
            frame_count = 0
            emotions_list = []

            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                # Sample 1 frame per second
                if frame_count % fps == 0:
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    try:
                        result = DeepFace.analyze(rgb_frame, actions=["emotion"], enforce_detection=False)[0]
                        emotions_list.append(result["dominant_emotion"])
                    except:
                        pass  # skip frames with no face

                frame_count += 1

            cap.release()

            if not emotions_list:
                return Response({"error": "No faces detected in video"}, status=400)

            # Aggregate emotions
            summary = Counter(emotions_list)
            dominant = summary.most_common(1)[0][0]

            return Response({
                "dominant_emotion": dominant,
                "timeline": summary,  # e.g., {"Happy": 10, "Neutral": 3, "Sad": 2}
                "total_frames": len(emotions_list)
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)
