import React from 'react';
import {
  Camera,
  Loader,
  RotateCcw,
  Upload,
  AlertCircle,
  X,
  CheckCircle
} from 'lucide-react';
import { BOUNDING_BOX } from '../constants';

const CameraModule = ({
  videoRef,
  canvasRef,
  cameraActive,
  faceDetected,
  faceInBox,
  error,
  useCamera,
  onCapture,
  onRefreshCamera,
  onToggleMode,
  onBrowseFile,
  fileInputRef
}) => {
  if (!useCamera) {
    return null;
  }

  return (
    <>
      {/* Camera Mode - Video Element with Bounding Box */}
      <div className="relative">
        <div className="relative bg-black rounded-xl overflow-hidden">
          {/* Video */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 object-cover rounded-xl bg-black"
            style={{ transform: 'scaleX(-1)' }}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Static Box-Shaped Face Guide */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              style={{
                width: `${BOUNDING_BOX.WIDTH}px`,
                height: `${BOUNDING_BOX.HEIGHT}px`,
                border: faceDetected && faceInBox
                  ? `${BOUNDING_BOX.SUCCESS_BORDER_WIDTH}px solid ${BOUNDING_BOX.SUCCESS_COLOR}`
                  : `${BOUNDING_BOX.ERROR_BORDER_WIDTH}px solid ${BOUNDING_BOX.ERROR_COLOR}`,
                transition: 'border-color 200ms, box-shadow 200ms',
                boxShadow: faceDetected && faceInBox
                  ? '0 0 20px rgba(16, 185, 129, 0.6), inset 0 0 20px rgba(16, 185, 129, 0.2)'
                  : 'none'
              }}
            />
          </div>

          {/* Status Notification */}
          <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
            {!faceDetected && (
              <div className="text-xs text-white bg-red-500/80 px-3 py-1 rounded-full">
                ✗ Posisikan wajah
              </div>
            )}
            {faceDetected && !faceInBox && (
              <div className="text-xs text-white bg-red-500/80 px-3 py-1 rounded-full">
                Posisikan wajah anda kedalam kotak!
              </div>
            )}
            {faceDetected && faceInBox && (
              <div className="text-xs text-white bg-green-500/80 px-3 py-1 rounded-full animate-pulse">
                Siap ambil foto
              </div>
            )}
          </div>

          {/* Bounding Box dengan Corners */}
          <div className="absolute inset-0 rounded-xl pointer-events-none">
            {/* Corner Top Left */}
            <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-white"></div>
            {/* Corner Top Right */}
            <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-white"></div>
            {/* Corner Bottom Left */}
            <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-white"></div>
            {/* Corner Bottom Right */}
            <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-white"></div>

            {/* Grid Mesh */}
            <svg
              className="absolute inset-0 w-full h-full"
              style={{ opacity: 0.3 }}
            >
              {/* Vertical Lines */}
              <line
                x1="33%"
                y1="0"
                x2="33%"
                y2="100%"
                stroke="white"
                strokeWidth="1"
              />
              <line
                x1="66%"
                y1="0"
                x2="66%"
                y2="100%"
                stroke="white"
                strokeWidth="1"
              />
              {/* Horizontal Lines */}
              <line
                x1="0"
                y1="33%"
                x2="100%"
                y2="33%"
                stroke="white"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="66%"
                x2="100%"
                y2="66%"
                stroke="white"
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* Show loading message while camera initializing */}
          {!cameraActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
              <div className="text-center">
                <Loader className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                <p className="text-white text-sm">Mengaktifkan kamera...</p>
              </div>
            </div>
          )}
        </div>

        {/* Capture/Stop Buttons */}
        {cameraActive && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={onCapture}
              disabled={!faceInBox}
              className={`flex-1 py-3 px-4 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                faceInBox
                  ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
              }`}
            >
              <Camera className="w-5 h-5" />
              Ambil Foto
            </button>
            <button
              onClick={onRefreshCamera}
              className="py-3 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
              title="Refresh kamera"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={onToggleMode}
              className="flex-1 py-3 px-4 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all"
            >
              Batal
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CameraModule;
