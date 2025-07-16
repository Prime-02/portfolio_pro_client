"use client";

import { useRef, useState, useEffect } from "react";
import Button from "../buttons/Buttons";
import { CameraIcon, CheckIcon, RotateCwIcon } from "lucide-react";

interface PhotoCaptureProps {
  onPhotoTaken?: (photoData: string) => void;
  loading?: boolean;
}

export default function PhotoCapture({
  onPhotoTaken,
  loading = false,
}: PhotoCaptureProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Start camera automatically when component mounts
    const startCamera = async () => {
      try {
        setError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setIsCameraActive(true);
        }
      } catch (err) {
        setError("Could not access the camera. Please check permissions.");
        console.error("Camera error:", err);
      }
    };

    startCamera();

    // Cleanup function to stop camera when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set canvas dimensions to match video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoDataUrl = canvas.toDataURL("image/jpeg");
      setPhoto(photoDataUrl);
      stopCamera();
    }
  };

  const confirmPhoto = () => {
    if (photo && onPhotoTaken) {
      onPhotoTaken(photo);
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    // Restart camera when retaking photo
    const restartCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setIsCameraActive(true);
        }
      } catch (err) {
        setError("Could not access the camera. Please check permissions.");
        console.error("Camera error:", err);
      }
    };
    restartCamera();
  };

  return (
    <div className="flex flex-col items-center gap-4 max-w-[500px] mx-auto">
      {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

      {!photo ? (
        <div className="w-full flex flex-col items-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full max-h-[400px] bg-black ${isCameraActive ? "block" : "hidden"}`}
          />
          <canvas ref={canvasRef} className="hidden" />

          {isCameraActive && (
            <div className="w-full flex justify-center mt-4">
              <Button onClick={capturePhoto} icon={<CameraIcon />} />
            </div>
          )}
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <img
            src={photo}
            alt="Captured"
            className="w-full max-h-[400px] object-contain"
          />
          <div className="flex gap-4 mt-4">
            <Button
              onClick={retakePhoto}
              variant="danger"
              icon={<RotateCwIcon />}
            />
            <Button
              onClick={confirmPhoto}
              loading={loading}
              disabled={loading}
              icon={<CheckIcon />}
              text="Confirm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
