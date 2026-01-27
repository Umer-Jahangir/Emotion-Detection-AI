# Emotion Detection Web App

A **full-stack web application** that detects human emotions from **images, videos, or live webcam feed** using deep learning. Built with **React (Vite + Tailwind CSS)** on the frontend and **Django REST Framework** with **DeepFace** on the backend.

---

## Features

- Upload **images** or **video files** for emotion analysis.
- Capture **real-time webcam frames** and detect emotions continuously.
- **Dominant emotion** detection along with **confidence scores**.
- Aggregated **video emotion summaries** showing the distribution of emotions per frame.
- Responsive, modern **frontend UI** with animated gradients.
- Robust backend error handling for invalid media, missing faces, or API failures.

---

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Lucide Icons

**Backend**
- Django REST Framework
- DeepFace (for emotion detection)
- OpenCV (for video frame extraction)
- Pillow & NumPy
- Python 3.12

---

## Installation

### Backend (Django)

1. Clone the repo:

```bash
git clone https://github.com/Umer-Jahangir/Emotion-Detection-AI.git
cd Emotion-Detection-AI/backend
```
2. Create a virtual environment and install dependencies:
   
 ```bash
 python -m venv venv
 source venv/bin/activate  # Linux/macOS
 venv\Scripts\activate     # Windows
    
 pip install -r requirements.txt
 ```
3. Run the server:
   
```bash
python manage.py runserver
```
### Frontend (React)

1. Navigate to the frontend directory:
   
```bash
cd ../frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the dev server with proxy to Django backend:

```bash
npm run dev
```
---

### Usage

- Click Upload Image → select an image → Analyze.

- Click Upload Video → select a video → Analyze. (Working on it)

- Click Start Webcam → allow camera access → frames analyzed every second. (Working on it)

- Results are displayed as percentages with a primary emotion highlight.

---

### Notes

- Video analysis samples 1 frame per second for performance.

- DeepFace outputs confidence scores; these are normalized for frontend display.

- Ensure TensorFlow and DeepFace versions are compatible (`pip install -r requirements.txt`).

- For local development, Vite frontend uses a proxy to Django backend to prevent CORS issues.

### Future Improvements

- Real-time streaming for longer video durations.

- Emotion timeline visualization for video playback.

- Multiple face detection and analysis.

- Export results as CSV or PDF report.

---

### License

```
MIT License © 2025 Umer Jahangir
```
