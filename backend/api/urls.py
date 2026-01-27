# api/urls.py
from django.urls import path
from .views import EmotionAnalyze

urlpatterns = [
    path("emotion/analyze/", EmotionAnalyze.as_view()),  # Handles images + webcam frames
    path("emotion/video/", EmotionAnalyze.as_view()),    # Handles video files
]
