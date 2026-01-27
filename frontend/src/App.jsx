import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  Smile,
  Frown,
  Meh,
  Heart,
  Zap,
  Sparkles,
  Video
} from "lucide-react";

export default function EmotionDetector() {
  const [mediaType, setMediaType] = useState(null); // "image", "video", "webcam"
  const [file, setFile] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [webcamInterval, setWebcamInterval] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  // List of emotions for UI display
  const emotions = [
    { name: "Happy", icon: Smile, color: "bg-yellow-400", percentage: 0 },
    { name: "Sad", icon: Frown, color: "bg-blue-400", percentage: 0 },
    { name: "Neutral", icon: Meh, color: "bg-gray-400", percentage: 0 },
    { name: "Excited", icon: Zap, color: "bg-purple-400", percentage: 0 },
    { name: "Loving", icon: Heart, color: "bg-pink-400", percentage: 0 }
  ];

  // Handle file input (image or video)
  const handleFileUpload = (e, type) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setMediaType(type);
    setResult(null);

    if (type === "video") {
      setVideoURL(URL.createObjectURL(uploadedFile));
    }
  };

  // Start webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setMediaType("webcam");
      setWebcamActive(true);
      setResult(null);
    } catch (err) {
      console.error("Webcam error:", err);
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    clearInterval(webcamInterval);
    setWebcamActive(false);
    setMediaType(null);
    setFile(null);
    setResult(null);
  };

  // Capture webcam frame and send to backend
  const captureWebcamFrame = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async blob => {
      if (!blob) return;
      await analyzeMedia(blob, "image");
    }, "image/jpeg");
  };

  // Analyze media (image or video) by sending to backend
  const analyzeMedia = async (inputFile, type = mediaType) => {
    setAnalyzing(true);
    try {
      const formData = new FormData();
      if (type === "image" || type === "webcam") {
        formData.append("image", inputFile);
      } else if (type === "video") {
        formData.append("video", inputFile);
      }

      const endpoint = type === "video" ? "/api/emotion/video/" : "/api/emotion/analyze/";

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();


      // Map backend response to emotions array
      let mappedResult = emotions.map(e => ({
        ...e,
        percentage:
          data.scores && data.scores[e.name.toLowerCase()]
            ? Math.round(data.scores[e.name.toLowerCase()])
            : 0
      }));

      // Sort descending
      mappedResult = mappedResult.sort((a, b) => b.percentage - a.percentage);

      setResult(mappedResult);
    } catch (err) {
      console.error("Analysis error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  // For webcam: automatically capture frame every 1 second
  useEffect(() => {
    if (mediaType === "webcam" && webcamActive) {
      const interval = setInterval(captureWebcamFrame, 1000);
      setWebcamInterval(interval);
      return () => clearInterval(interval);
    }
  }, [mediaType, webcamActive]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-pink-500 rounded-full blur-3xl opacity-20 -bottom-48 -right-48 animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-yellow-300 mr-3 animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
              Emotion AI
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-300 ml-3 animate-pulse" />
          </div>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Detect emotions from images, videos, or live webcam feed
          </p>
        </div>

        {/* Input buttons */}
        <div className="flex justify-center gap-6 mb-8">
          <button
            onClick={() => {
              fileInputRef.current.accept = "image/*";
              fileInputRef.current.click();
            }}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-full flex items-center gap-2"
          >
            <Upload className="w-5 h-5" /> Upload Image
          </button>

          <button
            onClick={() => {
              fileInputRef.current.accept = "video/*";
              fileInputRef.current.click();
            }}
            className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-full flex items-center gap-2"
          >
            <Video className="w-5 h-5" /> Upload Video
          </button>

          {!webcamActive ? (
            <button
              onClick={startWebcam}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-full flex items-center gap-2"
            >
              <Camera className="w-5 h-5" /> Start Webcam
            </button>
          ) : (
            <button
              onClick={stopWebcam}
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-full flex items-center gap-2"
            >
              Stop Webcam
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) =>
              handleFileUpload(e, fileInputRef.current.accept.includes("video") ? "video" : "image")
            }
            className="hidden"
          />
        </div>

        {/* Preview / video */}
        {mediaType === "image" && file && (
          <div className="mb-6">
            <img
              src={URL.createObjectURL(file)}
              alt="Uploaded"
              className="mx-auto rounded-2xl max-h-96 object-contain shadow-2xl"
            />
            <button
              onClick={() => setFile(null)}
              className="mt-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full"
            >
              Remove Image
            </button>
            <button
              onClick={() => analyzeMedia(file)}
              disabled={analyzing}
              className="mt-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-full"
            >
              {analyzing ? "Analyzing..." : "Analyze Image"}
            </button>
          </div>
        )}

        {mediaType === "video" && file && videoURL && (
          <div className="mb-6">
            <video src={videoURL} controls className="mx-auto rounded-2xl max-h-96 shadow-2xl" />
            <button
              onClick={() => analyzeMedia(file)}
              disabled={analyzing}
              className="mt-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-full"
            >
              {analyzing ? "Analyzing..." : "Analyze Video"}
            </button>
          </div>
        )}

        {mediaType === "webcam" && webcamActive && (
          <div className="mb-6 flex justify-center">
            <video ref={videoRef} autoPlay className="rounded-2xl max-h-96 shadow-2xl" />
            <p className="mt-2 text-center text-purple-200">Webcam feed (frames analyzed every second)</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 animate-fadeIn">
            <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center">
              <Sparkles className="w-8 h-8 mr-3 text-yellow-300" />
              Emotion Analysis
            </h2>

            <div className="space-y-6">
              {result.map((emotion, index) => {
                const Icon = emotion.icon;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon className="w-6 h-6 mr-3" />
                        <span className="font-semibold text-lg">{emotion.name}</span>
                      </div>
                      <span className="text-xl font-bold">{emotion.percentage}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                      <div
                        className={`${emotion.color} h-full rounded-full transition-all duration-1000 ease-out shadow-lg`}
                        style={{ width: `${emotion.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-center text-purple-200">
                <span className="font-semibold text-white">Primary Emotion: </span>
                {result[0].name} ({result[0].percentage}%)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}