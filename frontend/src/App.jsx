import React, { useState, useRef } from 'react';
import { Camera, Upload, Smile, Frown, Meh, Heart, Zap, Sparkles } from 'lucide-react';

export default function EmotionDetector() {
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const emotions = [
    { name: 'Happy', icon: Smile, color: 'bg-yellow-400', percentage: 0 },
    { name: 'Sad', icon: Frown, color: 'bg-blue-400', percentage: 0 },
    { name: 'Neutral', icon: Meh, color: 'bg-gray-400', percentage: 0 },
    { name: 'Excited', icon: Zap, color: 'bg-purple-400', percentage: 0 },
    { name: 'Loving', icon: Heart, color: 'bg-pink-400', percentage: 0 },
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeEmotion = () => {
    setAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockResults = emotions.map(emotion => ({
        ...emotion,
        percentage: Math.floor(Math.random() * 100)
      }));
      
      // Normalize to 100%
      const total = mockResults.reduce((sum, e) => sum + e.percentage, 0);
      const normalized = mockResults.map(e => ({
        ...e,
        percentage: Math.round((e.percentage / total) * 100)
      }));
      
      setResult(normalized.sort((a, b) => b.percentage - a.percentage));
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      {/* Animated background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-pink-500 rounded-full blur-3xl opacity-20 -bottom-48 -right-48 animate-pulse" style={{animationDelay: '1s'}}></div>
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
            Discover the emotions in your photos using advanced AI technology
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Upload Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 mb-8">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            
            {!image ? (
              <div
                onClick={() => fileInputRef.current.click()}
                className="border-4 border-dashed border-purple-300/50 rounded-2xl p-12 text-center cursor-pointer hover:border-purple-300 hover:bg-white/5 transition-all duration-300"
              >
                <Upload className="w-16 h-16 mx-auto mb-4 text-purple-300" />
                <h3 className="text-2xl font-semibold mb-2">Upload an Image</h3>
                <p className="text-purple-200">Click to select a photo or drag and drop</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={image}
                    alt="Uploaded"
                    className="w-full h-auto max-h-96 object-contain bg-black/20"
                  />
                  <button
                    onClick={() => {
                      setImage(null);
                      setResult(null);
                    }}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                  >
                    Remove
                  </button>
                </div>
                
                <button
                  onClick={analyzeEmotion}
                  disabled={analyzing}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {analyzing ? (
                    <>
                      <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Analyzing Emotions...
                    </>
                  ) : (
                    <>
                      <Camera className="w-6 h-6 mr-3" />
                      Detect Emotions
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Results Section */}
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
                          style={{
                            width: `${emotion.percentage}%`,
                            animationDelay: `${index * 100}ms`
                          }}
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

        {/* Footer */}
        <div className="text-center mt-12 text-purple-300">
          <p className="text-sm">Powered by AI • Detecting emotions with precision</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}